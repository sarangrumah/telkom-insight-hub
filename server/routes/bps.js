import express from 'express';
import BPSDataService from '../services/bpsDataService.js';
import BPSAPIFetcherService from '../services/bpsAPIFetcherService.js';
import BPSDataNormalizerService from '../services/bpsDataNormalizerService.js';

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

    const result = await bpsDataService.updateConfig({
      config_name,
      api_key,
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
      areaType
    } = req.query;

    // Parse comma-separated parameters
    const filters = {
      outputFormat: format
    };

    if (areas) filters.areaCodes = areas.split(',').map(a => a.trim());
    if (variables) filters.variableIds = variables.split(',').map(v => v.trim());
    if (years) filters.years = years.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));
    if (areaType) filters.areaType = areaType;

    // Validate required parameters
    if (!filters.areaCodes || filters.areaCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one area code is required (areas parameter)'
      });
    }

    if (!filters.variableIds || filters.variableIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one variable ID is required (variables parameter)'
      });
    }

    const result = await bpsDataService.getStatisticalData(filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.count,
        meta: result.meta,
        format: format
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