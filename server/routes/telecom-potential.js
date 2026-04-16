import express from 'express';
import { requireAuth } from '../auth.js';
import {
  fetchAndCacheIndicators,
  computeScores,
  getScores,
  getIndicators,
  getAvailableYears,
  fetchProvinces,
  INDICATOR_DEFINITIONS,
} from '../services/telecomPotentialService.js';
import {
  getConfig as getV2Config,
  saveConfig as saveV2Config,
  getAreaLicenseStats,
  computeAreaScores,
  getScores as getV2Scores,
  getMapGeoJSON,
  getAreaDetail,
  SERVICE_TYPES,
} from '../services/telecomPotentialV2Service.js';

const router = express.Router();

// =============================================================================
// GET /v2/panel/api/telecom-potential/scores
// Get computed telecom potential scores for all provinces
// Query: ?year=2024
// =============================================================================
router.get('/telecom-potential/scores', requireAuth, async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const scores = await getScores(year);

    return res.json({
      success: true,
      data: scores,
      meta: {
        year: year || new Date().getFullYear() - 1,
        total: scores.length,
        indicators: INDICATOR_DEFINITIONS,
      },
    });
  } catch (e) {
    console.error('[Telecom Potential] scores error:', e.message);
    return res.status(500).json({ error: 'Failed to get scores' });
  }
});

// =============================================================================
// GET /v2/panel/api/telecom-potential/indicators/:domainId
// Get raw BPS indicators for a specific province/domain
// Query: ?year=2024
// =============================================================================
router.get('/telecom-potential/indicators/:domainId', requireAuth, async (req, res) => {
  try {
    const { domainId } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const indicators = await getIndicators(domainId, year);

    return res.json({ success: true, data: indicators });
  } catch (e) {
    console.error('[Telecom Potential] indicators error:', e.message);
    return res.status(500).json({ error: 'Failed to get indicators' });
  }
});

// =============================================================================
// GET /v2/panel/api/telecom-potential/years
// Get available years for scoring
// =============================================================================
router.get('/telecom-potential/years', requireAuth, async (req, res) => {
  try {
    const years = await getAvailableYears();
    return res.json({ success: true, data: years });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get years' });
  }
});

// =============================================================================
// POST /v2/panel/api/telecom-potential/fetch
// Trigger fetching BPS indicators and caching them
// Body: { year?: number }
// =============================================================================
router.post('/telecom-potential/fetch', requireAuth, async (req, res) => {
  try {
    const { year } = req.body || {};
    res.json({ success: true, message: 'Fetching BPS indicators started...' });

    // Run in background (don't block response)
    fetchAndCacheIndicators(year)
      .then(result => console.log('[Telecom Potential] Fetch complete:', result))
      .catch(err => console.error('[Telecom Potential] Fetch error:', err.message));
  } catch (e) {
    return res.status(500).json({ error: 'Failed to start fetch' });
  }
});

// =============================================================================
// POST /v2/panel/api/telecom-potential/compute
// Compute scores from cached indicators
// Body: { year?: number }
// =============================================================================
router.post('/telecom-potential/compute', requireAuth, async (req, res) => {
  try {
    const { year } = req.body || {};
    const result = await computeScores(year);

    return res.json({
      success: true,
      data: {
        year: result.year,
        provinces: result.provinces,
        topTierA: result.scores.filter(s => s.tier === 'A').length,
        topTierB: result.scores.filter(s => s.tier === 'B').length,
        top5: result.scores.slice(0, 5).map(s => ({
          rank: s.rank,
          name: s.domain_name,
          score: s.total_score,
          tier: s.tier,
        })),
      },
    });
  } catch (e) {
    console.error('[Telecom Potential] compute error:', e.message);
    return res.status(500).json({ error: e.message || 'Failed to compute scores' });
  }
});

// =============================================================================
// POST /v2/panel/api/telecom-potential/sync
// Full pipeline: fetch indicators → compute scores
// Body: { year?: number }
// =============================================================================
router.post('/telecom-potential/sync', requireAuth, async (req, res) => {
  try {
    const { year } = req.body || {};
    const targetYear = year || new Date().getFullYear() - 1;

    // Validate BPS API key first before starting background job
    try {
      const { query: dbQuery } = await import('../db.js');
      const keyResult = await dbQuery(
        "SELECT api_key FROM bps_config WHERE config_name = 'default_bps_config' LIMIT 1"
      );
      const apiKey = keyResult.rows[0]?.api_key || process.env.BPS_API_KEY || '';
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'BPS API key not configured. Go to BPS Configuration page to set your API key first.',
        });
      }
    } catch (configErr) {
      // bps_config table may not exist, check env
      if (!process.env.BPS_API_KEY) {
        return res.status(400).json({
          success: false,
          error: 'BPS API key not configured. Set BPS_API_KEY in environment or configure via BPS Configuration page.',
        });
      }
    }

    res.json({
      success: true,
      message: `Syncing BPS data for ${targetYear}. This may take 2-5 minutes. Data will appear automatically when ready.`,
    });

    // Run full pipeline in background
    (async () => {
      try {
        console.log(`[Telecom Potential] Starting full sync for ${targetYear}...`);
        const fetchResult = await fetchAndCacheIndicators(targetYear);
        console.log('[Telecom Potential] Fetch done:', fetchResult);

        const scoreResult = await computeScores(targetYear);
        console.log(`[Telecom Potential] Scoring done: ${scoreResult.provinces} provinces scored`);
      } catch (err) {
        console.error('[Telecom Potential] Sync pipeline error:', err.message);
      }
    })();
  } catch (e) {
    return res.status(500).json({ error: 'Failed to start sync' });
  }
});

// =============================================================================
// GET /v2/panel/api/telecom-potential/definitions
// Get indicator definitions and weights
// =============================================================================
router.get('/telecom-potential/definitions', requireAuth, async (_req, res) => {
  const defs = Object.entries(INDICATOR_DEFINITIONS).map(([code, def]) => ({
    code,
    name: def.name,
    varId: def.varId,
    unit: def.unit,
    weight: def.weight,
    invert: def.invert,
    description: def.invert
      ? 'Higher existing value = LESS opportunity (gap analysis)'
      : 'Higher value = MORE favorable for ISP deployment',
  }));
  return res.json({ success: true, data: defs });
});

// =============================================================================
// V2 ENDPOINTS — License-based scoring with dual perspectives
// =============================================================================

// GET /v2/panel/api/telecom-potential/v2/area-stats
router.get('/telecom-potential/v2/area-stats', requireAuth, async (req, res) => {
  try {
    const areaLevel = req.query.area_level || 'province';
    const provinceId = req.query.province_id || null;
    const stats = await getAreaLicenseStats(areaLevel, provinceId);
    return res.json({ success: true, data: stats });
  } catch (e) {
    console.error('[Telecom V2] area-stats error:', e.message);
    return res.status(500).json({ error: 'Failed to get area stats' });
  }
});

// GET /v2/panel/api/telecom-potential/v2/scores
router.get('/telecom-potential/v2/scores', requireAuth, async (req, res) => {
  try {
    const areaLevel = req.query.area_level || 'province';
    const scores = await getV2Scores(areaLevel);
    return res.json({ success: true, data: scores, meta: { area_level: areaLevel, total: scores.length } });
  } catch (e) {
    console.error('[Telecom V2] scores error:', e.message);
    return res.status(500).json({ error: 'Failed to get scores' });
  }
});

// POST /v2/panel/api/telecom-potential/v2/compute
router.post('/telecom-potential/v2/compute', requireAuth, async (req, res) => {
  try {
    const result = await computeAreaScores();
    return res.json({ success: true, data: result });
  } catch (e) {
    console.error('[Telecom V2] compute error:', e.message);
    return res.status(500).json({ error: e.message || 'Failed to compute scores' });
  }
});

// GET /v2/panel/api/telecom-potential/v2/config
router.get('/telecom-potential/v2/config', requireAuth, async (_req, res) => {
  try {
    const config = await getV2Config();
    return res.json({ success: true, data: config });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get config' });
  }
});

// PUT /v2/panel/api/telecom-potential/v2/config
router.put('/telecom-potential/v2/config', requireAuth, async (req, res) => {
  try {
    const config = await saveV2Config(req.body);
    return res.json({ success: true, data: config });
  } catch (e) {
    console.error('[Telecom V2] config save error:', e.message);
    return res.status(500).json({ error: 'Failed to save config' });
  }
});

// GET /v2/panel/api/telecom-potential/v2/map-data
router.get('/telecom-potential/v2/map-data', requireAuth, async (req, res) => {
  try {
    const areaLevel = req.query.area_level || 'province';
    const serviceType = req.query.service_type || null;
    const geojson = await getMapGeoJSON(areaLevel, serviceType);
    return res.json({ success: true, data: geojson });
  } catch (e) {
    console.error('[Telecom V2] map-data error:', e.message);
    return res.status(500).json({ error: 'Failed to get map data' });
  }
});

// GET /v2/panel/api/telecom-potential/v2/area/:areaId/detail
router.get('/telecom-potential/v2/area/:areaId/detail', requireAuth, async (req, res) => {
  try {
    const detail = await getAreaDetail(req.params.areaId);
    if (!detail) return res.status(404).json({ error: 'Area not found' });
    return res.json({ success: true, data: detail });
  } catch (e) {
    console.error('[Telecom V2] area detail error:', e.message);
    return res.status(500).json({ error: 'Failed to get area detail' });
  }
});

// GET /v2/panel/api/telecom-potential/v2/service-types
router.get('/telecom-potential/v2/service-types', requireAuth, async (_req, res) => {
  return res.json({ success: true, data: SERVICE_TYPES });
});

export default router;
