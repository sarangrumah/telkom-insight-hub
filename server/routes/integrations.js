import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

// =============================================================================
// Auto-initialize sync_configurations table and seed data
// =============================================================================
let tableInitialized = false;
async function ensureSyncConfigTable() {
    if (tableInitialized) return;
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS public.sync_configurations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                system_name VARCHAR(100) UNIQUE NOT NULL,
                adapter_class VARCHAR(100) NOT NULL,
                api_base_url TEXT,
                auth_type VARCHAR(50),
                auth_config JSONB,
                sync_interval_minutes INT DEFAULT 60,
                is_active BOOLEAN DEFAULT false,
                last_sync_at TIMESTAMPTZ,
                last_sync_status VARCHAR(20),
                last_sync_record_count INT,
                last_error_message TEXT,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        `);
        // Add new columns if they don't exist (for existing tables)
        try {
            await query(`ALTER TABLE public.sync_configurations ADD COLUMN IF NOT EXISTS display_name TEXT`);
            await query(`ALTER TABLE public.sync_configurations ADD COLUMN IF NOT EXISTS description TEXT`);
        } catch (alterErr) {
            console.warn('[Integrations] ALTER TABLE warning (columns may already exist):', alterErr.message);
        }

        await query(`
            INSERT INTO public.sync_configurations (system_name, adapter_class, api_base_url, auth_type, is_active, display_name, description)
            VALUES
                ('etelekomunikasi', 'EtelekomunikasiAdapter', NULL, 'api_key', true, 'e-Telekomunikasi', 'Licensing data from the main e-Telekomunikasi system'),
                ('bps', 'BpsAdapter', 'https://webapi.bps.go.id/v1', 'api_key', false, 'BPS (Badan Pusat Statistik)', 'Statistical data from webapi.bps.go.id'),
                ('kominfo_tarif', 'KominfoTarifAdapter', NULL, 'api_key', false, 'KOMINFO Tarif', 'Tariff data synchronization from KOMINFO'),
                ('oss', 'OssAdapter', NULL, 'oauth2', false, 'OSS (Online Single Submission)', 'Business licensing — NIB and KBLI cross-reference'),
                ('postel', 'PostelAdapter', NULL, 'api_key', false, 'POSTEL Legacy', 'Historical telecom licensing records'),
                ('sdppi', 'SdppiAdapter', NULL, 'api_key', false, 'SDPPI Spectrum', 'Radio frequency spectrum allocation data')
            ON CONFLICT (system_name) DO NOTHING
        `);
        tableInitialized = true;
        console.log('[Integrations] sync_configurations table ready');
    } catch (e) {
        console.error('[Integrations] Table init error:', e.message);
    }
}

// =============================================================================
// GET /v2/panel/api/integrations
// List all sync configurations with status
// =============================================================================
router.get('/integrations', requireAuth, async (req, res) => {
    try {
        await ensureSyncConfigTable();
        const { rows } = await query(`
            SELECT
                id, system_name, display_name, description, adapter_class, api_base_url, auth_type,
                sync_interval_minutes, is_active,
                last_sync_at, last_sync_status, last_sync_record_count,
                last_error_message, created_at, updated_at
            FROM public.sync_configurations
            ORDER BY system_name ASC
        `);

        return res.json({ success: true, data: rows });
    } catch (e) {
        console.error('[Integrations] List error:', e.message);
        return res.status(500).json({ error: 'Failed to list integrations' });
    }
});

// =============================================================================
// GET /v2/panel/api/integrations/:systemName
// Get single integration detail
// =============================================================================
router.get('/integrations/:systemName', requireAuth, async (req, res) => {
    try {
        const { systemName } = req.params;
        const { rows } = await query(
            'SELECT * FROM public.sync_configurations WHERE system_name = $1 LIMIT 1',
            [systemName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        // Mask auth_config secrets
        const config = rows[0];
        if (config.auth_config) {
            const masked = { ...config.auth_config };
            for (const key of Object.keys(masked)) {
                if (typeof masked[key] === 'string' && masked[key].length > 4) {
                    masked[key] = masked[key].slice(0, 4) + '****';
                }
            }
            config.auth_config = masked;
        }

        return res.json({ success: true, data: config });
    } catch (e) {
        console.error('[Integrations] Detail error:', e.message);
        return res.status(500).json({ error: 'Failed to get integration detail' });
    }
});

// =============================================================================
// PATCH /v2/panel/api/integrations/:systemName
// Update integration config (toggle active, update URL, interval, auth)
// =============================================================================
router.patch('/integrations/:systemName', requireAuth, async (req, res) => {
    try {
        await ensureSyncConfigTable();
        const { systemName } = req.params;
        const { api_base_url, auth_type, auth_config, sync_interval_minutes, is_active } = req.body;

        const fields = [];
        const values = [];
        let idx = 1;

        if (api_base_url !== undefined) {
            fields.push(`api_base_url = $${idx++}`);
            values.push(api_base_url);
        }
        if (auth_type !== undefined) {
            fields.push(`auth_type = $${idx++}`);
            values.push(auth_type);
        }
        if (auth_config !== undefined) {
            fields.push(`auth_config = $${idx++}::jsonb`);
            values.push(JSON.stringify(auth_config));
        }
        if (sync_interval_minutes !== undefined) {
            fields.push(`sync_interval_minutes = $${idx++}`);
            values.push(sync_interval_minutes);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${idx++}`);
            values.push(is_active);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        fields.push(`updated_at = now()`);
        values.push(systemName);

        const { rows } = await query(
            `UPDATE public.sync_configurations SET ${fields.join(', ')}
             WHERE system_name = $${idx}
             RETURNING id, system_name, is_active, api_base_url, sync_interval_minutes, updated_at`,
            values
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (e) {
        console.error('[Integrations] Update error:', e.message);
        return res.status(500).json({ error: 'Failed to update integration' });
    }
});

// =============================================================================
// POST /v2/panel/api/integrations/:systemName/sync
// Trigger a manual sync for a specific integration
// =============================================================================
router.post('/integrations/:systemName/sync', requireAuth, async (req, res) => {
    try {
        await ensureSyncConfigTable();
        const { systemName } = req.params;

        // Get config
        const { rows } = await query(
            'SELECT * FROM public.sync_configurations WHERE system_name = $1 LIMIT 1',
            [systemName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        const config = rows[0];
        if (!config.is_active) {
            return res.status(400).json({ error: 'Integration is not active. Enable it first.' });
        }

        // Update last_sync_at to mark sync started
        await query(
            `UPDATE public.sync_configurations
             SET last_sync_at = now(), last_sync_status = 'running', updated_at = now()
             WHERE system_name = $1`,
            [systemName]
        );

        // Attempt sync based on adapter type
        let result;
        try {
            switch (systemName) {
                case 'etelekomunikasi': {
                    const { healthCheck, getStatistics } = await import('../services/external/etelekom-client.js');
                    const healthy = await healthCheck();
                    if (!healthy) throw new Error('e-Telekomunikasi service unreachable');
                    const stats = await getStatistics();
                    result = {
                        records: stats.ok ? 1 : 0,
                        status: stats.ok ? 'success' : 'failed',
                        message: stats.ok ? 'Statistics fetched successfully' : 'Failed to fetch statistics',
                    };
                    break;
                }
                case 'bps': {
                    // Try to verify BPS API connectivity
                    try {
                        const { default: BPSAPIFetcherService } = await import('../services/bpsAPIFetcherService.js');
                        const fetcher = new BPSAPIFetcherService();
                        const connTest = await fetcher.testConnection();
                        result = {
                            records: connTest.success ? 1 : 0,
                            status: connTest.success ? 'success' : 'failed',
                            message: connTest.success ? 'BPS API connection verified' : (connTest.error || 'BPS API unreachable'),
                        };
                    } catch (bpsErr) {
                        result = { records: 0, status: 'failed', message: bpsErr.message || 'BPS sync error' };
                    }
                    break;
                }
                default: {
                    result = { records: 0, status: 'not_configured', message: `${systemName} adapter not yet implemented` };
                    break;
                }
            }
        } catch (syncErr) {
            result = { records: 0, status: 'failed', message: syncErr.message };
        }

        // Update sync result
        await query(
            `UPDATE public.sync_configurations
             SET last_sync_status = $2,
                 last_sync_record_count = $3,
                 last_error_message = $4,
                 updated_at = now()
             WHERE system_name = $1`,
            [systemName, result.status, result.records, result.status === 'failed' ? result.message : null]
        );

        return res.json({ success: true, data: result });
    } catch (e) {
        console.error('[Integrations] Sync error:', e.message);
        return res.status(500).json({ error: 'Sync failed' });
    }
});

// =============================================================================
// POST /v2/panel/api/integrations
// Create a new integration
// =============================================================================
router.post('/integrations', requireAuth, async (req, res) => {
    try {
        await ensureSyncConfigTable();
        const {
            system_name, display_name, description,
            adapter_class, api_base_url, auth_type, auth_config,
            sync_interval_minutes
        } = req.body;

        if (!system_name) {
            return res.status(400).json({ error: 'system_name is required' });
        }

        const adapterClass = adapter_class || 'CustomAdapter';

        const { rows } = await query(
            `INSERT INTO public.sync_configurations
                (system_name, display_name, description, adapter_class, api_base_url, auth_type, auth_config, sync_interval_minutes)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
             RETURNING *`,
            [
                system_name,
                display_name || null,
                description || null,
                adapterClass,
                api_base_url || null,
                auth_type || null,
                auth_config ? JSON.stringify(auth_config) : null,
                sync_interval_minutes || 60
            ]
        );

        return res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(409).json({ error: `Integration '${req.body.system_name}' already exists` });
        }
        console.error('[Integrations] Create error:', e.message);
        return res.status(500).json({ error: 'Failed to create integration' });
    }
});

// =============================================================================
// DELETE /v2/panel/api/integrations/:systemName
// Delete an integration
// =============================================================================
router.delete('/integrations/:systemName', requireAuth, async (req, res) => {
    try {
        await ensureSyncConfigTable();
        const { systemName } = req.params;

        const { rowCount } = await query(
            'DELETE FROM public.sync_configurations WHERE system_name = $1',
            [systemName]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        return res.json({ success: true, message: `Integration '${systemName}' deleted` });
    } catch (e) {
        console.error('[Integrations] Delete error:', e.message);
        return res.status(500).json({ error: 'Failed to delete integration' });
    }
});

// =============================================================================
// GET /v2/panel/api/integrations/health/all
// Quick health check for all integrations
// =============================================================================
router.get('/integrations/health/all', requireAuth, async (req, res) => {
    try {
        const { rows: configs } = await query(
            'SELECT system_name, is_active, last_sync_at, last_sync_status FROM public.sync_configurations ORDER BY system_name'
        );

        const health = {};
        for (const c of configs) {
            health[c.system_name] = {
                active: c.is_active,
                lastSync: c.last_sync_at,
                lastStatus: c.last_sync_status,
            };
        }

        // Check e-telekomunikasi connectivity
        try {
            const { healthCheck } = await import('../services/external/etelekom-client.js');
            health.etelekomunikasi = { ...health.etelekomunikasi, reachable: await healthCheck() };
        } catch {
            health.etelekomunikasi = { ...health.etelekomunikasi, reachable: false };
        }

        return res.json({ success: true, data: health });
    } catch (e) {
        console.error('[Integrations] Health error:', e.message);
        return res.status(500).json({ error: 'Health check failed' });
    }
});

export default router;
