import cron from 'node-cron';
import TarifSyncService from './tarifSyncService.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Background Job Service for Kominfo Tarif Synchronization
 * Handles scheduled and manual synchronization tasks
 */
export class BackgroundJobService {
  constructor() {
    this.syncService = new TarifSyncService();
    this.isEnabled = process.env.KOMINFO_SYNC_ENABLED === 'true';
    this.jobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize background jobs
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('Background job service already initialized');
      return;
    }

    console.log('Initializing background job service...');
    
    // Test database connection first
    const dbTest = await this.syncService.testDatabaseConnection();
    if (!dbTest.success) {
      console.error('Database connection test failed:', dbTest.message);
      return;
    }

    if (this.isEnabled) {
      await this.setupScheduledJobs();
      console.log('Background job service initialized successfully');
    } else {
      console.log('Background job service disabled (KOMINFO_SYNC_ENABLED=false)');
    }

    this.isInitialized = true;
  }

  /**
   * Setup scheduled cron jobs
   */
  async setupScheduledJobs() {
    try {
      // Daily sync at 2:00 AM
      const dailyJob = cron.schedule('0 2 * * *', async () => {
        console.log('Starting scheduled daily sync...');
        await this.executeScheduledSync('daily');
      }, {
        scheduled: false,
        timezone: 'Asia/Jakarta'
      });

      this.jobs.set('daily', dailyJob);
      dailyJob.start();
      console.log('Daily sync job scheduled for 2:00 AM WIB');

      // Weekly sync on Sundays at 1:00 AM
      const weeklyJob = cron.schedule('0 1 * * 0', async () => {
        console.log('Starting scheduled weekly sync...');
        await this.executeScheduledSync('weekly');
      }, {
        scheduled: false,
        timezone: 'Asia/Jakarta'
      });

      this.jobs.set('weekly', weeklyJob);
      weeklyJob.start();
      console.log('Weekly sync job scheduled for Sunday 1:00 AM WIB');

    } catch (error) {
      console.error('Error setting up scheduled jobs:', error);
    }
  }

  /**
   * Execute scheduled synchronization
   * @param {string} type - 'daily' or 'weekly'
   */
  async executeScheduledSync(type = 'daily') {
    try {
      console.log(`Executing ${type} scheduled sync...`);
      
      const result = await this.syncService.synchronize({
        syncType: 'scheduled',
        params: {
          tahun: new Date().getFullYear(),
          periode: 'bulanan'
        }
      });

      if (result.success) {
        console.log(`${type} sync completed:`, {
          total: result.totalRecords,
          inserted: result.insertedRecords,
          updated: result.updatedRecords,
          errors: result.errorRecords
        });
      } else {
        console.error(`${type} sync failed:`, result.message);
      }

    } catch (error) {
      console.error(`Error executing ${type} scheduled sync:`, error);
    }
  }

  /**
   * Execute manual synchronization
   * @param {Object} options - Sync options
   * @returns {Promise<Object>}
   */
  async executeManualSync(options = {}) {
    try {
      console.log('Executing manual sync...');
      
      const result = await this.syncService.synchronize({
        syncType: 'manual',
        ...options
      });

      return result;

    } catch (error) {
      console.error('Error executing manual sync:', error);
      return {
        success: false,
        message: `Manual sync failed: ${error.message}`,
        totalRecords: 0,
        insertedRecords: 0,
        updatedRecords: 0,
        errorRecords: 0,
        errors: [error.message],
        duration: 0
      };
    }
  }

  /**
   * Get synchronization status
   * @returns {Promise<Object>}
   */
  async getSyncStatus() {
    try {
      const latestSync = await this.syncService.getLatestSyncStatus();
      const syncHistory = await this.syncService.getSyncHistory(5);
      
      return {
        success: true,
        data: {
          latestSync,
          syncHistory,
          jobsRunning: Array.from(this.jobs.keys()),
          isEnabled: this.isEnabled,
          isInitialized: this.isInitialized
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get sync status: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<Object>}
   */
  async testApiConnection() {
    try {
      const result = await this.syncService.kominfoService.testConnection();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `API test failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get job statistics
   * @returns {Object}
   */
  getJobStatistics() {
    const stats = {
      totalJobs: this.jobs.size,
      runningJobs: [],
      enabled: this.isEnabled,
      initialized: this.isInitialized
    };

    for (const [name, job] of this.jobs) {
      stats.runningJobs.push({
        name,
        running: job.running || false
      });
    }

    return stats;
  }

  /**
   * Stop all jobs
   */
  stopAllJobs() {
    console.log('Stopping all background jobs...');
    
    for (const [name, job] of this.jobs) {
      try {
        job.stop();
        console.log(`Stopped job: ${name}`);
      } catch (error) {
        console.error(`Error stopping job ${name}:`, error);
      }
    }
    
    this.jobs.clear();
  }

  /**
   * Restart jobs
   */
  async restartJobs() {
    console.log('Restarting background jobs...');
    
    this.stopAllJobs();
    
    if (this.isEnabled) {
      await this.setupScheduledJobs();
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down background job service...');
    this.stopAllJobs();
    this.isInitialized = false;
  }

  /**
   * Force sync trigger (for testing)
   * @param {string} type - Job type to trigger
   */
  async forceTrigger(type = 'daily') {
    if (!this.jobs.has(type)) {
      throw new Error(`Job type '${type}' not found`);
    }

    console.log(`Force triggering ${type} job...`);
    
    if (type === 'daily') {
      await this.executeScheduledSync('daily');
    } else if (type === 'weekly') {
      await this.executeScheduledSync('weekly');
    }
  }
}

// Create singleton instance
const backgroundJobService = new BackgroundJobService();

export default backgroundJobService;