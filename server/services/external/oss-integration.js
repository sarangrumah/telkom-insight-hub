// =============================================================================
// OSS (Online Single Submission) Integration Adapter
// Cross-references NIB and KBLI data from the national business licensing system.
// Status: SCAFFOLD — API auth details pending from KOMDIGI.
// =============================================================================

import { ExternalAdapter } from './base-adapter.js';

export class OssAdapter extends ExternalAdapter {
    constructor(config = {}) {
        super({
            systemName: 'oss',
            authType: 'oauth2',
            ...config,
        });
    }

    async healthCheck() {
        if (!this.apiBaseUrl) return false;
        try {
            const res = await fetch(`${this.apiBaseUrl}/health`, {
                signal: AbortSignal.timeout(5000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async _doFetch(params = {}) {
        // TODO: Implement when API auth is received from KOMDIGI
        // Expected: query by NIB or KBLI to get business entity data
        throw new Error('OSS integration not yet configured — awaiting API credentials');
    }

    normalize(rawData) {
        // TODO: Map OSS response to telekom_data schema
        // Expected fields: company_name, nib, kbli, address, license_status
        return [];
    }

    async sync() {
        // TODO: Full sync from OSS
        console.log('[OSS] Full sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }

    async deltaSync(since) {
        // TODO: Incremental sync
        console.log('[OSS] Delta sync not yet implemented');
        return { records: 0, status: 'not_configured' };
    }
}
