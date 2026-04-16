// =============================================================================
// Base External System Adapter
// All external integrations (OSS, POSTEL, SDPPI, BPS, etc.) extend this class.
// Provides consistent interface: healthCheck, fetch, normalize, sync, deltaSync.
// =============================================================================

export class ExternalAdapter {
    constructor(config = {}) {
        this.systemName = config.systemName || 'unknown';
        this.apiBaseUrl = config.apiBaseUrl || '';
        this.authType = config.authType || 'none';
        this.authConfig = config.authConfig || {};
        this.timeout = config.timeout || 30000;
        this.maxRetries = config.maxRetries || 3;
        this.circuitBreakerThreshold = config.circuitBreakerThreshold || 5;
        this._consecutiveFailures = 0;
        this._circuitOpen = false;
    }

    /**
     * Test connectivity to the external system.
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        throw new Error(`${this.systemName}: healthCheck() not implemented`);
    }

    /**
     * Fetch data from the external system with retry and circuit breaker.
     * @param {object} params - Query parameters
     * @returns {Promise<{ok: boolean, status: number, data: unknown}>}
     */
    async fetch(params = {}) {
        if (this._circuitOpen) {
            return {
                ok: false,
                status: 503,
                data: { message: `${this.systemName}: circuit breaker open` },
            };
        }

        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await this._doFetch(params);
                this._consecutiveFailures = 0;
                return result;
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    await this._sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }

        this._consecutiveFailures++;
        if (this._consecutiveFailures >= this.circuitBreakerThreshold) {
            this._circuitOpen = true;
            console.warn(
                `[${this.systemName}] Circuit breaker OPEN after ${this._consecutiveFailures} failures`
            );
        }

        return {
            ok: false,
            status: 502,
            data: { message: `${this.systemName}: ${lastError?.message || 'fetch failed'}` },
        };
    }

    /**
     * Internal fetch implementation. Override in subclasses.
     */
    async _doFetch(_params) {
        throw new Error(`${this.systemName}: _doFetch() not implemented`);
    }

    /**
     * Normalize raw external data to Panel's telekom_data schema.
     * @param {unknown} rawData - Raw data from external system
     * @returns {Array<object>} Normalized records
     */
    normalize(rawData) {
        throw new Error(`${this.systemName}: normalize() not implemented`);
    }

    /**
     * Full sync — fetch all records and upsert into telekom_data.
     */
    async sync() {
        throw new Error(`${this.systemName}: sync() not implemented`);
    }

    /**
     * Incremental sync — fetch records changed since `since`.
     * @param {Date} since
     */
    async deltaSync(since) {
        throw new Error(`${this.systemName}: deltaSync() not implemented`);
    }

    /**
     * Reset circuit breaker (e.g., after manual intervention).
     */
    resetCircuitBreaker() {
        this._circuitOpen = false;
        this._consecutiveFailures = 0;
    }

    /**
     * Build auth headers based on authType.
     */
    _getAuthHeaders() {
        switch (this.authType) {
            case 'api_key':
                return { Authorization: `Bearer ${this.authConfig.apiKey || ''}` };
            case 'basic': {
                const creds = Buffer.from(
                    `${this.authConfig.username || ''}:${this.authConfig.password || ''}`
                ).toString('base64');
                return { Authorization: `Basic ${creds}` };
            }
            case 'oauth2':
                return { Authorization: `Bearer ${this.authConfig.accessToken || ''}` };
            default:
                return {};
        }
    }

    _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
