// =============================================================================
// e-Telekomunikasi Internal API Client
// Calls e-telekomunikasi service from Panel backend via Docker network.
// Auth: PANEL_SERVICE_API_KEY (Bearer token)
// =============================================================================

const ETELEKOM_API_URL = process.env.ETELEKOM_API_URL || 'http://web:3000';
const ETELEKOM_SERVICE_KEY = process.env.ETELEKOM_SERVICE_KEY || '';

/**
 * Generic fetch helper with timeout and error handling.
 */
async function fetchEtelekom(path, options = {}) {
    const url = `${ETELEKOM_API_URL}${path}`;

    const headers = {
        Authorization: `Bearer ${ETELEKOM_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        const data = await response.json();

        return {
            ok: response.ok,
            status: response.status,
            data,
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return { ok: false, status: 504, data: { message: 'e-Telekomunikasi request timeout' } };
        }
        return { ok: false, status: 502, data: { message: `e-Telekomunikasi unreachable: ${error.message}` } };
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Verify e-telekomunikasi user credentials.
 * Returns user data including pelakuUsaha and penanggungJawab if valid.
 */
export async function verifyCredentials(email, password) {
    return fetchEtelekom('/api/v1/panel/verify-credentials', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

/**
 * Get pelaku usaha (company) details by userId.
 */
export async function getPelakuUsaha(userId) {
    return fetchEtelekom(`/api/v1/panel/pelaku-usaha/${userId}`);
}

/**
 * Get PIC (penanggung jawab) details by userId.
 * @param {boolean} decrypt - If true, returns decrypted PII.
 */
export async function getPenanggungJawab(userId, decrypt = false) {
    const query = decrypt ? '?decrypt=true' : '';
    return fetchEtelekom(`/api/v1/panel/pelaku-usaha/${userId}/pic${query}`);
}

/**
 * Search pelaku usaha by NIB or name.
 */
export async function searchPelakuUsaha({ nib, nama, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (nib) params.set('nib', nib);
    if (nama) params.set('nama', nama);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return fetchEtelekom(`/api/v1/panel/pelaku-usaha?${params}`);
}

/**
 * Get aggregated statistics from e-telekomunikasi.
 */
export async function getStatistics() {
    return fetchEtelekom('/api/v1/panel/statistics');
}

/**
 * Get SLA metrics from e-telekomunikasi.
 */
export async function getSlaMetrics() {
    return fetchEtelekom('/api/v1/panel/sla-metrics');
}

/**
 * Health check for e-telekomunikasi connectivity.
 */
export async function healthCheck() {
    try {
        const result = await fetchEtelekom('/api/health');
        return result.ok;
    } catch {
        return false;
    }
}
