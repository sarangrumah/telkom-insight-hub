// =============================================================================
// SDPPI Spectrum Data Integration Adapter
// Radio frequency spectrum allocation and licensing data.
// Status: SCAFFOLD — API auth details pending from KOMDIGI.
// =============================================================================

import { ExternalAdapter } from './base-adapter.js';

export class SdppiAdapter extends ExternalAdapter {
    constructor(config = {}) {
        super({
            systemName: 'sdppi',
            authType: 'api_key',
            ...config,
        });
    }

    async healthCheck() {
        if (!this.apiBaseUrl) return false;
        try {
            const res = await fetch(`${this.apiBaseUrl}/health`, {
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
        // Expected: query spectrum allocations by frequency band, region, licensee
        throw new Error('SDPPI integration not yet configured — awaiting API credentials');
    }

    normalize(rawData) {
        // TODO: Map SDPPI response to telekom_data schema
        // Expected: spectrum allocation records with frequency, power, location, licensee
        return [];
    }

    async sync() {
        console.log('[SDPPI] Full sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }

    async deltaSync(since) {
        console.log('[SDPPI] Delta sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }
}
