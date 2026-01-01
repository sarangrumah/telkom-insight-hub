import express from 'express';
import { kominfoService, syncService } from '../services/serviceInstances.js';

const router = express.Router();

// Manual sync endpoint
router.post('/kominfo-sync/sync/manual', async (req, res) => {
  try {
    console.log('🎯 Manual sync triggered via API');
    
    // Get parameters from request body or use defaults
    const {
      tahun = parseInt(process.env.KOMINFO_TARIF_DEFAULT_TAHUN) || 2024,
      periode = process.env.KOMINFO_TARIF_DEFAULT_PERIODE || 'bulanan'
    } = req.body || {};
    
    console.log(`📊 Sync parameters: tahun=${tahun}, periode=${periode}`);
    
    // Start sync process
    const result = await syncService.syncWithKominfoAPI({
      tahun,
      periode
    });
    
    console.log('✅ Manual sync completed:', result);
    
    res.json({
      success: true,
      message: 'Data successfully synchronized from Kominfo API',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize data from Kominfo API',
      error: error.message
    });
  }
});

// Get sync status endpoint
router.get('/kominfo-sync/sync/status', async (req, res) => {
  try {
    const status = await syncService.getSyncStatus();
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ Failed to get sync status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
});

// Get sync history endpoint
router.get('/kominfo-sync/sync/history', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const history = await syncService.getSyncHistory(parseInt(limit) || 10);
    
    res.json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('❌ Failed to get sync history:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get sync history',
      error: error.message
    });
  }
});

// Get synchronized data endpoint
router.get('/kominfo-sync/data', async (req, res) => {
  try {
    console.log('🔍 Route: /kominfo-sync/data called');
    console.log('🔍 Query params:', req.query);
    
    const { page = 1, limit = 10, search } = req.query;
    console.log('🔍 Parsed params:', { page, limit, search });
    
    const data = await syncService.getSynchronizedData({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || null
    });
    
    console.log('🔍 Data returned from service:', data);
    
    res.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('❌ Failed to get synchronized data:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get synchronized data',
      error: error.message
    });
  }
});

// Test API connectivity endpoint
router.get('/kominfo-sync/sync/test-api', async (req, res) => {
  try {
    console.log('🧪 Testing Kominfo API connectivity...');
    
    const testResult = await kominfoService.testAPIConnection();
    
    res.json({
      success: true,
      message: 'API connectivity test completed',
      data: testResult
    });
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'API connectivity test failed',
      error: error.message
    });
  }
});

export default router;