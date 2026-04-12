import { query } from '../db.js';

/**
 * BPS Data Service
 * Handles all database operations for BPS statistical data
 * Optimized for time-series queries and large datasets
 * Uses existing public.provinces and public.kabupaten tables
 */
export class BPSDataService {
  
  constructor() {
    this.tableNames = {
      statisticalData: 'bps_statistical_data',
      monitoredAreas: 'bps_monitored_areas',
      variables: 'bps_variables',
      config: 'bps_config',
      syncHistory: 'bps_sync_history',
      apiRequests: 'bps_api_requests',
      // Existing area tables
      provinces: 'public.provinces',
      kabupaten: 'public.kabupaten'
    };
  }

  // =============================================================================
  // CONFIGURATION MANAGEMENT
  // =============================================================================

  /**
   * Get BPS configuration
   * @returns {Promise<Object>}
   */
  async getConfig() {
    try {
      const result = await query(`
        SELECT * FROM ${this.tableNames.config} 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      return {
        success: true,
        data: result.rows[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get BPS config: ${error.message}`
      };
    }
  }

  /**
   * Update BPS configuration
   * @param {Object} configData - Configuration data
   * @returns {Promise<Object>}
   */
  async updateConfig(configData) {
    try {
      const { config_name, api_key, base_url, rate_limit_per_hour } = configData;
      
      console.log('Updating BPS config:', { config_name, api_key: '***', base_url, rate_limit_per_hour });
      
      const result = await query(`
        INSERT INTO ${this.tableNames.config} (config_name, api_key, base_url, rate_limit_per_hour)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (config_name)
        DO UPDATE SET
          api_key = EXCLUDED.api_key,
          base_url = EXCLUDED.base_url,
          rate_limit_per_hour = EXCLUDED.rate_limit_per_hour,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [config_name, api_key, base_url, rate_limit_per_hour]);
      
      console.log('BPS config update result:', { rowCount: result.rowCount, rows: result.rows });
      
      if (result.rows && result.rows.length > 0) {
        return {
          success: true,
          data: result.rows[0]
        };
      } else {
        return {
          success: false,
          error: 'No rows returned from config update'
        };
      }
    } catch (error) {
      console.error('BPS config update error:', error);
      return {
        success: false,
        error: `Failed to update BPS config: ${error.message}`
      };
    }
  }

  // =============================================================================
  // MONITORED AREAS MANAGEMENT
  // =============================================================================

  /**
   * Get all monitored areas with area information
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>}
   */
  async getMonitoredAreas(filters = {}) {
    try {
      let sql = `
        SELECT
          bma.id,
          bma.area_type,
          bma.area_code,
          bma.area_name,
          bma.parent_area_code,
          bma.is_active,
          bma.priority_level,
          bma.created_at,
          bma.updated_at,
          -- Area details from existing tables
          p.name as province_name,
          p.code as province_code,
          k.name as kabupaten_name,
          k.code as kabupaten_code,
          k.type as kabupaten_type
        FROM ${this.tableNames.monitoredAreas} bma
        LEFT JOIN ${this.tableNames.provinces} p ON bma.area_type = 'province' AND bma.area_code = p.code
        LEFT JOIN ${this.tableNames.kabupaten} k ON bma.area_type = 'kabupaten' AND bma.area_code = k.code
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (filters.areaType) {
        sql += ` AND bma.area_type = $${paramCount}`;
        params.push(filters.areaType);
        paramCount++;
      }

      if (filters.isActive !== undefined) {
        sql += ` AND bma.is_active = $${paramCount}`;
        params.push(filters.isActive);
        paramCount++;
      }

      sql += ` ORDER BY bma.priority_level ASC, COALESCE(p.name, k.name) ASC`;

      const result = await query(sql, params);
      
      // Format the data to include display names
      const formattedData = result.rows.map(row => {
        const displayName = row.area_type === 'province' ? row.province_name : row.kabupaten_name;
        return {
          ...row,
          area_name: displayName || row.area_name,
          area_display_name: displayName || row.area_name
        };
      });
      
      return {
        success: true,
        data: formattedData,
        count: result.rows.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get monitored areas: ${error.message}`
      };
    }
  }

  /**
   * Add monitored area (links to existing area tables)
   * @param {Object} areaData - Area data
   * @returns {Promise<Object>}
   */
  async addMonitoredArea(areaData) {
    try {
      let { area_type, area_code, area_name, parent_area_code, priority_level = 1 } = areaData;

      // Normalize BPS area_type: "district" -> "kabupaten"
      if (area_type === 'district') area_type = 'kabupaten';

      // Resolve area_id from existing provinces/kabupaten tables
      // BPS province codes are 4-digit (e.g. "1100"), DB codes are 2-digit (e.g. "11")
      let areaIdResult;
      if (area_type === 'province') {
        const shortCode = area_code.substring(0, 2);
        areaIdResult = await query(
          `SELECT id FROM ${this.tableNames.provinces} WHERE code = $1 LIMIT 1`,
          [shortCode]
        );
      } else {
        areaIdResult = await query(
          `SELECT id FROM ${this.tableNames.kabupaten} WHERE code = $1 LIMIT 1`,
          [area_code]
        );
      }

      const area_id = areaIdResult.rows[0]?.id || null;

      const result = await query(`
        INSERT INTO ${this.tableNames.monitoredAreas}
        (area_type, area_id, area_code, area_name, parent_area_code, priority_level)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (area_code)
        DO UPDATE SET
          area_name = EXCLUDED.area_name,
          area_type = EXCLUDED.area_type,
          area_id = COALESCE(EXCLUDED.area_id, ${this.tableNames.monitoredAreas}.area_id),
          parent_area_code = EXCLUDED.parent_area_code,
          priority_level = EXCLUDED.priority_level,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [area_type, area_id, area_code, area_name, parent_area_code, priority_level]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add monitored area: ${error.message}`
      };
    }
  }

  /**
   * Get area information by BPS area code
   * @param {string} bpsCode - BPS area code
   * @returns {Promise<Object>}
   */
  async getAreaByBPSCode(bpsCode) {
    try {
      console.log('Getting area by BPS code:', bpsCode);
      const result = await query('SELECT * FROM get_area_by_bps_code($1)', [bpsCode]);
      console.log('Area query result:', { rowCount: result.rowCount, rows: result.rows });
      
      return {
        success: true,
        data: result.rows[0] || null
      };
    } catch (error) {
      console.error('Error getting area by BPS code:', error);
      return {
        success: false,
        error: `Failed to get area by BPS code: ${error.message}`
      };
    }
  }

  /**
   * Sync monitored areas from existing area tables
   * @returns {Promise<Object>}
   */
  async syncMonitoredAreas() {
    try {
      console.log('Starting monitored areas sync...');
      const result = await query('SELECT sync_bps_monitored_areas() as synced_count');
      console.log('Sync result:', { rowCount: result.rowCount, rows: result.rows });
      
      return {
        success: true,
        data: {
          syncedCount: result.rows[0].synced_count
        }
      };
    } catch (error) {
      console.error('Error syncing monitored areas:', error);
      return {
        success: false,
        error: `Failed to sync monitored areas: ${error.message}`
      };
    }
  }

  // =============================================================================
  // VARIABLES MANAGEMENT
  // =============================================================================

  /**
   * Get BPS variables
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>}
   */
  async getVariables(filters = {}) {
    try {
      let sql = `
        SELECT * FROM ${this.tableNames.variables}
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (filters.isActive !== undefined) {
        sql += ` AND is_active = $${paramCount}`;
        params.push(filters.isActive);
        paramCount++;
      }

      if (filters.category) {
        sql += ` AND category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      sql += ` ORDER BY category, variable_name`;

      const result = await query(sql, params);
      
      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get variables: ${error.message}`
      };
    }
  }

  /**
   * Add BPS variable
   * @param {Object} variableData - Variable data
   * @returns {Promise<Object>}
   */
  async addVariable(variableData) {
    try {
      const { 
        variable_id, variable_name, variable_name_en, unit, 
        category, description, is_active = true 
      } = variableData;
      
      const result = await query(`
        INSERT INTO ${this.tableNames.variables} 
        (variable_id, variable_name, variable_name_en, unit, category, description, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (variable_id) 
        DO UPDATE SET 
          variable_name = EXCLUDED.variable_name,
          variable_name_en = EXCLUDED.variable_name_en,
          unit = EXCLUDED.unit,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [variable_id, variable_name, variable_name_en, unit, category, description, is_active]);
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add variable: ${error.message}`
      };
    }
  }

  /**
   * Delete BPS variable
   * @param {number} id - Variable record ID
   * @returns {Promise<Object>}
   */
  async deleteVariable(id) {
    try {
      const result = await query(`
        DELETE FROM ${this.tableNames.variables}
        WHERE id = $1
        RETURNING *
      `, [id]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete variable: ${error.message}`
      };
    }
  }

  /**
   * Update BPS variable status
   * @param {number} id - Variable record ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>}
   */
  async updateVariableStatus(id, isActive) {
    try {
      const result = await query(`
        UPDATE ${this.tableNames.variables}
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [isActive, id]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update variable status: ${error.message}`
      };
    }
  }

  // =============================================================================
  // STATISTICAL DATA OPERATIONS
  // =============================================================================

  /**
   * Insert or update statistical data (upsert)
   * @param {Array} records - Array of data records
   * @returns {Promise<Object>}
   */
  async upsertStatisticalData(records) {
    try {
      let inserted = 0;
      let updated = 0;
      let errors = 0;
      const errorDetails = [];

      for (const record of records) {
        try {
          const result = await query(`
            INSERT INTO ${this.tableNames.statisticalData} 
            (area_type, area_id, area_code, area_name, variable_id, variable_name, unit,
             year, period_type, period_value, data_value, data_value_formatted, data_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (area_type, area_id, variable_id, year, COALESCE(period_value, 'annual')) 
            DO UPDATE SET 
              area_code = EXCLUDED.area_code,
              area_name = EXCLUDED.area_name,
              variable_name = EXCLUDED.variable_name,
              unit = EXCLUDED.unit,
              data_value = EXCLUDED.data_value,
              data_value_formatted = EXCLUDED.data_value_formatted,
              data_status = EXCLUDED.data_status,
              last_updated = CURRENT_TIMESTAMP
            RETURNING *
          `, [
            record.area_type,
            record.area_id,
            record.area_code,
            record.area_name,
            record.variable_id,
            record.variable_name,
            record.unit,
            record.year,
            record.period_type || 'annual',
            record.period_value,
            record.data_value,
            record.data_value_formatted,
            record.data_status || 'final'
          ]);

          if (result.rows.length > 0) {
            // Check if this was an insert or update by checking if data_hash changed
            const isUpdate = record.data_hash && result.rows[0].data_hash === record.data_hash;
            if (isUpdate) {
              updated++;
            } else {
              inserted++;
            }
          }
        } catch (recordError) {
          errors++;
          errorDetails.push({
            record: record,
            error: recordError.message
          });
        }
      }

      return {
        success: errors === 0,
        summary: {
          total: records.length,
          inserted,
          updated,
          errors
        },
        errors: errorDetails.length > 0 ? errorDetails : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to upsert statistical data: ${error.message}`,
        summary: {
          total: records.length,
          inserted: 0,
          updated: 0,
          errors: records.length
        }
      };
    }
  }

  /**
   * Get statistical data with optimization for charts
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getStatisticalData(filters = {}) {
    try {
      const {
        areaCodes,
        areaIds,
        variableIds,
        years,
        areaType,
        outputFormat = 'records' // 'records', 'pivot', 'timeseries'
      } = filters;

      let sql = `
        SELECT 
          area_type,
          area_id,
          area_code,
          area_name,
          variable_id,
          variable_name,
          unit,
          year,
          period_type,
          period_value,
          data_value,
          data_value_formatted,
          data_status,
          last_updated
        FROM ${this.tableNames.statisticalData}
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (areaCodes && areaCodes.length > 0) {
        sql += ` AND area_code = ANY($${paramCount})`;
        params.push(areaCodes);
        paramCount++;
      }

      if (areaIds && areaIds.length > 0) {
        sql += ` AND area_id = ANY($${paramCount})`;
        params.push(areaIds);
        paramCount++;
      }

      if (variableIds && variableIds.length > 0) {
        sql += ` AND variable_id = ANY($${paramCount})`;
        params.push(variableIds);
        paramCount++;
      }

      if (years && years.length > 0) {
        sql += ` AND year = ANY($${paramCount})`;
        params.push(years);
        paramCount++;
      }

      if (areaType) {
        sql += ` AND area_type = $${paramCount}`;
        params.push(areaType);
        paramCount++;
      }

      // Optimize for time-series queries
      sql += ` ORDER BY year DESC, area_name, variable_name`;

      console.log(`Executing optimized BPS data query:`, {
        filters: { areaCodes, areaIds, variableIds, years, areaType },
        sql: sql.replace(/\$\d+/g, '?'),
        params
      });

      const result = await query(sql, params);
      
      // Format according to output requirements
      let formattedData;
      switch (outputFormat) {
        case 'pivot':
          formattedData = this.formatAsPivot(result.rows);
          break;
        case 'timeseries':
          formattedData = this.formatAsTimeSeries(result.rows);
          break;
        default:
          formattedData = result.rows;
      }

      return {
        success: true,
        data: formattedData,
        count: result.rows.length,
        meta: {
          filters,
          queryTime: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get statistical data: ${error.message}`,
        data: [],
        count: 0
      };
    }
  }

  /**
   * Get latest data for each area-variable combination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getLatestData(filters = {}) {
    try {
      let sql = `
        SELECT DISTINCT ON (area_type, area_id, variable_id)
          area_type,
          area_id,
          area_code,
          area_name,
          variable_id,
          variable_name,
          unit,
          year,
          period_type,
          period_value,
          data_value,
          data_value_formatted,
          data_status,
          last_updated
        FROM ${this.tableNames.statisticalData}
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (filters.areaCodes && filters.areaCodes.length > 0) {
        sql += ` AND area_code = ANY($${paramCount})`;
        params.push(filters.areaCodes);
        paramCount++;
      }

      if (filters.areaIds && filters.areaIds.length > 0) {
        sql += ` AND area_id = ANY($${paramCount})`;
        params.push(filters.areaIds);
        paramCount++;
      }

      if (filters.variableIds && filters.variableIds.length > 0) {
        sql += ` AND variable_id = ANY($${paramCount})`;
        params.push(filters.variableIds);
        paramCount++;
      }

      sql += ` ORDER BY area_type, area_id, variable_id, year DESC, last_updated DESC`;

      const result = await query(sql, params);

      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get latest data: ${error.message}`
      };
    }
  }

  // =============================================================================
  // SYNC HISTORY MANAGEMENT
  // =============================================================================

  /**
   * Record sync operation
   * @param {Object} syncData - Sync operation data
   * @returns {Promise<Object>}
   */
  async recordSync(syncData) {
    try {
      const {
        sync_type,
        target_areas,
        target_variables,
        target_years,
        triggered_by = 'system'
      } = syncData;

      const result = await query(`
        INSERT INTO ${this.tableNames.syncHistory} 
        (sync_type, target_areas, target_variables, target_years, triggered_by, started_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `, [sync_type, target_areas, target_variables, target_years, triggered_by]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to record sync: ${error.message}`
      };
    }
  }

  /**
   * Update sync operation with results
   * @param {number} syncId - Sync operation ID
   * @param {Object} results - Sync results
   * @returns {Promise<Object>}
   */
  async updateSyncResults(syncId, results) {
    try {
      const {
        sync_status,
        total_records_processed,
        records_inserted,
        records_updated,
        records_failed,
        error_message,
        error_details
      } = results;

      // Calculate duration properly - this will be updated when the sync completes
      const startTime = new Date();
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);

      const result = await query(`
        UPDATE ${this.tableNames.syncHistory}
        SET 
          sync_status = $1,
          total_records_processed = $2,
          records_inserted = $3,
          records_updated = $4,
          records_failed = $5,
          completed_at = CURRENT_TIMESTAMP,
          duration_seconds = $6,
          error_message = $7,
          error_details = $8
        WHERE id = $9
        RETURNING *
      `, [
        sync_status,
        total_records_processed,
        records_inserted,
        records_updated,
        records_failed,
        duration,
        error_message,
        error_details ? JSON.stringify(error_details) : null,
        syncId
      ]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update sync results: ${error.message}`
      };
    }
  }

  /**
   * Get sync history
   * @param {number} limit - Number of records to return
   * @returns {Promise<Object>}
   */
  async getSyncHistory(limit = 10) {
    try {
      const result = await query(`
        SELECT * FROM ${this.tableNames.syncHistory}
        ORDER BY started_at DESC
        LIMIT $1
      `, [limit]);

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get sync history: ${error.message}`
      };
    }
  }

  // =============================================================================
  // API REQUEST LOGGING
  // =============================================================================

  /**
   * Log API request
   * @param {Object} requestData - Request log data
   * @returns {Promise<Object>}
   */
  async logAPIRequest(requestData) {
    try {
      const {
        request_url,
        request_method = 'GET',
        request_params,
        response_status,
        response_time_ms,
        response_size_bytes,
        error_message,
        error_code,
        rate_limit_remaining,
        rate_limit_reset_time,
        sync_history_id
      } = requestData;

      const result = await query(`
        INSERT INTO ${this.tableNames.apiRequests}
        (request_url, request_method, request_params, response_status, response_time_ms,
         response_size_bytes, error_message, error_code, rate_limit_remaining,
         rate_limit_reset_time, sync_history_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        request_url,
        request_method,
        request_params ? JSON.stringify(request_params) : null,
        response_status,
        response_time_ms,
        response_size_bytes,
        error_message,
        error_code,
        rate_limit_remaining,
        rate_limit_reset_time,
        sync_history_id
      ]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to log API request: ${error.message}`
      };
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Build query parameters array
   * @param {Object} filters - Query filters
   * @returns {Array} Query parameters
   */
  buildQueryParams(filters) {
    const params = [];
    
    if (filters.areaCodes) params.push(filters.areaCodes);
    if (filters.areaIds) params.push(filters.areaIds);
    if (filters.variableIds) params.push(filters.variableIds);
    
    return params;
  }

  /**
   * Format data as pivot table (for Recharts)
   * @param {Array} records - Data records
   * @returns {Array} Pivot-formatted data
   */
  formatAsPivot(records) {
    const pivotData = {};
    const areas = new Set();
    
    records.forEach(record => {
      const year = record.year.toString();
      areas.add(record.area_name);
      
      if (!pivotData[year]) {
        pivotData[year] = { year };
      }
      
      pivotData[year][record.area_name] = record.data_value;
    });
    
    return Object.values(pivotData).sort((a, b) => a.year.localeCompare(b.year));
  }

  /**
   * Format data as time series
   * @param {Array} records - Data records
   * @returns {Object} Time series formatted data
   */
  formatAsTimeSeries(records) {
    const series = {};
    const areas = new Set();
    const variables = new Set();
    
    records.forEach(record => {
      areas.add(record.area_name);
      variables.add(record.variable_name);
      
      const key = `${record.variable_name}_${record.area_name}`;
      
      if (!series[key]) {
        series[key] = {
          name: record.variable_name,
          area: record.area_name,
          areaCode: record.area_code,
          areaId: record.area_id,
          areaType: record.area_type,
          data: []
        };
      }
      
      series[key].data.push({
        year: record.year,
        value: record.data_value,
        formattedValue: record.data_value_formatted
      });
    });
    
    return {
      series: Object.values(series),
      areas: Array.from(areas),
      variables: Array.from(variables)
    };
  }

  /**
   * Test database connection
   * @returns {Promise<Object>}
   */
  async testDatabaseConnection() {
    try {
      const result = await query('SELECT NOW() as current_time, version() as db_version');
      
      return {
        success: true,
        message: 'Database connection successful',
        data: {
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

export default BPSDataService;