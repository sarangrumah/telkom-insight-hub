import { query } from '../db.js';
import KominfoTarifService from './kominfoTarifService.js';

/**
 * @typedef {Object} SyncResult
 * @property {boolean} success
 * @property {string} message
 * @property {number} totalRecords
 * @property {number} insertedRecords
 * @property {number} updatedRecords
 * @property {number} errorRecords
 * @property {Array} errors
 * @property {number} duration
 */

/**
 * Tarif Synchronization Service
 * Handles syncing data from Kominfo API to database with upsert logic
 */
export class TarifSyncService {
  constructor() {
    this.kominfoService = new KominfoTarifService();
  }

  /**
   * Perform complete synchronization
   * @param {Object} options 
   * @param {string} options.syncType - 'manual' or 'scheduled'
   * @param {Object} options.params - Additional parameters for API calls
   * @returns {Promise<SyncResult>}
   */
  async synchronize(options = {}) {
    const syncType = options.syncType || 'manual';
    const startTime = new Date();
    
    console.log(`Starting ${syncType} synchronization...`);
    
    // Create sync log entry
    const logId = await this.createSyncLog(syncType, 'started');
    
    try {
      // Fetch all data from API
      const apiData = await this.kominfoService.fetchAllData(options.params);
      
      if (!apiData || apiData.length === 0) {
        const result = {
          success: true,
          message: 'No data found from API',
          totalRecords: 0,
          insertedRecords: 0,
          updatedRecords: 0,
          errorRecords: 0,
          errors: [],
          duration: Date.now() - startTime.getTime()
        };
        
        await this.updateSyncLog(logId, 'completed', result);
        return result;
      }

      // Transform data to database format
      const transformedData = this.kominfoService.transformApiData(apiData);
      
      // Process data in batches for better performance
      const batchSize = 50;
      const batches = this.chunkArray(transformedData, batchSize);
      
      let totalRecords = 0;
      let insertedRecords = 0;
      let updatedRecords = 0;
      let errorRecords = 0;
      const errors = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} records)`);
        
        const batchResult = await this.processBatch(batch);
        
        totalRecords += batchResult.total;
        insertedRecords += batchResult.inserted;
        updatedRecords += batchResult.updated;
        errorRecords += batchResult.errors;
        errors.push(...batchResult.errorDetails);
      }

      const result = {
        success: true,
        message: `Synchronization completed successfully`,
        totalRecords,
        insertedRecords,
        updatedRecords,
        errorRecords,
        errors,
        duration: Date.now() - startTime.getTime()
      };

      await this.updateSyncLog(logId, 'completed', result);
      console.log('Synchronization completed:', result);
      
      return result;

    } catch (error) {
      const result = {
        success: false,
        message: `Synchronization failed: ${error.message}`,
        totalRecords: 0,
        insertedRecords: 0,
        updatedRecords: 0,
        errorRecords: 0,
        errors: [error.message],
        duration: Date.now() - startTime.getTime()
      };

      await this.updateSyncLog(logId, 'failed', result);
      console.error('Synchronization failed:', error);
      
      return result;
    }
  }

  /**
   * Process a batch of records with upsert logic
   * @param {Array} batch 
   * @returns {Promise<Object>}
   */
  async processBatch(batch) {
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails = [];

    // Start transaction for batch
    await query('BEGIN');

    try {
      for (const record of batch) {
        try {
          const result = await this.upsertRecord(record);
          
          if (result.action === 'inserted') {
            inserted++;
          } else if (result.action === 'updated') {
            updated++;
          }
          
        } catch (error) {
          errors++;
          errorDetails.push({
            uid: record.uid,
            error: error.message
          });
          console.error(`Error processing record ${record.uid}:`, error.message);
        }
      }

      await query('COMMIT');

    } catch (error) {
      await query('ROLLBACK');
      throw new Error(`Batch processing failed: ${error.message}`);
    }

    return {
      total: batch.length,
      inserted,
      updated,
      errors,
      errorDetails
    };
  }

  /**
   * Upsert a single record with discrepancy detection
   * @param {Object} record 
   * @returns {Promise<Object>}
   */
  async upsertRecord(record) {
    // Check if record exists
    const existingQuery = 'SELECT * FROM public.kominfo_tarif_data WHERE uid = $1';
    const existingResult = await query(existingQuery, [record.uid]);
    
    if (existingResult.rows.length === 0) {
      // Insert new record
      const insertQuery = `
        INSERT INTO public.kominfo_tarif_data (
          uid, jenis_izin, title, color, title_jenis, penyelenggara, pic, email,
          status_email, id_user, app_name, id_jenis_izin, id_izin, id_jenis_report,
          jenis_periode, jenis, tanggal, filename, status, tahun, periode,
          api_status, api_jenis, last_synced_at, sync_status, sync_error
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      `;
      
      const values = [
        record.uid, record.jenis_izin, record.title, record.color, record.title_jenis,
        record.penyelenggara, record.pic, record.email, record.status_email,
        record.id_user, record.app_name, record.id_jenis_izin, record.id_izin,
        record.id_jenis_report, record.jenis_periode, record.jenis, record.tanggal,
        record.filename, record.status, record.tahun, record.periode,
        record.api_status, record.api_jenis, record.last_synced_at,
        record.sync_status, record.sync_error
      ];
      
      await query(insertQuery, values);
      return { action: 'inserted', id: record.uid };
      
    } else {
      // Record exists, check for discrepancies
      const existing = existingResult.rows[0];
      const hasChanges = this.hasDiscrepancies(existing, record);
      
      if (hasChanges) {
        // Update existing record
        const updateQuery = `
          UPDATE public.kominfo_tarif_data SET
            jenis_izin = $2, title = $3, color = $4, title_jenis = $5,
            penyelenggara = $6, pic = $7, email = $8, status_email = $9,
            id_user = $10, app_name = $11, id_jenis_izin = $12, id_izin = $13,
            id_jenis_report = $14, jenis_periode = $15, jenis = $16, tanggal = $17,
            filename = $18, status = $19, tahun = $20, periode = $21,
            api_status = $22, api_jenis = $23, last_synced_at = $24,
            sync_status = $25, sync_error = $26, updated_at = CURRENT_TIMESTAMP
          WHERE uid = $1
        `;
        
        const values = [
          record.uid, record.jenis_izin, record.title, record.color, record.title_jenis,
          record.penyelenggara, record.pic, record.email, record.status_email,
          record.id_user, record.app_name, record.id_jenis_izin, record.id_izin,
          record.id_jenis_report, record.jenis_periode, record.jenis, record.tanggal,
          record.filename, record.status, record.tahun, record.periode,
          record.api_status, record.api_jenis, record.last_synced_at,
          record.sync_status, record.sync_error
        ];
        
        await query(updateQuery, values);
        return { action: 'updated', id: record.uid };
      } else {
        // No changes, just update sync timestamp
        const updateSyncQuery = `
          UPDATE public.kominfo_tarif_data
          SET last_synced_at = CURRENT_TIMESTAMP, sync_status = 'synced'
          WHERE uid = $1
        `;
        
        await query(updateSyncQuery, [record.uid]);
        return { action: 'no_change', id: record.uid };
      }
    }
  }

  /**
   * Check if there are discrepancies between existing and new data
   * @param {Object} existing 
   * @param {Object} newRecord 
   * @returns {boolean}
   */
  hasDiscrepancies(existing, newRecord) {
    const fieldsToCompare = [
      'jenis_izin', 'title', 'color', 'title_jenis', 'penyelenggara', 'pic',
      'email', 'status_email', 'id_user', 'app_name', 'id_jenis_izin', 'id_izin',
      'id_jenis_report', 'jenis_periode', 'jenis', 'tanggal', 'filename',
      'status', 'tahun', 'periode', 'api_status', 'api_jenis'
    ];

    for (const field of fieldsToCompare) {
      const existingValue = existing[field] || '';
      const newValue = newRecord[field] || '';
      
      if (existingValue !== newValue) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create sync log entry
   * @param {string} syncType 
   * @param {string} status 
   * @returns {Promise<number>}
   */
  async createSyncLog(syncType, status) {
    const insertQuery = `
      INSERT INTO public.kominfo_sync_log (sync_type, status)
      VALUES ($1, $2)
      RETURNING id
    `;
    
    const result = await query(insertQuery, [syncType, status]);
    return result.rows[0].id;
  }

  /**
   * Update sync log entry
   * @param {number} logId 
   * @param {string} status 
   * @param {Object} result 
   */
  async updateSyncLog(logId, status, result) {
    const updateQuery = `
      UPDATE public.kominfo_sync_log SET
        status = $2,
        total_records = $3,
        inserted_records = $4,
        updated_records = $5,
        error_records = $6,
        end_time = CURRENT_TIMESTAMP,
        duration_seconds = $7,
        error_message = $8
      WHERE id = $1
    `;
    
    await query(updateQuery, [
      logId,
      status,
      result.totalRecords,
      result.insertedRecords,
      result.updatedRecords,
      result.errorRecords,
      Math.round(result.duration / 1000),
      result.errors && result.errors.length > 0 ? result.errors.join('; ') : null
    ]);
  }

  /**
   * Get synchronization history
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getSyncHistory(limit = 10) {
    const queryText = `
      SELECT * FROM public.kominfo_sync_log
      ORDER BY start_time DESC
      LIMIT $1
    `;
    
    const result = await query(queryText, [limit]);
    return result.rows;
  }

  /**
   * Get latest synchronization status
   * @returns {Promise<Object>}
   */
  async getLatestSyncStatus() {
    const queryText = `
      SELECT * FROM public.kominfo_sync_log
      ORDER BY start_time DESC
      LIMIT 1
    `;
    
    const result = await query(queryText);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Utility function to chunk array into smaller arrays
   * @param {Array} array 
   * @param {number} size 
   * @returns {Array}
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Test database connection and table existence
   * @returns {Promise<Object>}
   */
  async testDatabaseConnection() {
    try {
      // Test connection
      await query('SELECT 1');
      
      // Test table existence
      const tableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'kominfo_tarif_data'
        )
      `;
      
      const tableResult = await query(tableQuery);
      const tableExists = tableResult.rows[0].exists;
      
      if (!tableExists) {
        return {
          success: false,
          message: 'Database table kominfo_tarif_data does not exist',
          error: 'Table not found'
        };
      }
      
      return {
        success: true,
        message: 'Database connection and table check successful'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Database test failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get synchronized data with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term
   * @returns {Promise<Object>}
   */
  async getSynchronizedData(options = {}) {
    console.log('🔍 getSynchronizedData called with options:', options);
    
    const {
      page = 1,
      limit = 10,
      search = null
    } = options;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    try {
      console.log('🔍 getSynchronizedData called with options:', options);
      
      // Build filters
      const filters = [];
      const params = [];
      let i = 1;

      if (search && typeof search === 'string') {
        filters.push(`
          (penyelenggara ILIKE $${i} OR
           pic ILIKE $${i} OR
           email ILIKE $${i} OR
           app_name ILIKE $${i} OR
           jenis ILIKE $${i} OR
           status ILIKE $${i})
        `);
        params.push(`%${search}%`);
        i++;
      }

      const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      console.log('🔍 Where clause:', whereSql);

      // Get total count
      const countQuery = `
        SELECT COUNT(*)::int AS total
        FROM public.kominfo_tarif_data
        ${whereSql}
      `;
      
      console.log('🔍 Count query:', countQuery);
      console.log('🔍 Query params:', params);
      
      const countResult = await query(countQuery, params);
      console.log('🔍 Count result:', countResult.rows);
      const total = countResult.rows[0]?.total || 0;

      // Get data with pagination
      const dataQuery = `
        SELECT
          id, uid, jenis_izin, title, color, title_jenis, penyelenggara, pic, email,
          status_email, id_user, app_name, id_jenis_izin, id_izin, id_jenis_report,
          jenis_periode, jenis, tanggal, filename, status, tahun, periode,
          api_status, api_jenis, last_synced_at, sync_status, sync_error,
          created_at, updated_at
        FROM public.kominfo_tarif_data
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      
      const dataParams = [...params, limitNum, offset];
      const dataResult = await query(dataQuery, dataParams);

      return {
        data: dataResult.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      };

    } catch (error) {
      console.error('Error fetching synchronized data:', error);
      throw new Error(`Failed to fetch synchronized data: ${error.message}`);
    }
  }
}

export default TarifSyncService;