import express from 'express';
const router = express.Router();
import { query } from '../db.js';

// Common function to format status
function formatStatus(dbStatus) {
  if (!dbStatus) return 'Disetujui';
  
  // Convert database status to frontend status
  const statusMap = {
    'active': 'Disetujui',
    'inactive': 'Ditolak',
    'suspended': 'Suspended',
    'submitted': 'Permohonan Baru',
    'in_review': 'Diproses',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'completed': 'Disetujui',
    'under_review': 'Diproses',
    'need_correction': 'Diproses',
    'draft': 'Draft',
    'pending_verification': 'Permohonan Baru',
    'needs_correction': 'Perlu Koreksi',
    'pending_correction': 'Perlu Koreksi',
    'corrected': 'Diproses'
  };
  
  return statusMap[dbStatus] || 'Disetujui';
}

// Common function to format service type
function formatServiceType(type) {
  const typeMap = {
    'jasa': 'Jasa',
    'jaringan': 'Jaringan',
    'telekomunikasi_khusus': 'Telekomunikasi Khusus',
    'isr': 'ISR',
    'tarif': 'Penomoran',
    'sklo': 'SKLO',
    'lko': 'LKO'
  };
  
  return typeMap[type] || type;
}

// Get Telsus (Telekomunikasi Khusus) data with pagination and filtering
router.get('/telsus', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'telekomunikasi_khusus'` : 'WHERE td.service_type = \'telekomunikasi_khusus\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '',
      nib: row.license_number || '',
      layanan: row.sub_service_name || row.sub_service_type || '',
      nomorIzin: row.license_number || '',
      tanggalPengajuan: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalSubmit: row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalBerlaku: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      kbli: row.sub_service_name || 'Jasa Telekomunikasi',
      status: formatStatus(row.status)
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
  } catch (e) {
    console.error('Failed to fetch Telsus data', e);
    res.status(500).json({ error: 'Failed to fetch Telsus data' });
  }
});

// Get Jaringan data with pagination and filtering
router.get('/jaringan', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'jaringan'` : 'WHERE td.service_type = \'jaringan\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '',
      nib: row.license_number || '',
      layanan: row.sub_service_name || row.sub_service_type || '',
      nomorIzin: row.license_number || '',
      tanggalPengajuan: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalSubmit: row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalBerlaku: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      kbli: row.sub_service_name || 'Jaringan Telekomunikasi',
      status: formatStatus(row.status)
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
 } catch (e) {
    console.error('Failed to fetch Jaringan data', e);
    res.status(500).json({ error: 'Failed to fetch Jaringan data' });
  }
});

// Get ISR data with pagination and filtering
router.get('/isr', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'isr'` : 'WHERE td.service_type = \'isr\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '',
      nib: row.license_number || '',
      layanan: row.sub_service_name || row.sub_service_type || '',
      stasiun: row.sub_service_name || 'Stasiun Radio',
      area: row.region || '',
      frequency: 'N/A', // Frequency data not in current schema
      koordinat: `${row.latitude || ''}, ${row.longitude || ''}`,
      tanggalIzin: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalValid: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      status: formatStatus(row.status)
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
  } catch (e) {
    console.error('Failed to fetch ISR data', e);
    res.status(500).json({ error: 'Failed to fetch ISR data' });
 }
});

// Get Penomoran data with pagination and filtering
router.get('/penomoran', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'tarif'` : 'WHERE td.service_type = \'tarif\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '—',
      nib: row.license_number || '',
      jenisPenyelenggara: row.company_name ? 'Penyelenggara Telekomunikasi' : '',
      jenis: row.sub_service_name || row.sub_service_type || 'Kode Akses Pusat Panggilan Informasi (Call Center)',
      jenisKode: row.sub_service_code || '150XYZ',
      kodeAkses: row.license_number || '150164',
      nomor: row.license_number || '',
      tanggalPenetapan: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '',
      status: row.status === 'active' ? 'Aktif' : row.status === 'inactive' ? 'Nonaktif' : 'Idle'
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
 } catch (e) {
    console.error('Failed to fetch Penomoran data', e);
    res.status(500).json({ error: 'Failed to fetch Penomoran data' });
  }
});

// Get LKO data with pagination and filtering
router.get('/lko', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'lko'` : 'WHERE td.service_type = \'lko\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '',
      nib: row.license_number || '',
      alamat: row.region || '',
      alamatKorespondensi: row.region || '',
      tahun: row.license_date ? new Date(row.license_date).getFullYear().toString() : new Date().getFullYear().toString(),
      status: row.status === 'active' ? 'Sudah menyampaikan' : 'Belum menyampaikan'
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
 } catch (e) {
    console.error('Failed to fetch LKO data', e);
    res.status(500).json({ error: 'Failed to fetch LKO data' });
  }
});

// Get Jasa data with pagination and filtering
router.get('/jasa', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      license_number,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i} OR td.region ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`td.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (license_number && typeof license_number === 'string') {
      filters.push(`td.license_number ILIKE $${i}`);
      params.push(`%${license_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')} AND td.service_type = 'jasa'` : 'WHERE td.service_type = \'jasa\'';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.license_number, td.license_date, td.status, td.region, td.latitude, td.longitude,
             td.sub_service_type, td.created_at, td.updated_at, td.file_url,
             ss.name as sub_service_name, ss.code as sub_service_code,
             s.name as service_name, s.code as service_code,
             p.name as province_name, k.name as kabupaten_name
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON td.sub_service_id = ss.id
      LEFT JOIN public.services s ON ss.service_id = s.id
      LEFT JOIN public.provinces p ON td.province_id = p.id
      LEFT JOIN public.kabupaten k ON td.kabupaten_id = k.id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      penyelenggara: row.company_name || '',
      nib: row.license_number || '',
      layanan: row.sub_service_name || row.sub_service_type || '',
      nomorIzin: row.license_number || '',
      tanggalPengajuan: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalSubmit: row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      tanggalBerlaku: row.license_date ? new Date(row.license_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '',
      kbli: row.sub_service_name || 'Jasa Telekomunikasi',
      status: formatStatus(row.status)
    }));

    res.json({
      data: formattedData,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSizeNum))
    });
 } catch (e) {
    console.error('Failed to fetch Jasa data', e);
    res.status(500).json({ error: 'Failed to fetch Jasa data' });
  }
});

export default router;