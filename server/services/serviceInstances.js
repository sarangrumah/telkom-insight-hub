import KominfoTarifService from './kominfoTarifService.js';
import TarifSyncService from './tarifSyncService.js';

// Create service instances
const kominfoTarifService = new KominfoTarifService();
const tarifSyncService = new TarifSyncService();

// Export function wrappers for easier usage
export const kominfoService = {
  testAPIConnection: () => kominfoTarifService.testConnection(),
  fetchAllData: (params) => kominfoTarifService.fetchAllData(params),
  transformApiData: (data, params) => kominfoTarifService.transformApiData(data, params),
  buildApiUrl: (params) => kominfoTarifService.buildApiUrl(params)
};

export const syncService = {
  syncWithKominfoAPI: (params) => tarifSyncService.synchronize({ syncType: 'manual', params }),
  getSyncStatus: () => tarifSyncService.getLatestSyncStatus(),
  getSyncHistory: (limit) => tarifSyncService.getSyncHistory(limit),
  getSynchronizedData: (options) => tarifSyncService.getSynchronizedData(options)
};

export default {
  kominfoService,
  syncService
};