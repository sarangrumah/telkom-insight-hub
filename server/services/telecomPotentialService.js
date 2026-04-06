import axios from 'axios';
import { query } from '../db.js';

// =============================================================================
// Telecom Potential Service
// Fetches BPS indicators, caches them, and computes ISP potential scores.
// =============================================================================

const BPS_BASE = 'https://webapi.bps.go.id/v1/api';

// Auto-initialize tables
let tablesReady = false;
async function ensureTables() {
  if (tablesReady) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.telecom_potential_indicators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_id VARCHAR(20) NOT NULL,
        domain_name VARCHAR(255),
        domain_type VARCHAR(20) DEFAULT 'prov',
        indicator_code VARCHAR(50) NOT NULL,
        indicator_name VARCHAR(255),
        value DOUBLE PRECISION,
        unit VARCHAR(50),
        year INT NOT NULL,
        source_var_id VARCHAR(20),
        source_table_id VARCHAR(20),
        fetched_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(domain_id, indicator_code, year)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS public.telecom_potential_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_id VARCHAR(20) NOT NULL,
        domain_name VARCHAR(255),
        domain_type VARCHAR(20) DEFAULT 'prov',
        year INT NOT NULL,
        population_density_score DOUBLE PRECISION DEFAULT 0,
        internet_gap_score DOUBLE PRECISION DEFAULT 0,
        electrification_score DOUBLE PRECISION DEFAULT 0,
        income_score DOUBLE PRECISION DEFAULT 0,
        ipm_score DOUBLE PRECISION DEFAULT 0,
        urbanization_score DOUBLE PRECISION DEFAULT 0,
        education_score DOUBLE PRECISION DEFAULT 0,
        mobile_penetration_score DOUBLE PRECISION DEFAULT 0,
        total_score DOUBLE PRECISION DEFAULT 0,
        rank INT,
        tier VARCHAR(1),
        computed_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(domain_id, year)
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_tp_indicators_domain ON public.telecom_potential_indicators (domain_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_tp_indicators_code_year ON public.telecom_potential_indicators (indicator_code, year)');
    await query('CREATE INDEX IF NOT EXISTS idx_tp_scores_year ON public.telecom_potential_scores (year, total_score DESC)');
    tablesReady = true;
    console.log('[Telecom Potential] Tables ready');
  } catch (e) {
    console.error('[Telecom Potential] Table init error:', e.message);
  }
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 TelkomInsightHub/1.0';

// Indicator definitions with BPS variable IDs and scoring weights
const INDICATORS = {
  internet_penetration: {
    varId: '398', name: 'Rumah Tangga Akses Internet (%)', unit: '%', weight: 0.20, invert: true,
  },
  mobile_penetration: {
    varId: '391', name: 'Rumah Tangga Memiliki HP (%)', unit: '%', weight: 0.05, invert: false,
  },
  population_density: {
    varId: '141', name: 'Kepadatan Penduduk', unit: 'jiwa/km²', weight: 0.15, invert: false,
  },
  electrification: {
    varId: '87', name: 'Rumah Tangga Listrik PLN (%)', unit: '%', weight: 0.10, invert: false,
  },
  ipm: {
    varId: '413', name: 'Indeks Pembangunan Manusia', unit: 'index', weight: 0.10, invert: false,
  },
  education: {
    varId: '415', name: 'Rata-rata Lama Sekolah', unit: 'tahun', weight: 0.10, invert: false,
  },
  computer_ownership: {
    varId: '396', name: 'Rumah Tangga Memiliki Komputer (%)', unit: '%', weight: 0.10, invert: false,
  },
  individual_mobile: {
    varId: '395', name: 'Penduduk Memiliki HP (%)', unit: '%', weight: 0.05, invert: false,
  },
  household_count: {
    varId: '153', name: 'Jumlah Rumah Tangga', unit: 'ribu RT', weight: 0.10, invert: false,
  },
  internet_individual: {
    varId: '70', name: 'Penduduk Akses Internet (%)', unit: '%', weight: 0.05, invert: true,
  },
};

async function getApiKey() {
  const res = await query(
    "SELECT api_key FROM bps_config WHERE config_name = 'default_bps_config' LIMIT 1"
  );
  return res.rows[0]?.api_key || process.env.BPS_API_KEY || '';
}

async function bpsFetch(path, apiKey) {
  const url = `${BPS_BASE}/${path}/key/${apiKey}`;
  try {
    const resp = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    return resp.data;
  } catch (e) {
    console.error(`[BPS Fetch] ${path} failed:`, e.message);
    return null;
  }
}

// Get all provinces
export async function fetchProvinces(apiKey) {
  const data = await bpsFetch('domain/type/prov/lang/ind', apiKey);
  if (!data?.data?.[1]) return [];
  return data.data[1].map(d => ({ id: d.domain_id, name: d.domain_name }));
}

/**
 * Fetch a BPS dynamic variable for all provinces.
 * BPS datacontent format: keys are composite "{vervar}{varId}{tahun}{turvar}"
 * - vervar = province code (e.g., 1100 for Aceh, 3100 for DKI Jakarta)
 * - tahun = year code (e.g., 124 for 2024, 123 for 2023)
 * - turvar = classification (e.g., 191 for Perkotaan+Perdesaan combined)
 */
async function fetchVariableAllProvinces(varId, apiKey, targetYear) {
  // Step 1: Get available years (th) for this variable
  const thData = await bpsFetch(`list/model/th/domain/0000/var/${varId}`, apiKey);
  let thCode = null;
  let actualYear = targetYear;

  if (thData?.data?.[1]?.length > 0) {
    const exact = thData.data[1].find(t => String(t.th) === String(targetYear));
    if (exact) { thCode = String(exact.th_id); actualYear = parseInt(exact.th); }
    else {
      const sorted = [...thData.data[1]].sort((a, b) => parseInt(b.th) - parseInt(a.th));
      thCode = String(sorted[0].th_id); actualYear = parseInt(sorted[0].th);
    }
  }
  if (!thCode) { console.log(`[Telecom] var-${varId}: no year data`); return []; }

  // Step 2: Fetch with explicit th
  const data = await bpsFetch(`list/model/data/domain/0000/var/${varId}/th/${thCode}`, apiKey);

  if (!data || data.status !== 'OK' || data['data-availability'] !== 'available') {
    console.log(`[Telecom] var-${varId}: no data for th=${thCode}`);
    return [];
  }

  // Build province lookup
  const provMap = {};
  if (data.vervar) {
    for (const v of data.vervar) provMap[String(v.val)] = v.label;
  }

  // Find preferred turvar (combined or first)
  let turvarCode = '0';
  if (data.turvar?.length > 0) {
    const combined = data.turvar.find(t =>
      t.label?.includes('Perkotaan+Perdesaan') || t.label?.includes('Total')
    );
    if (combined) turvarCode = String(combined.val);
    else turvarCode = String(data.turvar[0].val);
  }

  // Parse datacontent — key format: {provCode}{varId}{turvarCode}{thCode}0
  const suffix = turvarCode + thCode + '0';
  const varIdStr = String(varId);
  const results = [];

  for (const [key, value] of Object.entries(data.datacontent || {})) {
    if (!key.endsWith(suffix)) continue;
    const beforeSuffix = key.slice(0, -suffix.length);
    if (!beforeSuffix.endsWith(varIdStr)) continue;
    const provCode = beforeSuffix.slice(0, -varIdStr.length);
    const provName = provMap[provCode];
    if (!provName || provCode === '9999') continue;
    const val = parseFloat(value);
    if (isNaN(val)) continue;
    results.push({ domainId: provCode, domainName: provName, value: val, year: actualYear });
  }

  console.log(`[Telecom] var-${varId}: ${results.length} provinces for year ${actualYear}`);
  return results;
}

// Fetch and cache all indicators
export async function fetchAndCacheIndicators(targetYear) {
  await ensureTables();
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('BPS API key not configured. Go to BPS Configuration to set your API key.');

  const year = targetYear || new Date().getFullYear() - 1;
  let totalCached = 0;

  for (const [code, indicator] of Object.entries(INDICATORS)) {
    console.log(`[Telecom] Fetching ${code} (var-${indicator.varId})...`);

    try {
      const results = await fetchVariableAllProvinces(indicator.varId, apiKey, year);

      for (const row of results) {
        await query(`
          INSERT INTO public.telecom_potential_indicators
            (domain_id, domain_name, domain_type, indicator_code, indicator_name, value, unit, year, source_var_id, fetched_at)
          VALUES ($1, $2, 'prov', $3, $4, $5, $6, $7, $8, now())
          ON CONFLICT (domain_id, indicator_code, year) DO UPDATE SET
            value = EXCLUDED.value,
            domain_name = EXCLUDED.domain_name,
            fetched_at = now()
        `, [
          row.domainId, row.domainName, code, indicator.name,
          row.value, indicator.unit, row.year, indicator.varId,
        ]);
        totalCached++;
      }
    } catch (err) {
      console.error(`[Telecom] Error fetching ${code}:`, err.message);
    }

    // Rate limit between indicators
    await new Promise(r => setTimeout(r, 1000));
  }

  return { year, indicators: Object.keys(INDICATORS).length, totalCached };
}

// Normalize a value to 0-100 scale using min-max within the dataset
function normalize(value, min, max) {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// Compute scores for all provinces
export async function computeScores(targetYear) {
  await ensureTables();
  const year = targetYear || new Date().getFullYear() - 1;

  // Get all indicators for this year
  const { rows: allIndicators } = await query(
    "SELECT * FROM public.telecom_potential_indicators WHERE year = $1 AND domain_id != '0000'",
    [year]
  );

  if (allIndicators.length === 0) {
    throw new Error(`No indicators cached for year ${year}. Run fetch first.`);
  }

  // Group by domain
  const byDomain = {};
  for (const row of allIndicators) {
    if (!byDomain[row.domain_id]) {
      byDomain[row.domain_id] = { name: row.domain_name, indicators: {} };
    }
    byDomain[row.domain_id].indicators[row.indicator_code] = row.value;
  }

  // Compute min/max for each indicator (for normalization)
  const ranges = {};
  for (const code of Object.keys(INDICATORS)) {
    const values = Object.values(byDomain)
      .map(d => d.indicators[code])
      .filter(v => v !== undefined && v !== null);
    ranges[code] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  // Score each domain
  const scores = [];
  for (const [domainId, domain] of Object.entries(byDomain)) {
    const score = {
      domain_id: domainId,
      domain_name: domain.name,
      year,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const [code, indicator] of Object.entries(INDICATORS)) {
      const raw = domain.indicators[code];
      if (raw === undefined || raw === null) continue;

      let normalized = normalize(raw, ranges[code].min, ranges[code].max);

      // For "invert" indicators (e.g., internet penetration), high value = LESS opportunity
      // We want high score = MORE opportunity (gap)
      if (indicator.invert) {
        normalized = 100 - normalized;
      }

      const fieldMap = {
        internet_penetration: 'internet_gap_score',
        internet_individual: 'internet_gap_score', // contributes to same
        mobile_penetration: 'mobile_penetration_score',
        individual_mobile: 'mobile_penetration_score',
        population_density: 'population_density_score',
        electrification: 'electrification_score',
        ipm: 'ipm_score',
        education: 'education_score',
        computer_ownership: 'income_score', // proxy for disposable income
        household_count: 'urbanization_score', // proxy for market size
      };

      const field = fieldMap[code];
      if (field) {
        score[field] = Math.round(normalized * 10) / 10;
      }

      totalWeightedScore += normalized * indicator.weight;
      totalWeight += indicator.weight;
    }

    score.total_score = totalWeight > 0
      ? Math.round((totalWeightedScore / totalWeight) * 100 * 10) / 10 // normalize to weight sum
      : 0;

    // Fix: the weighted score is already 0-100 since normalized is 0-100
    score.total_score = Math.round(totalWeightedScore * 10) / 10;

    scores.push(score);
  }

  // Sort and rank
  scores.sort((a, b) => b.total_score - a.total_score);
  scores.forEach((s, i) => {
    s.rank = i + 1;
    if (s.total_score >= 70) s.tier = 'A';
    else if (s.total_score >= 50) s.tier = 'B';
    else if (s.total_score >= 30) s.tier = 'C';
    else s.tier = 'D';
  });

  // Upsert scores
  for (const s of scores) {
    await query(`
      INSERT INTO public.telecom_potential_scores
        (domain_id, domain_name, domain_type, year,
         population_density_score, internet_gap_score, electrification_score,
         income_score, ipm_score, urbanization_score, education_score,
         mobile_penetration_score, total_score, rank, tier, computed_at)
      VALUES ($1, $2, 'prov', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())
      ON CONFLICT (domain_id, year) DO UPDATE SET
        domain_name = EXCLUDED.domain_name,
        population_density_score = EXCLUDED.population_density_score,
        internet_gap_score = EXCLUDED.internet_gap_score,
        electrification_score = EXCLUDED.electrification_score,
        income_score = EXCLUDED.income_score,
        ipm_score = EXCLUDED.ipm_score,
        urbanization_score = EXCLUDED.urbanization_score,
        education_score = EXCLUDED.education_score,
        mobile_penetration_score = EXCLUDED.mobile_penetration_score,
        total_score = EXCLUDED.total_score,
        rank = EXCLUDED.rank,
        tier = EXCLUDED.tier,
        computed_at = now()
    `, [
      s.domain_id, s.domain_name, s.year,
      s.population_density_score || 0, s.internet_gap_score || 0,
      s.electrification_score || 0, s.income_score || 0,
      s.ipm_score || 0, s.urbanization_score || 0,
      s.education_score || 0, s.mobile_penetration_score || 0,
      s.total_score, s.rank, s.tier,
    ]);
  }

  return { year, provinces: scores.length, scores };
}

// Get cached scores
export async function getScores(year) {
  await ensureTables();
  const targetYear = year || new Date().getFullYear() - 1;
  const { rows } = await query(
    'SELECT * FROM public.telecom_potential_scores WHERE year = $1 ORDER BY rank ASC',
    [targetYear]
  );
  return rows;
}

// Get raw indicators for a specific domain
export async function getIndicators(domainId, year) {
  await ensureTables();
  const targetYear = year || new Date().getFullYear() - 1;
  const { rows } = await query(
    'SELECT * FROM public.telecom_potential_indicators WHERE domain_id = $1 AND year = $2 ORDER BY indicator_code',
    [domainId, targetYear]
  );
  return rows;
}

// Get available years
export async function getAvailableYears() {
  await ensureTables();
  const { rows } = await query(
    'SELECT DISTINCT year FROM public.telecom_potential_scores ORDER BY year DESC'
  );
  return rows.map(r => r.year);
}

export const INDICATOR_DEFINITIONS = INDICATORS;
