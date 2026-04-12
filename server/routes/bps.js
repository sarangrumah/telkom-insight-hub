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
 * GET /v2/panel/api/bps/health
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
 * GET /v2/panel/api/bps/config
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
 * POST /v2/panel/api/bps/config
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
 * GET /v2/panel/api/bps/areas
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
 * POST /v2/panel/api/bps/areas
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
 * POST /v2/panel/api/bps/areas/sync
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
 * GET /v2/panel/api/bps/areas/test
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
 * GET /v2/panel/api/bps/variables
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
 * GET /v2/panel/api/bps/periods?domain=3300&var=985
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
 * GET /v2/panel/api/bps/variables/search?domain=3300&keyword=penduduk
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
 * POST /v2/panel/api/bps/variables
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
 * DELETE /v2/panel/api/bps/variables/:id
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
 * PATCH /v2/panel/api/bps/variables/:id
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
 * GET /v2/panel/api/bps/data
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

    // Fallback to local database if BPS API returned no data
    if (allData.length === 0) {
      const localResult = await query(`
        SELECT area_code, area_name, variable_id, year::text as year, data_value as value, unit, variable_name
        FROM bps_statistical_data
        WHERE area_code = ANY($1) AND variable_id = ANY($2)
        ${yearList.length > 0 ? 'AND year = ANY($3)' : ''}
        ORDER BY year, area_name
      `, yearList.length > 0 ? [areaCodes, variableIds, yearList] : [areaCodes, variableIds]);

      for (const row of localResult.rows) {
        allData.push({
          area_code: row.area_code,
          area_name: row.area_name,
          variable_id: row.variable_id,
          year: row.year,
          value: parseFloat(row.value),
        });
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
 * GET /v2/panel/api/bps/data/latest
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
 * GET /v2/panel/api/bps/data/summary
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

    const result = await query(summaryQuery);

    res.json({
      success: true,
      data: result.rows[0]
    });
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
 * GET /v2/panel/api/bps/sync/history
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
 * POST /v2/panel/api/bps/sync/trigger
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
 * POST /v2/panel/api/bps/test/connection
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
 * POST /v2/panel/api/bps/test/normalization
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

// =============================================================================
// STATIC TABLE IMPORT (BPS statictable model)
// =============================================================================

/**
 * Search BPS static tables for a province
 * GET /v2/panel/api/bps/statictable/search?domain=3100&keyword=penduduk&page=1
 */
router.get('/statictable/search', async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const { domain = '0000', keyword = '', page = 1 } = req.query;
    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({ success: false, error: 'BPS API key not configured' });
    }

    const axios = (await import('axios')).default;
    const url = `https://webapi.bps.go.id/v1/api/list/model/statictable/domain/${domain}${keyword ? `/keyword/${encodeURIComponent(keyword)}` : ''}/key/${config.data.api_key}/page/${page}`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' }
    });

    const d = response.data;
    if (d.status !== 'OK' || !Array.isArray(d.data) || d.data.length < 2) {
      return res.json({ success: true, data: [], pagination: null });
    }

    res.json({
      success: true,
      data: d.data[1].map(t => ({ table_id: t.table_id, title: t.title, subject: t.sub_name, updated: t.updt_date })),
      pagination: d.data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Fetch and parse a BPS static table, then save to bps_statistical_data
 * POST /v2/panel/api/bps/statictable/import
 * Body: { domain: "3100", table_id: 234, variable_id: "DEM001", variable_name: "Jumlah Penduduk", unit: "Ribu Jiwa" }
 */
router.post('/statictable/import', async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const { domain, table_id, variable_id, variable_name, unit } = req.body;
    if (!domain || !table_id || !variable_id) {
      return res.status(400).json({ success: false, error: 'domain, table_id, and variable_id are required' });
    }

    const config = await bpsDataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      return res.status(400).json({ success: false, error: 'BPS API key not configured' });
    }

    const axios = (await import('axios')).default;
    const url = `https://webapi.bps.go.id/v1/api/view/domain/${domain}/model/statictable/lang/ind/id/${table_id}/key/${config.data.api_key}`;

    console.log(`Fetching BPS static table: domain=${domain}, table_id=${table_id}`);

    const response = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' }
    });

    const d = response.data;
    if (d.status !== 'OK' || !d.data?.table) {
      return res.status(400).json({ success: false, error: 'No table data returned from BPS' });
    }

    // Parse HTML table
    const tableHtml = d.data.table
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    // Extract rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const rows = [];
    let match;
    while ((match = rowRegex.exec(tableHtml)) !== null) {
      const cells = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(match[1])) !== null) {
        const text = cellMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        cells.push(text);
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length < 2) {
      return res.status(400).json({ success: false, error: 'Could not parse table rows' });
    }

    // Get area info
    const areaResult = await query(
      'SELECT area_id, area_name, area_type FROM bps_monitored_areas WHERE area_code = $1 LIMIT 1',
      [domain]
    );
    const area = areaResult.rows[0] || { area_id: null, area_name: domain, area_type: 'province' };

    // Strategy: find rows where first column looks like a year (4-digit number)
    // and subsequent columns have numeric data
    const imported = [];
    const errors = [];

    for (const row of rows) {
      if (row.length < 2) continue;

      // Check if first cell is a year
      const yearMatch = row[0].match(/^(\d{4})$/);
      if (!yearMatch) continue;

      const year = parseInt(yearMatch[1]);
      if (year < 1950 || year > 2030) continue;

      // Try to extract numeric value from remaining cells
      // Use the last numeric cell (often "Total" column) or first numeric cell
      let value = null;
      for (let i = row.length - 1; i >= 1; i--) {
        const cleaned = row[i].replace(/\s/g, '').replace(/,/g, '.');
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
          value = num;
          break;
        }
      }

      if (value === null) continue;

      try {
        await query(`
          INSERT INTO bps_statistical_data
            (area_type, area_id, area_code, area_name, variable_id, variable_name, unit, year, data_value, period_type, source_api)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'annual', 'bps_statictable')
          ON CONFLICT (area_type, area_id, variable_id, year, period_value)
          DO UPDATE SET data_value = EXCLUDED.data_value, variable_name = EXCLUDED.variable_name, unit = EXCLUDED.unit, last_updated = CURRENT_TIMESTAMP
        `, [area.area_type, area.area_id, domain, area.area_name, variable_id, variable_name || d.data.title, unit || '', year, value]);

        imported.push({ year, value });
      } catch (insertErr) {
        errors.push({ year, value, error: insertErr.message });
      }
    }

    console.log(`BPS static table import: ${imported.length} records imported, ${errors.length} errors`);

    res.json({
      success: true,
      message: `Imported ${imported.length} records from BPS static table`,
      data: {
        table_title: d.data.title,
        domain,
        variable_id,
        imported: imported.length,
        errors: errors.length,
        records: imported,
        errorDetails: errors.length > 0 ? errors.slice(0, 5) : undefined
      }
    });
  } catch (error) {
    console.error('BPS static table import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Bulk import: fetch multiple static tables for multiple provinces
 * POST /v2/panel/api/bps/statictable/bulk-import
 * Body: { domains: ["1100","3100"], table_id: 234, variable_id: "DEM001", variable_name: "...", unit: "..." }
 */
router.post('/statictable/bulk-import', async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const { domains, table_id, variable_id, variable_name, unit } = req.body;
    if (!domains?.length || !table_id || !variable_id) {
      return res.status(400).json({ success: false, error: 'domains[], table_id, and variable_id are required' });
    }

    const results = [];
    for (const domain of domains) {
      // Internally call the single import logic
      try {
        const config = await bpsDataService.getConfig();
        const axios = (await import('axios')).default;
        const url = `https://webapi.bps.go.id/v1/api/view/domain/${domain}/model/statictable/lang/ind/id/${table_id}/key/${config.data.api_key}`;

        const response = await axios.get(url, {
          timeout: 30000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' }
        });

        const d = response.data;
        if (d.status !== 'OK' || !d.data?.table) {
          results.push({ domain, success: false, error: 'No data' });
          continue;
        }

        const tableHtml = d.data.table
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const areaResult = await query('SELECT area_id, area_name, area_type FROM bps_monitored_areas WHERE area_code = $1 LIMIT 1', [domain]);
        const area = areaResult.rows[0] || { area_id: null, area_name: domain, area_type: 'province' };

        let importCount = 0;
        let match;
        while ((match = rowRegex.exec(tableHtml)) !== null) {
          const cells = [];
          let cellMatch;
          while ((cellMatch = cellRegex.exec(match[1])) !== null) {
            cells.push(cellMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
          }
          if (cells.length < 2) continue;
          const yearMatch = cells[0].match(/^(\d{4})$/);
          if (!yearMatch) continue;
          const year = parseInt(yearMatch[1]);
          if (year < 1950 || year > 2030) continue;

          let value = null;
          for (let i = cells.length - 1; i >= 1; i--) {
            const num = parseFloat(cells[i].replace(/\s/g, '').replace(/,/g, '.'));
            if (!isNaN(num)) { value = num; break; }
          }
          if (value === null) continue;

          try {
            await query(`
              INSERT INTO bps_statistical_data (area_type, area_id, area_code, area_name, variable_id, variable_name, unit, year, data_value, period_type, source_api)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'annual', 'bps_statictable')
              ON CONFLICT (area_type, area_id, variable_id, year, period_value) DO UPDATE SET
                data_value = EXCLUDED.data_value, last_updated = CURRENT_TIMESTAMP
            `, [area.area_type, area.area_id, domain, area.area_name, variable_id, variable_name || d.data.title, unit || '', year, value]);
            importCount++;
          } catch { /* skip conflicts */ }
        }

        results.push({ domain, area_name: area.area_name, success: true, imported: importCount });
        await new Promise(r => setTimeout(r, 200)); // Rate limit
      } catch (err) {
        results.push({ domain, success: false, error: err.message });
      }
    }

    const totalImported = results.reduce((sum, r) => sum + (r.imported || 0), 0);
    res.json({
      success: true,
      message: `Bulk import complete: ${totalImported} records from ${results.filter(r => r.success).length} provinces`,
      data: { results, totalImported }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;