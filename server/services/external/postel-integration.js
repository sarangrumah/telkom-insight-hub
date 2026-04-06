// =============================================================================
// POSTEL Legacy System Integration Adapter
// Historical telecom licensing records from the previous POSTEL system.
// Status: SCAFFOLD — API auth details pending from KOMDIGI.
// =============================================================================

import { ExternalAdapter } from './base-adapter.js';

export class PostelAdapter extends ExternalAdapter {
    constructor(config = {}) {
        super({
            systemName: 'postel',
            authType: 'api_key',
            ...config,
        });
    }

    async healthCheck() {
        if (!this.apiBaseUrl) return false;
        try {
            const res = await fetch(`${this.apiBaseUrl}/ping`, {
                headers: this._getAuthHeaders(),
                signal: AbortSignal.timeout(5000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async _doFetch(params = {}) {
        // TODO: Implement when API auth is received from KOMDIGI
        // Expected: query historical telecom licenses by company name, date range
        throw new Error('POSTEL integration not yet configured — awaiting API credentials');
    }

    normalize(rawData) {
        // TODO: Map POSTEL response to telekom_data schema
        // Expected: legacy license records with document numbers, dates, company info
        return [];
    }

    async sync() {
        console.log('[POSTEL] Full sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }

    async deltaSync(since) {
        console.log('[POSTEL] Delta sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }
}
