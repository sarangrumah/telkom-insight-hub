import axios from 'axios';
import BPSDataService from './bpsDataService.js';

/**
 * BPS API Fetcher Service
 * Handles communication with BPS Web API v1 with rate limiting and error handling
 * Implements the path-based parameter system and hierarchical area handling
 * Now integrates with existing area tables via UUIDs
 */
export class BPSAPIFetcherService {
  constructor() {
    this.baseURL = 'https://webapi.bps.go.id/v1/api/view';
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.rateLimitWindow = 3600000; // 1 hour in milliseconds
    this.maxRequestsPerWindow = 1000; // Default rate limit
    this.requestTimestamps = [];
    this.dataService = new BPSDataService();
  }

  /**
   * Test connection to BPS API
   * @returns {Promise<Object>}
   */
  async testConnection() {
    try {
      // Use a simple endpoint for testing (domain=0 usually returns metadata)
      const testUrl = `${this.baseURL}/domain/0/model/dynamictable/lang/ind/key/test`;
      
      const response = await axios.get(testUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses for testing
      });

      return {
        success: true,
        message: 'BPS API connection successful',
        status: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A'
      };
    } catch (error) {
      return {
        success: false,
        message: `BPS API connection failed: ${error.message}`,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Build BPS API URL with path-based parameters
   * @param {Object} params - API parameters
   * @returns {string} Formatted API URL
   */
  buildAPIURL(params) {
    const {
      domainCode,
      variableID,
      years,
      language = 'ind',
      apiKey
    } = params;

    // Convert years array to comma-separated string
    const yearsParam = Array.isArray(years) ? years.join(',') : years.toString();

    // Path-based parameter system (not query params!)
    return `${this.baseURL}/domain/${domainCode}/model/dynamictable/lang/${language}/var/${variableID}/th/${yearsParam}/key/${apiKey}`;
  }

  /**
   * Check if we can make a request (rate limiting)
   * @returns {boolean}
   */
  canMakeRequest() {
    const now = Date.now();
    
    // Remove timestamps outside the current window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );

    return this.requestTimestamps.length < this.maxRequestsPerWindow;
  }

  /**
   * Wait for rate limit to allow requests
   * @returns {Promise<void>}
   */
  async waitForRateLimit() {
    while (!this.canMakeRequest()) {
      const oldestRequest = Math.min(...this.requestTimestamps);
      const waitTime = this.rateLimitWindow - (Date.now() - oldestRequest) + 1000; // Add 1 second buffer
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break;
      }
    }
  }

  /**
   * Record a request timestamp
   */
  recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Fetch data from BPS API with retry logic
   * @param {Object} params - API parameters
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>}
   */
  async fetchData(params, maxRetries = 3) {
    const url = this.buildAPIURL(params);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait for rate limit
        await this.waitForRateLimit();
        this.recordRequest();

        console.log(`Fetching BPS data (attempt ${attempt}/${maxRetries}):`, {
          url: url.replace(params.apiKey, '***API_KEY***'),
          domain: params.domainCode,
          variable: params.variableID,
          years: params.years
        });

        const startTime = Date.now();
        const response = await axios.get(url, {
          timeout: 30000, // 30 second timeout
          headers: {
            'User-Agent': 'TelkomInsightHub/1.0',
            'Accept': 'application/json'
          }
        });
        const responseTime = Date.now() - startTime;

        // Log successful request
        await this.logAPIRequest({
          requestUrl: url,
          requestMethod: 'GET',
          requestParams: params,
          responseStatus: response.status,
          responseTime,
          responseSize: JSON.stringify(response.data).length,
          syncHistoryId: null
        });

        // Validate response structure
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format from BPS API');
        }

        return {
          success: true,
          data: response.data,
          meta: {
            responseTime,
            status: response.status,
            attempt,
            url: url.replace(params.apiKey, '***API_KEY***')
          }
        };

      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        // Log failed request
        await this.logAPIRequest({
          requestUrl: url,
          requestMethod: 'GET',
          requestParams: params,
          responseStatus: error.response?.status,
          responseTime: Date.now() - (Date.now() - (error.config?.timeout || 30000)),
          errorMessage: error.message,
          errorCode: error.response?.data?.error?.code || error.code,
          syncHistoryId: null
        });

        if (isLastAttempt) {
          return {
            success: false,
            error: `Failed after ${maxRetries} attempts: ${error.message}`,
            details: {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              code: error.response?.data?.error?.code || error.code
            },
            attempt
          };
        }

        // Exponential backoff for retries
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        console.log(`Request failed (attempt ${attempt}), retrying in ${backoffTime}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    return {
      success: false,
      error: 'Unexpected error in fetch logic'
    };
  }

  /**
   * Map BPS area codes to UUIDs from existing tables
   * @param {Array} bpsAreaCodes - Array of BPS area codes
   * @returns {Promise<Object>} Mapped area information
   */
  async mapAreaCodesToUUIDs(bpsAreaCodes) {
    try {
      const mappedAreas = [];
      
      for (const bpsCode of bpsAreaCodes) {
        const areaResult = await this.dataService.getAreaByBPSCode(bpsCode);
        
        if (areaResult.success && areaResult.data) {
          mappedAreas.push({
            bpsCode,
            areaType: areaResult.data.area_type,
            areaId: areaResult.data.area_id,
            areaCode: areaResult.data.area_code,
            areaName: areaResult.data.area_name,
            parentName: areaResult.data.parent_name
          });
        } else {
          console.warn(`No matching area found for BPS code: ${bpsCode}`);
        }
      }
      
      return {
        success: true,
        data: mappedAreas,
        unmappedCodes: bpsAreaCodes.filter(code => 
          !mappedAreas.some(area => area.bpsCode === code)
        )
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to map area codes: ${error.message}`,
        data: [],
        unmappedCodes: bpsAreaCodes
      };
    }
  }

  /**
   * Get monitored areas with BPS codes for API calls
   * @param {Object} filters - Filters for area selection
   * @returns {Promise<Object>}
   */
  async getMonitoredAreasForAPI(filters = {}) {
    try {
      const monitoredAreasResult = await this.dataService.getMonitoredAreas(filters);
      
      if (!monitoredAreasResult.success) {
        return monitoredAreasResult;
      }
      
      // Extract BPS codes and area information
      const areasForAPI = monitoredAreasResult.data.map(area => ({
        bpsCode: area.area_code,
        areaId: area.area_id,
        areaType: area.area_type,
        areaName: area.area_name,
        isActive: area.is_active
      }));
      
      return {
        success: true,
        data: areasForAPI,
        count: areasForAPI.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get monitored areas for API: ${error.message}`
      };
    }
  }

  /**
   * Fetch data for multiple areas with UUID mapping
   * @param {Array} bpsAreaCodes - Array of BPS area codes
   * @param {string} variableID - BPS variable ID
   * @param {Array} years - Years to fetch
   * @param {string} apiKey - BPS API key
   * @returns {Promise<Object>}
   */
  async fetchBatchDataWithUUIDMapping(bpsAreaCodes, variableID, years, apiKey) {
    try {
      // First, map BPS codes to UUIDs
      const mappingResult = await this.mapAreaCodesToUUIDs(bpsAreaCodes);
      
      if (!mappingResult.success) {
        return mappingResult;
      }
      
      const mappedAreas = mappingResult.data;
      const bpsCodes = mappedAreas.map(area => area.bpsCode);
      
      console.log(`Starting batch fetch for ${bpsCodes.length} mapped areas, variable ${variableID}, years ${years.join(', ')}`);
      
      // Fetch data from BPS API
      const fetchResult = await this.fetchBatchData(bpsCodes, variableID, years, apiKey);
      
      if (!fetchResult.success) {
        return fetchResult;
      }
      
      // Attach UUID information to results
      const resultsWithUUIDs = fetchResult.results.map(result => {
        const mappedArea = mappedAreas.find(area => area.bpsCode === result.areaCode);
        return {
          ...result,
          areaId: mappedArea?.areaId,
          areaType: mappedArea?.areaType,
          areaName: mappedArea?.areaName
        };
      });
      
      return {
        success: true,
        results: resultsWithUUIDs,
        errors: fetchResult.errors,
        summary: {
          ...fetchResult.summary,
          mappedAreas: mappedAreas.length,
          unmappedCodes: mappingResult.unmappedCodes
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch batch data with UUID mapping: ${error.message}`
      };
    }
  }

  /**
   * Fetch data for multiple areas in batch
   * @param {Array} areas - Array of area codes
   * @param {string} variableID - BPS variable ID
   * @param {Array} years - Years to fetch
   * @param {string} apiKey - BPS API key
   * @returns {Promise<Object>}
   */
  async fetchBatchData(areas, variableID, years, apiKey) {
    const results = [];
    const errors = [];
    
    console.log(`Starting batch fetch for ${areas.length} areas, variable ${variableID}, years ${years.join(', ')}`);
    
    for (const areaCode of areas) {
      try {
        const result = await this.fetchData({
          domainCode: areaCode,
          variableID,
          years,
          apiKey
        });
        
        if (result.success) {
          results.push({
            areaCode,
            data: result.data,
            meta: result.meta
          });
        } else {
          errors.push({
            areaCode,
            error: result.error,
            details: result.details
          });
        }
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors.push({
          areaCode,
          error: error.message,
          details: error
        });
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: areas.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }

  /**
   * Log API request to database
   * @param {Object} logData - Request log data
   */
  async logAPIRequest(logData) {
    try {
      const result = await this.dataService.logAPIRequest({
        request_url: logData.requestUrl,
        request_method: logData.requestMethod,
        request_params: logData.requestParams,
        response_status: logData.responseStatus,
        response_time_ms: logData.responseTime,
        response_size_bytes: logData.responseSize,
        error_message: logData.errorMessage,
        error_code: logData.errorCode,
        rate_limit_remaining: logData.rateLimitRemaining,
        rate_limit_reset_time: logData.rateLimitResetTime,
        sync_history_id: logData.syncHistoryId
      });
      
      if (!result.success) {
        console.warn('Failed to log API request to database:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to log API request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get rate limit status
   * @returns {Object}
   */
  getRateLimitStatus() {
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );
    
    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.maxRequestsPerWindow,
      windowMs: this.rateLimitWindow,
      canMakeRequest: this.canMakeRequest(),
      resetTime: recentRequests.length > 0 ? 
        Math.min(...recentRequests) + this.rateLimitWindow : now
    };
  }

  /**
   * Set rate limit configuration
   * @param {number} maxRequests - Maximum requests per window
   * @param {number} windowMs - Window size in milliseconds
   */
  setRateLimit(maxRequests, windowMs = 3600000) {
    this.maxRequestsPerWindow = maxRequests;
    this.rateLimitWindow = windowMs;
    console.log(`Rate limit updated: ${maxRequests} requests per ${windowMs/1000} seconds`);
  }

  /**
   * Sync monitored areas from existing tables
   * @returns {Promise<Object>}
   */
  async syncMonitoredAreas() {
    try {
      const result = await this.dataService.syncMonitoredAreas();
      
      if (result.success) {
        console.log(`Successfully synced ${result.data.syncedCount} monitored areas`);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to sync monitored areas: ${error.message}`
      };
    }
  }
}

export default BPSAPIFetcherService;