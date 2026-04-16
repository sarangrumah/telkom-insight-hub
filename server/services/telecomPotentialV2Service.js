import { query } from '../db.js';

// =============================================================================
// Telecom Potential V2 Service
// License-based scoring with dual perspectives + optional BPS blend
// =============================================================================

const SERVICE_TYPES = ['Jasa', 'Jaringan', 'Telsus', 'ISR', 'SKLO', 'LKO', 'Penomoran', 'Tarif'];

const DEFAULT_CONFIG = {
  config_name: 'default',
  service_weights: {
    Jasa: 0.20, Jaringan: 0.25, Telsus: 0.10,
    ISR: 0.15, SKLO: 0.05, LKO: 0.05, Penomoran: 0.10, Tarif: 0.10,
  },
  market_activity_weight: 0.4,
  untapped_opportunity_weight: 0.4,
  bps_demand_weight: 0.2,
  include_bps_data: true,
  area_level: 'province',
};

// Auto-init tables
let tablesReady = false;
async function ensureTables() {
  if (tablesReady) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.telecom_potential_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_name VARCHAR(100) UNIQUE NOT NULL DEFAULT 'default',
        service_weights JSONB NOT NULL DEFAULT '{}',
        market_activity_weight DOUBLE PRECISION DEFAULT 0.4,
        untapped_opportunity_weight DOUBLE PRECISION DEFAULT 0.4,
        bps_demand_weight DOUBLE PRECISION DEFAULT 0.2,
        include_bps_data BOOLEAN DEFAULT true,
        area_level VARCHAR(20) DEFAULT 'province',
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS public.telecom_potential_area_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        area_type VARCHAR(20) NOT NULL,
        area_id UUID NOT NULL,
        area_name VARCHAR(255),
        area_code VARCHAR(20),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        market_activity_score DOUBLE PRECISION DEFAULT 0,
        untapped_opportunity_score DOUBLE PRECISION DEFAULT 0,
        bps_demand_score DOUBLE PRECISION DEFAULT 0,
        total_score DOUBLE PRECISION DEFAULT 0,
        license_count INT DEFAULT 0,
        company_count INT DEFAULT 0,
        service_count INT DEFAULT 0,
        service_breakdown JSONB DEFAULT '{}',
        rank INT,
        tier VARCHAR(1),
        computed_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(area_type, area_id)
      )
    `);
    // Seed default config if not exists
    await query(`
      INSERT INTO public.telecom_potential_config (config_name, service_weights, market_activity_weight, untapped_opportunity_weight, bps_demand_weight, include_bps_data, area_level)
      VALUES ('default', $1, 0.4, 0.4, 0.2, true, 'province')
      ON CONFLICT (config_name) DO NOTHING
    `, [JSON.stringify(DEFAULT_CONFIG.service_weights)]);
    tablesReady = true;
    console.log('[Telecom V2] Tables ready');
  } catch (e) {
    console.error('[Telecom V2] Table init error:', e.message);
  }
}

function normalize(value, min, max) {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// Get scoring config
export async function getConfig() {
  await ensureTables();
  const { rows } = await query("SELECT * FROM public.telecom_potential_config WHERE config_name = 'default' LIMIT 1");
  return rows[0] || DEFAULT_CONFIG;
}

// Save scoring config
export async function saveConfig(config) {
  await ensureTables();
  const { rows } = await query(`
    INSERT INTO public.telecom_potential_config (config_name, service_weights, market_activity_weight, untapped_opportunity_weight, bps_demand_weight, include_bps_data, area_level, updated_at)
    VALUES ('default', $1, $2, $3, $4, $5, $6, now())
    ON CONFLICT (config_name) DO UPDATE SET
      service_weights = EXCLUDED.service_weights,
      market_activity_weight = EXCLUDED.market_activity_weight,
      untapped_opportunity_weight = EXCLUDED.untapped_opportunity_weight,
      bps_demand_weight = EXCLUDED.bps_demand_weight,
      include_bps_data = EXCLUDED.include_bps_data,
      area_level = EXCLUDED.area_level,
      updated_at = now()
    RETURNING *
  `, [
    JSON.stringify(config.service_weights || DEFAULT_CONFIG.service_weights),
    config.market_activity_weight ?? 0.4,
    config.untapped_opportunity_weight ?? 0.4,
    config.bps_demand_weight ?? 0.2,
    config.include_bps_data ?? true,
    config.area_level || 'province',
  ]);
  return rows[0];
}

// Get raw license stats per area per service type
// Data comes from license_applications → sub_services → services, linked via kabupaten → provinces
export async function getAreaLicenseStats(areaLevel = 'province', provinceId = null) {
  await ensureTables();

  // Base query: license_applications joined to sub_services → services for service_type,
  // and kabupaten → provinces for geography
  const baseSelect = `
    SELECT {area_cols},
      s.code as service_type,
      COUNT(la.id)::int as license_count,
      COUNT(DISTINCT c.id)::int as company_count,
      COUNT(la.id) FILTER (WHERE la.status NOT IN ('rejected', 'draft'))::int as active_count
    FROM public.license_applications la
    JOIN public.sub_services ss ON la.license_service_id = ss.id
    JOIN public.services s ON ss.service_id = s.id
    JOIN public.kabupaten k ON la.kabupaten_id = k.id
    JOIN public.provinces p ON k.province_id = p.id
    LEFT JOIN public.companies c ON la.company_id = c.id
  `;

  if (areaLevel === 'kabupaten' && provinceId) {
    const sql = baseSelect.replace('{area_cols}',
      'k.id, k.name, k.code, k.latitude, k.longitude, k.type as area_subtype'
    ) + ` WHERE k.province_id = $1
      GROUP BY k.id, k.name, k.code, k.latitude, k.longitude, k.type, s.code
      ORDER BY k.name, s.code`;
    const { rows } = await query(sql, [provinceId]);
    return rows;
  }

  if (areaLevel === 'kabupaten') {
    const sql = baseSelect.replace('{area_cols}',
      'k.id, k.name, k.code, k.latitude, k.longitude, k.type as area_subtype'
    ) + ` GROUP BY k.id, k.name, k.code, k.latitude, k.longitude, k.type, s.code
      ORDER BY k.name, s.code`;
    const { rows } = await query(sql);
    return rows;
  }

  // Province level (default)
  const sql = baseSelect.replace('{area_cols}',
    'p.id, p.name, p.code, p.latitude, p.longitude'
  ) + ` GROUP BY p.id, p.name, p.code, p.latitude, p.longitude, s.code
    ORDER BY p.name, s.code`;
  const { rows } = await query(sql);
  return rows;
}

// Compute scores for all areas
export async function computeAreaScores() {
  await ensureTables();
  const config = await getConfig();
  const areaLevel = config.area_level || 'province';
  const serviceWeights = config.service_weights || DEFAULT_CONFIG.service_weights;

  // Get raw stats
  const stats = await getAreaLicenseStats(areaLevel);

  if (stats.length === 0) {
    return { areas: 0, message: 'No licensing data found. Ensure license_applications have kabupaten_id linked.' };
  }

  // Aggregate by area
  const areaMap = {};
  for (const row of stats) {
    const key = row.id;
    if (!areaMap[key]) {
      areaMap[key] = {
        area_id: row.id,
        area_name: row.name,
        area_code: row.code,
        latitude: row.latitude,
        longitude: row.longitude,
        services: {},
        total_licenses: 0,
        total_companies: new Set(),
        total_active: 0,
      };
    }
    const svc = row.service_type || 'other';
    areaMap[key].services[svc] = {
      count: row.license_count,
      companies: row.company_count,
      active: row.active_count,
    };
    areaMap[key].total_licenses += row.license_count;
    // Note: company_count per service may overlap across services,
    // but for scoring purposes this approximation is acceptable
    areaMap[key].total_companies.add(row.company_count); // placeholder
    areaMap[key].total_active += row.active_count;
  }

  // Get unique company counts per area (more accurate query using license_applications)
  let companyCounts = {};
  try {
    const companyQuery = areaLevel === 'province'
      ? `SELECT p.id as area_id, COUNT(DISTINCT la.company_id)::int as unique_companies
         FROM public.license_applications la
         JOIN public.kabupaten k ON la.kabupaten_id = k.id
         JOIN public.provinces p ON k.province_id = p.id
         WHERE la.kabupaten_id IS NOT NULL
         GROUP BY p.id`
      : `SELECT la.kabupaten_id as area_id, COUNT(DISTINCT la.company_id)::int as unique_companies
         FROM public.license_applications la
         WHERE la.kabupaten_id IS NOT NULL
         GROUP BY la.kabupaten_id`;
    const { rows: compRows } = await query(companyQuery);
    for (const r of compRows) companyCounts[r.area_id] = r.unique_companies;
  } catch { /* ignore */ }

  const areas = Object.values(areaMap);

  // Compute raw metrics for normalization
  const metrics = areas.map(a => {
    const serviceCount = Object.keys(a.services).length;
    const companyCount = companyCounts[a.area_id] || Object.keys(a.services).reduce((sum, s) => sum + (a.services[s]?.companies || 0), 0);

    // Weighted license score (service weights applied)
    let weightedLicenses = 0;
    for (const [svc, data] of Object.entries(a.services)) {
      const weight = serviceWeights[svc] || 0.1;
      weightedLicenses += (data.count || 0) * weight;
    }

    return {
      ...a,
      company_count: companyCount,
      service_count: serviceCount,
      weighted_licenses: weightedLicenses,
      active_ratio: a.total_licenses > 0 ? a.total_active / a.total_licenses : 0,
    };
  });

  // Compute ranges for normalization
  const ranges = {
    weighted_licenses: { min: Math.min(...metrics.map(m => m.weighted_licenses)), max: Math.max(...metrics.map(m => m.weighted_licenses)) },
    company_count: { min: Math.min(...metrics.map(m => m.company_count)), max: Math.max(...metrics.map(m => m.company_count)) },
    service_count: { min: Math.min(...metrics.map(m => m.service_count)), max: Math.max(...metrics.map(m => m.service_count)) },
    active_ratio: { min: Math.min(...metrics.map(m => m.active_ratio)), max: Math.max(...metrics.map(m => m.active_ratio)) },
    total_licenses: { min: Math.min(...metrics.map(m => m.total_licenses)), max: Math.max(...metrics.map(m => m.total_licenses)) },
  };

  // Score each area
  const scores = metrics.map(m => {
    // Market Activity Score (high = thriving market)
    const marketActivity = (
      normalize(m.weighted_licenses, ranges.weighted_licenses.min, ranges.weighted_licenses.max) * 0.40 +
      normalize(m.company_count, ranges.company_count.min, ranges.company_count.max) * 0.25 +
      normalize(m.service_count, ranges.service_count.min, ranges.service_count.max) * 0.20 +
      normalize(m.active_ratio, ranges.active_ratio.min, ranges.active_ratio.max) * 0.15
    );

    // Untapped Opportunity Score (inverted — low licenses = more opportunity)
    const untappedOpportunity = (
      (100 - normalize(m.total_licenses, ranges.total_licenses.min, ranges.total_licenses.max)) * 0.50 +
      (100 - normalize(m.service_count, ranges.service_count.min, ranges.service_count.max)) * 0.30 +
      (100 - normalize(m.company_count, ranges.company_count.min, ranges.company_count.max)) * 0.20
    );

    // BPS demand score — fetch from existing telecom_potential_scores if available
    let bpsDemandScore = 50; // neutral default

    // Total weighted score
    const mw = config.market_activity_weight || 0.4;
    const uw = config.untapped_opportunity_weight || 0.4;
    const bw = config.include_bps_data ? (config.bps_demand_weight || 0.2) : 0;
    const totalWeight = mw + uw + bw;

    const totalScore = totalWeight > 0
      ? (mw * marketActivity + uw * untappedOpportunity + bw * bpsDemandScore) / totalWeight
      : 50;

    // Service breakdown
    const serviceBreakdown = {};
    for (const [svc, data] of Object.entries(m.services)) {
      serviceBreakdown[svc] = { count: data.count, companies: data.companies, active: data.active };
    }

    return {
      area_type: areaLevel,
      area_id: m.area_id,
      area_name: m.area_name,
      area_code: m.area_code,
      latitude: m.latitude,
      longitude: m.longitude,
      market_activity_score: Math.round(marketActivity * 10) / 10,
      untapped_opportunity_score: Math.round(untappedOpportunity * 10) / 10,
      bps_demand_score: Math.round(bpsDemandScore * 10) / 10,
      total_score: Math.round(totalScore * 10) / 10,
      license_count: m.total_licenses,
      company_count: m.company_count,
      service_count: m.service_count,
      service_breakdown: serviceBreakdown,
    };
  });

  // If BPS data is enabled, try to blend existing BPS scores
  if (config.include_bps_data) {
    try {
      const { rows: bpsScores } = await query(`SELECT domain_id, total_score FROM public.telecom_potential_scores ORDER BY year DESC`);
      if (bpsScores.length > 0) {
        const bpsMap = {};
        for (const b of bpsScores) bpsMap[b.domain_id] = Number(b.total_score) || 50;

        for (const s of scores) {
          // Try to match area_code to BPS domain_id
          if (bpsMap[s.area_code]) {
            s.bps_demand_score = Math.round(bpsMap[s.area_code] * 10) / 10;
            // Recompute total with real BPS score
            const mw = config.market_activity_weight || 0.4;
            const uw = config.untapped_opportunity_weight || 0.4;
            const bw = config.bps_demand_weight || 0.2;
            const tw = mw + uw + bw;
            s.total_score = Math.round((mw * s.market_activity_score + uw * s.untapped_opportunity_score + bw * s.bps_demand_score) / tw * 10) / 10;
          }
        }
      }
    } catch { /* BPS tables may not exist */ }
  }

  // Rank and tier
  scores.sort((a, b) => b.total_score - a.total_score);
  scores.forEach((s, i) => {
    s.rank = i + 1;
    if (s.total_score >= 75) s.tier = 'A';
    else if (s.total_score >= 50) s.tier = 'B';
    else if (s.total_score >= 25) s.tier = 'C';
    else s.tier = 'D';
  });

  // Upsert scores
  for (const s of scores) {
    await query(`
      INSERT INTO public.telecom_potential_area_scores
        (area_type, area_id, area_name, area_code, latitude, longitude,
         market_activity_score, untapped_opportunity_score, bps_demand_score,
         total_score, license_count, company_count, service_count,
         service_breakdown, rank, tier, computed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now())
      ON CONFLICT (area_type, area_id) DO UPDATE SET
        area_name = EXCLUDED.area_name,
        area_code = EXCLUDED.area_code,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        market_activity_score = EXCLUDED.market_activity_score,
        untapped_opportunity_score = EXCLUDED.untapped_opportunity_score,
        bps_demand_score = EXCLUDED.bps_demand_score,
        total_score = EXCLUDED.total_score,
        license_count = EXCLUDED.license_count,
        company_count = EXCLUDED.company_count,
        service_count = EXCLUDED.service_count,
        service_breakdown = EXCLUDED.service_breakdown,
        rank = EXCLUDED.rank,
        tier = EXCLUDED.tier,
        computed_at = now()
    `, [
      s.area_type, s.area_id, s.area_name, s.area_code,
      s.latitude, s.longitude,
      s.market_activity_score, s.untapped_opportunity_score, s.bps_demand_score,
      s.total_score, s.license_count, s.company_count, s.service_count,
      JSON.stringify(s.service_breakdown), s.rank, s.tier,
    ]);
  }

  return { areas: scores.length, areaLevel, scores };
}

// Get computed scores
export async function getScores(areaLevel = 'province') {
  await ensureTables();
  const { rows } = await query(
    'SELECT * FROM public.telecom_potential_area_scores WHERE area_type = $1 ORDER BY rank ASC',
    [areaLevel]
  );
  // Parse numeric fields
  return rows.map(r => ({
    ...r,
    market_activity_score: Number(r.market_activity_score) || 0,
    untapped_opportunity_score: Number(r.untapped_opportunity_score) || 0,
    bps_demand_score: Number(r.bps_demand_score) || 0,
    total_score: Number(r.total_score) || 0,
    license_count: Number(r.license_count) || 0,
    company_count: Number(r.company_count) || 0,
    service_count: Number(r.service_count) || 0,
    rank: Number(r.rank) || 0,
  }));
}

// Get GeoJSON for Mapbox
export async function getMapGeoJSON(areaLevel = 'province', serviceType = null) {
  await ensureTables();
  const scores = await getScores(areaLevel);

  const features = scores
    .filter(s => s.latitude && s.longitude)
    .map(s => {
      const properties = {
        id: s.area_id,
        name: s.area_name,
        code: s.area_code,
        total_score: s.total_score,
        market_activity_score: s.market_activity_score,
        untapped_opportunity_score: s.untapped_opportunity_score,
        license_count: s.license_count,
        company_count: s.company_count,
        service_count: s.service_count,
        rank: s.rank,
        tier: s.tier,
        service_breakdown: s.service_breakdown,
      };

      // If filtering by service type, override license_count with the filtered count
      if (serviceType && s.service_breakdown) {
        const bd = typeof s.service_breakdown === 'string' ? JSON.parse(s.service_breakdown) : s.service_breakdown;
        const svcData = bd[serviceType];
        properties.filtered_count = svcData?.count || 0;
        properties.license_count = svcData?.count || 0;
        properties.company_count = svcData?.companies || 0;
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(s.longitude), Number(s.latitude)],
        },
        properties,
      };
    })
    // When filtering by service, hide areas with 0 licenses for that service
    .filter(f => !serviceType || f.properties.license_count > 0);

  return {
    type: 'FeatureCollection',
    features,
  };
}

// Get detail for a single area
export async function getAreaDetail(areaId) {
  await ensureTables();
  const { rows } = await query(
    'SELECT * FROM public.telecom_potential_area_scores WHERE area_id = $1 LIMIT 1',
    [areaId]
  );
  if (rows.length === 0) return null;

  const score = rows[0];
  score.market_activity_score = Number(score.market_activity_score) || 0;
  score.untapped_opportunity_score = Number(score.untapped_opportunity_score) || 0;
  score.bps_demand_score = Number(score.bps_demand_score) || 0;
  score.total_score = Number(score.total_score) || 0;
  score.license_count = Number(score.license_count) || 0;
  score.company_count = Number(score.company_count) || 0;
  score.service_count = Number(score.service_count) || 0;
  score.rank = Number(score.rank) || 0;

  return score;
}

export { SERVICE_TYPES, DEFAULT_CONFIG };
