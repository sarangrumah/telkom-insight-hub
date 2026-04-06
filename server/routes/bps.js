import express from 'express';
import BPSDataService from '../services/bpsDataService.js';
import BPSAPIFetcherService from '../services/bpsAPIFetcherService.js';
import BPSDataNormalizerService from '../services/bpsDataNormalizerService.js';
import { requireVerifiedCompany } from '../middleware/accessControl.js';
import { query } from '../db.js';

const router = express.Router();

// Initialize services
const bpsDataService = new BPSDataService();
const bpsAPIFetcher = new BPSAPIFetcherService();
const bpsNormalizer = new BPSDataNormalizerService();

// =============================================================================
// HEALTH AND CONFIGURATION ENDPOINTS
// =============================================================================

/**
 * Health check for BPS service
 * GET /panel/api/bps/health
 */
router.get('/health', async (req, res) => {
  try {
    const [dbTest, apiTest] = await Promise.all([
      bpsDataService.testDatabaseConnection(),
      bpsAPIFetcher.testConnection()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbTest,
        bps_api: apiTest
      },
      rateLimitStatus: bpsAPIFetcher.getRateLimitStatus()
    };

    // Determine overall health status
    const isHealthy = dbTest.success && (apiTest.success || apiTest.status < 500);
    health.status = isHealthy ? 'healthy' : 'unhealthy';

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get BPS configuration
 * GET /panel/api/bps/config
 */
router.get('/config', async (req, res) => {
  try {
    const result = await bpsDataService.getConfig();
    
    if (result.success) {
      // Don't expose API key in response
      const config = result.data;
      if (config) {
        config.api_key = config.api_key ? '***CONFIGURED***' : null;
      }
      
      res.json({
        success: true,
        data: config
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update BPS configuration
 * POST /panel/api/bps/config
 */
router.post('/config', async (req, res) => {
  try {
    const { config_name = 'default_bps_config', api_key, base_url, rate_limit_per_hour } = req.body;

    if (!api_key) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // If api_key is the masked placeholder, keep the existing key from database
    let finalApiKey = api_key;
    if (api_key === '***CONFIGURED***' || api_key.includes('•')) {
      const existing = await bpsDataService.getConfig();
      if (existing.success && existing.data?.api_key && existing.data.api_key !== '***CONFIGURED***') {
        finalApiKey = existing.data.api_key;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid API key'
        });
      }
    }

    const result = await bpsDataService.updateConfig({
      config_name,
      api_key: finalApiKey,
      base_url: base_url || 'https://webapi.bps.go.id/v1/api/view',
      rate_limit_per_hour: rate_limit_per_hour || 1000
    });

    if (result.success && result.data) {
      res.json({
        success: true,
        message: 'BPS configuration updated successfully',
        data: {
          config_name: result.data.config_name,
          base_url: result.data.base_url,
          rate_limit_per_hour: result.data.rate_limit_per_hour,
          is_active: result.data.is_active
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to update configuration'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// AREAS AND VARIABLES MANAGEMENT
// =============================================================================

/**
 * Get monitored areas
 * GET /panel/api/bps/areas
 * Query params: ?type=province|district&active=true
 */
router.get('/areas', async (req, res) => {
  try {
    const { type, active } = req.query;
    
    const filters = {};
    if (type) filters.areaType = type;
    if (active !== undefined) filters.isActive = active === 'true';

    const result = await bpsDataService.getMonitoredAreas(filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count,
        filters: filters
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Add monitored area
 * POST /panel/api/bps/areas
 */
router.post('/areas', async (req, res) => {
  try {
    const { area_code, area_name, area_type, parent_area_code, priority_level = 1 } = req.body;

    if (!area_code || !area_name || !area_type) {
      return res.status(400).json({
        success: false,
        error: 'area_code, area_name, and area_type are required'
      });
    }

    if (!['province', 'district'].includes(area_type)) {
      return res.status(400).json({
        success: false,
        error: 'area_type must be either "province" or "district"'
      });
    }

    const result = await bpsDataService.addMonitoredArea({
      area_code,
      area_name,
      area_type,
      parent_area_code,
      priority_level
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Monitored area added successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * Fetch areas from BPS API and sync to database
 * POST /panel/api/bps/areas/sync
 * Any authenticated user can sync areas (public BPS data)
 */
router.post('/areas/sync', async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    // Get configuration
    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({
        success: false,
        error: 'BPS API key not configured'
      });
    }

    console.log('Starting BPS area sync process...');
    
    // Fetch and sync areas
    const syncResult = await bpsAPIFetcher.fetchAndSyncAreas(config.data.api_key);

    if (syncResult.success) {
      res.json({
        success: true,
        message: 'BPS areas synced successfully',
        data: syncResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: syncResult.error,
        details: syncResult.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
 }
});

/**
 * Test BPS areas endpoint
 * GET /panel/api/bps/areas/test
 */
router.get('/areas/test', requireVerifiedCompany, async (req, res) => {
  console.log('BPS areas/test endpoint called');
  console.log('Authorization header:', req.headers.authorization);
  console.log('User from middleware:', req.user);
  
  // Check if user is authenticated
  if (!req.user) {
    console.log('BPS areas/test: Authentication failed - no user');
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  console.log('BPS areas/test: Authentication successful for user:', req.user.sub);
  
  // Check if user has permission to manage BPS data
  if (!req.accessLevel?.can_manage_company && !req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to test BPS areas',
      message: 'You do not have permission to perform this action'
    });
  }
  
  try {
    // Get configuration
    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({
        success: false,
        error: 'BPS API key not configured'
      });
    }

    console.log('Testing BPS areas endpoint...');
    
    // Fetch areas without syncing
    const fetchResult = await bpsAPIFetcher.fetchAreas(config.data.api_key);

    if (fetchResult.success) {
      // Process the data to show what would be synced
      const areas = bpsAPIFetcher.processAreaData(fetchResult.data);
      
      res.json({
        success: true,
        message: 'BPS areas endpoint test successful',
        data: {
          totalAreas: areas.length,
          areas: areas.slice(0, 10), // Show first 10 areas
          sampleResponse: fetchResult.data
        },
        meta: fetchResult.meta
      });
    } else {
      res.status(500).json({
        success: false,
        error: fetchResult.error,
        details: fetchResult.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get BPS variables
 * GET /panel/api/bps/variables
 * Query params: ?active=true&category=Economy
 */
router.get('/variables', async (req, res) => {
  try {
    const { active, category } = req.query;
    
    const filters = {};
    if (active !== undefined) filters.isActive = active === 'true';
    if (category) filters.category = category;

    const result = await bpsDataService.getVariables(filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count,
        filters: filters
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get available periods for a variable in a domain
 * GET /panel/api/bps/periods?domain=3300&var=985
 * Returns available years and sub-periods (monthly/quarterly/semester)
 */
router.get('/periods', async (req, res) => {
  try {
    const { domain = '0000', var: varId } = req.query;
    if (!varId) return res.status(400).json({ success: false, error: 'var parameter is required' });

    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({ success: false, error: 'BPS API key not configured' });
    }

    const axios = (await import('axios')).default;
    const baseUrl = 'https://webapi.bps.go.id/v1/api';

    // Fetch data for a recent year to discover available periods and year range
    // Try years from newest to oldest to find one with data
    let periodInfo = null;
    for (const thVal of [124, 123, 122, 121, 120]) {
      const url = `${baseUrl}/list/model/data/lang/ind/domain/${domain}/var/${varId}/th/${thVal}/key/${config.data.api_key}`;
      try {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' }
        });
        const d = response.data;
        const dc = d.datacontent;
        const hasData = dc && typeof dc === 'object' && !Array.isArray(dc) && Object.keys(dc).length > 0;
        if (d.status === 'OK' && hasData) {
          periodInfo = {
            tahun: d.tahun || [],
            turtahun: (d.turtahun || []).filter(t => t.val !== 0 || t.label !== 'Tahun'),
            latestYear: thVal + 1900,
          };
          break;
        }
      } catch { /* skip */ }
    }

    if (!periodInfo) {
      return res.json({ success: true, data: { years: [], periods: [], latestYear: 2023 } });
    }

    // Build year range (latest - 10 to latest)
    const latestYear = periodInfo.latestYear;
    const years = [];
    for (let y = latestYear; y >= latestYear - 10; y--) {
      years.push({ value: y.toString(), label: y.toString() });
    }

    // Determine period type
    const turtahun = periodInfo.turtahun;
    let periodType = 'annual';
    const periods = [];

    if (turtahun.length > 1) {
      // Has sub-periods
      const labels = turtahun.map(t => t.label.toLowerCase());
      if (labels.some(l => l.includes('januari') || l.includes('februari'))) {
        periodType = turtahun.length >= 10 ? 'monthly' : 'semester';
      } else if (labels.some(l => l.includes('tri wulan') || l.includes('triwulan'))) {
        periodType = 'quarterly';
      }

      for (const t of turtahun) {
        periods.push({ value: t.val.toString(), label: t.label });
      }
    }

    res.json({
      success: true,
      data: {
        years,
        periods,
        periodType,
        latestYear,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Search BPS variable catalog
 * GET /panel/api/bps/variables/search?domain=3300&keyword=penduduk
 */
router.get('/variables/search', async (req, res) => {
  try {
    const { domain = '0000', keyword = '', page = '1' } = req.query;

    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({ success: false, error: 'BPS API key not configured' });
    }

    const axios = (await import('axios')).default;
    const baseUrl = 'https://webapi.bps.go.id/v1/api';
    let url = `${baseUrl}/list/model/var/domain/${domain}/key/${config.data.api_key}/page/${page}/perpage/20`;
    if (keyword) url += `/keyword/${encodeURIComponent(keyword)}`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    const d = response.data;
    if (d.status === 'OK' && Array.isArray(d.data) && d.data.length === 2) {
      const paging = d.data[0];
      const items = d.data[1].map(v => ({
        var_id: v.var_id?.toString(),
        title: v.title,
        unit: v.unit || '',
        subject: v.sub_name || '',
        graph_type: v.graph_name || '',
      }));
      res.json({ success: true, data: items, paging });
    } else {
      res.json({ success: true, data: [], paging: { total: 0 } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Add BPS variable
 * POST /panel/api/bps/variables
 */
router.post('/variables', async (req, res) => {
  try {
    const { 
      variable_id, 
      variable_name, 
      variable_name_en, 
      unit, 
      category, 
      description, 
      is_active = true 
    } = req.body;

    if (!variable_id || !variable_name) {
      return res.status(400).json({
        success: false,
        error: 'variable_id and variable_name are required'
      });
    }

    const result = await bpsDataService.addVariable({
      variable_id,
      variable_name,
      variable_name_en,
      unit,
      category,
      description,
      is_active
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'BPS variable added successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete BPS variable
 * DELETE /panel/api/bps/variables/:id
 */
router.delete('/variables/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bpsDataService.deleteVariable(id);

    if (result.success && result.data) {
      res.status(200).json({
        success: true,
        message: 'BPS variable deleted successfully',
        data: result.data
      });
    } else if (result.success && !result.data) {
      res.status(404).json({
        success: false,
        error: 'Variable not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update BPS variable status
 * PATCH /panel/api/bps/variables/:id
 */
router.patch('/variables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'is_active is required'
      });
    }

    const result = await bpsDataService.updateVariableStatus(id, is_active);

    if (result.success && result.data) {
      res.status(200).json({
        success: true,
        message: 'BPS variable updated successfully',
        data: result.data
      });
    } else if (result.success && !result.data) {
      res.status(404).json({
        success: false,
        error: 'Variable not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// STATISTICAL DATA ENDPOINTS
// =============================================================================

/**
 * Get statistical data for charts
 * GET /panel/api/bps/data
 * Query params: 
 *   - areas=31,32,33 (comma-separated area codes)
 *   - variables=7101,6201 (comma-separated variable IDs)
 *   - years=2020,2021,2022,2023,2024 (comma-separated years)
 *   - format=pivot|records|timeseries (default: pivot for charts)
 *   - areaType=province|district (filter by area type)
 */
router.get('/data', async (req, res) => {
  try {
    const {
      areas,
      variables,
      years,
      format = 'pivot',
      detail,  // 'kabupaten' to get per-district breakdown
      period,  // turtahun value (e.g. '102' for Tahunan, '90' for Januari)
    } = req.query;

    const areaCodes = areas ? areas.split(',').map(a => a.trim()) : [];
    const variableIds = variables ? variables.split(',').map(v => v.trim()) : [];
    const yearList = years ? years.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y)) : [];

    if (areaCodes.length === 0) {
      return res.status(400).json({ success: false, error: 'areas parameter is required' });
    }
    if (variableIds.length === 0) {
      return res.status(400).json({ success: false, error: 'variables parameter is required' });
    }

    // Get BPS API key from config
    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({ success: false, error: 'BPS API key not configured' });
    }
    const apiKey = config.data.api_key;

    // BPS API year mapping: periodId = year - 1900 (e.g. 2023 -> 123)
    const periodIds = yearList.map(y => y - 1900);

    // Fetch area names for display
    const areaNames = {};
    for (const code of areaCodes) {
      const areaResult = await query(
        'SELECT area_name FROM bps_monitored_areas WHERE area_code = $1 LIMIT 1',
        [code]
      );
      areaNames[code] = areaResult.rows[0]?.area_name || code;
    }

    // Fetch data from BPS API for each area
    // BPS allows max 2 years per request, so batch if needed
    const axios = (await import('axios')).default;
    const baseUrl = 'https://webapi.bps.go.id/v1/api';
    const allData = [];

    // Split periodIds into chunks of 2
    const periodChunks = [];
    for (let i = 0; i < periodIds.length; i += 2) {
      periodChunks.push(periodIds.slice(i, i + 2));
    }

    for (const areaCode of areaCodes) {
      for (const varId of variableIds) {
        for (const chunk of periodChunks) {
          const thParam = chunk.join(';');
          const url = `${baseUrl}/list/model/data/lang/ind/domain/${areaCode}/var/${varId}/th/${thParam}/key/${apiKey}`;

          try {
            const response = await axios.get(url, {
              timeout: 30000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
              }
            });

            const d = response.data;
            if (d.status === 'OK' && d.datacontent && typeof d.datacontent === 'object' && !Array.isArray(d.datacontent)) {
              const tahun = d.tahun || [];
              const vervar = d.vervar || [];
              const turvar = d.turvar || [];
              const turtahun = d.turtahun || [];
              const datacontent = d.datacontent;

              // BPS datacontent key = vervar_val + var_id + turvar_val + tahun_val + turtahun_val
              // Build a lookup: find which key belongs to which (vervar, tahun) pair
              const turvarPart = turvar.length > 0 ? turvar[0].val.toString() : '';
              // Use requested period, or default to first turtahun
              const turtahunPart = period || (turtahun.length > 0 ? turtahun[0].val.toString() : '');

              const findValue = (vvVal, thVal) => {
                // Full pattern: vervar + varId + turvar + tahun + turtahun
                const key1 = `${vvVal}${varId}${turvarPart}${thVal}${turtahunPart}`;
                if (datacontent[key1] !== undefined) return datacontent[key1];

                // Without turvar: vervar + varId + tahun + turtahun
                const key2 = `${vvVal}${varId}${thVal}${turtahunPart}`;
                if (datacontent[key2] !== undefined) return datacontent[key2];

                // Simple: vervar + tahun
                const key3 = `${vvVal}${thVal}`;
                if (datacontent[key3] !== undefined) return datacontent[key3];

                // vervar + tahun + turtahun
                const key4 = `${vvVal}${thVal}${turtahunPart}`;
                if (datacontent[key4] !== undefined) return datacontent[key4];

                return undefined;
              };

              if (detail === 'kabupaten' && vervar.length > 0) {
                // Per-district breakdown
                for (const th of tahun) {
                  const year = th.label || (th.val + 1900).toString();
                  for (const vv of vervar) {
                    const val = findValue(vv.val, th.val);
                    if (val !== undefined && val !== null && val !== '-' && !isNaN(parseFloat(val))) {
                      const label = (vv.label || '').replace(/^\d+\s+/, '');
                      allData.push({
                        area_code: areaCode,
                        area_name: label || vv.label,
                        variable_id: varId,
                        year,
                        value: Math.round(parseFloat(val) * 100) / 100,
                      });
                    }
                  }
                }
              } else {
                // Province-level: find the province-level entry or aggregate
                for (const th of tahun) {
                  const year = th.label || (th.val + 1900).toString();

                  // First try to find a province-level entry (vervar matching the areaCode)
                  const provEntry = vervar.find(vv => vv.val.toString() === areaCode);
                  if (provEntry) {
                    const val = findValue(provEntry.val, th.val);
                    if (val !== undefined && val !== null && val !== '-' && !isNaN(parseFloat(val))) {
                      allData.push({
                        area_code: areaCode,
                        area_name: areaNames[areaCode],
                        variable_id: varId,
                        year,
                        value: Math.round(parseFloat(val) * 100) / 100,
                      });
                      continue;
                    }
                  }

                  // Otherwise aggregate all vervar entries
                  let total = 0;
                  let count = 0;
                  for (const vv of vervar) {
                    const val = findValue(vv.val, th.val);
                    if (val !== undefined && val !== null && val !== '-' && !isNaN(parseFloat(val))) {
                      total += parseFloat(val);
                      count++;
                    }
                  }
                  if (count > 0) {
                    allData.push({
                      area_code: areaCode,
                      area_name: areaNames[areaCode],
                      variable_id: varId,
                      year,
                      value: Math.round(total * 100) / 100,
                    });
                  }
                }
              }
            }
          } catch (fetchErr) {
            console.error(`BPS data fetch error for ${areaCode}/${varId}:`, fetchErr.message);
          }

          // Small delay between requests
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }

    // Format as pivot for charts: [{ year, "AreaName1": val, "AreaName2": val }]
    if (format === 'pivot') {
      const pivotMap = {};
      for (const row of allData) {
        if (!pivotMap[row.year]) {
          pivotMap[row.year] = { year: row.year };
        }
        pivotMap[row.year][row.area_name] = row.value;
      }
      const pivotData = Object.values(pivotMap).sort((a, b) => a.year.localeCompare(b.year));

      return res.json({
        success: true,
        data: pivotData,
        count: pivotData.length,
        format: 'pivot'
      });
    }

    // Default: return raw records
    res.json({
      success: true,
      data: allData,
      count: allData.length,
      format: 'records'
    });
  } catch (error) {
    console.error('BPS data endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get latest data for each area-variable combination
 * GET /panel/api/bps/data/latest
 * Query params: similar to /data endpoint
 */
router.get('/data/latest', async (req, res) => {
  try {
    const { areas, variables } = req.query;

    const filters = {};
    if (areas) filters.areaCodes = areas.split(',').map(a => a.trim());
    if (variables) filters.variableIds = variables.split(',').map(v => v.trim());

    const result = await bpsDataService.getLatestData(filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get data summary/statistics
 * GET /panel/api/bps/data/summary
 */
router.get('/data/summary', async (req, res) => {
  try {
    // Get basic statistics about stored data
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT area_code) as total_areas,
        COUNT(DISTINCT variable_id) as total_variables,
        COUNT(DISTINCT year) as total_years,
        MIN(year) as earliest_year,
        MAX(year) as latest_year,
        COUNT(*) as total_records,
        COUNT(CASE WHEN last_updated > NOW() - INTERVAL '24 hours' THEN 1 END) as records_updated_24h
      FROM bps_statistical_data
    `;

    const result = await bpsDataService.query(summaryQuery);

    if (result.success) {
      res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// SYNCHRONIZATION ENDPOINTS
// =============================================================================

/**
 * Get sync history
 * GET /panel/api/bps/sync/history
 * Query params: ?limit=10
 */
router.get('/sync/history', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await bpsDataService.getSyncHistory(parseInt(limit));

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Trigger manual synchronization
 * POST /panel/api/bps/sync/trigger
 * Body: { areas, variables, years, syncType }
 */
router.post('/sync/trigger', async (req, res) => {
  try {
    const { areas, variables, years, syncType = 'manual' } = req.body;

    if (!areas || !variables || !years) {
      return res.status(400).json({
        success: false,
        error: 'areas, variables, and years are required'
      });
    }

    // Record sync operation
    const syncRecord = await bpsDataService.recordSync({
      sync_type: syncType,
      target_areas: areas,
      target_variables: variables,
      target_years: years,
      triggered_by: req.user?.id || 'manual_api'
    });

    if (!syncRecord.success) {
      return res.status(500).json({
        success: false,
        error: syncRecord.error
      });
    }

    // Get configuration
    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({
        success: false,
        error: 'BPS API key not configured'
      });
    }

    // Start synchronization process (async)
    process.nextTick(async () => {
      try {
        await performSynchronization(syncRecord.data.id, areas, variables, years, config.data.api_key);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    });

    res.json({
      success: true,
      message: 'Synchronization started',
      data: {
        syncId: syncRecord.data.id,
        status: 'started',
        estimatedDuration: '5-15 minutes'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// TESTING AND DEBUG ENDPOINTS
// =============================================================================

/**
 * Test BPS API connection
 * POST /panel/api/bps/test/connection
 */
router.post('/test/connection', async (req, res) => {
  try {
    const result = await bpsAPIFetcher.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Test data normalization
 * POST /panel/api/bps/test/normalization
 */
router.post('/test/normalization', async (req, res) => {
  try {
    const { rawData, options = {} } = req.body;

    if (!rawData) {
      return res.status(400).json({
        success: false,
        error: 'rawData is required'
      });
    }

    const result = bpsNormalizer.normalize(rawData, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Perform data synchronization (called in background)
 */
async function performSynchronization(syncId, areas, variables, years, apiKey) {
  try {
    console.log(`Starting synchronization ${syncId} for`, { areas, variables, years });

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    const errors = [];

    // Update sync status to running
    await bpsDataService.updateSyncResults(syncId, {
      sync_status: 'running',
      total_records_processed: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0
    });

    // Fetch data for each area-variable combination
    for (const areaCode of areas) {
      for (const variableId of variables) {
        try {
          // Fetch raw data from BPS API
          const fetchResult = await bpsAPIFetcher.fetchData({
            domainCode: areaCode,
            variableID: variableId,
            years: years,
            apiKey: apiKey
          });

          if (fetchResult.success) {
            // Normalize the data
            const normalized = bpsNormalizer.normalize(fetchResult.data, {
              outputFormat: 'records',
              includeMetadata: false
            });

            if (normalized.success) {
              // Insert/update in database
              const dbResult = await bpsDataService.upsertStatisticalData(normalized.data);
              
              if (dbResult.success) {
                totalInserted += dbResult.summary.inserted;
                totalUpdated += dbResult.summary.updated;
                totalFailed += dbResult.summary.errors;
              } else {
                totalFailed += normalized.data.length;
                errors.push({
                  area: areaCode,
                  variable: variableId,
                  error: dbResult.error
                });
              }
            } else {
              totalFailed += years.length;
              errors.push({
                area: areaCode,
                variable: variableId,
                error: `Normalization failed: ${normalized.error}`
              });
            }
          } else {
            totalFailed += years.length;
            errors.push({
              area: areaCode,
              variable: variableId,
              error: `API fetch failed: ${fetchResult.error}`
            });
          }

          totalProcessed += years.length;

          // Update progress
          await bpsDataService.updateSyncResults(syncId, {
            sync_status: 'running',
            total_records_processed: totalProcessed,
            records_inserted: totalInserted,
            records_updated: totalUpdated,
            records_failed: totalFailed
          });

        } catch (error) {
          totalFailed += years.length;
          errors.push({
            area: areaCode,
            variable: variableId,
            error: error.message
          });
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Complete sync
    await bpsDataService.updateSyncResults(syncId, {
      sync_status: totalFailed === 0 ? 'completed' : 'completed_with_errors',
      total_records_processed: totalProcessed,
      records_inserted: totalInserted,
      records_updated: totalUpdated,
      records_failed: totalFailed,
      error_message: errors.length > 0 ? `${errors.length} items failed` : null,
      error_details: errors.length > 0 ? errors : null
    });

    console.log(`Synchronization ${syncId} completed:`, {
      processed: totalProcessed,
      inserted: totalInserted,
      updated: totalUpdated,
      failed: totalFailed
    });

  } catch (error) {
    console.error(`Synchronization ${syncId} failed:`, error);
    
    await bpsDataService.updateSyncResults(syncId, {
      sync_status: 'failed',
      total_records_processed: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      error_message: error.message,
      error_details: { error: error.message, stack: error.stack }
    });
  }
}

export default router;