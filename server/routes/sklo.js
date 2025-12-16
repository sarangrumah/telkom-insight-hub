import express from 'express';
const router = express.Router();
import { query } from '../db.js';

// Get SKLO data with pagination and filtering
router.get('/sklo', async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      company_name,
      sklo_number,
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
      filters.push(`(c.company_name ILIKE $${i} OR la.license_number ILIKE $${i} OR ua.sklo_number ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`ua.status = $${i}`);
      params.push(status);
      i++;
    }
    if (company_name && typeof company_name === 'string') {
      filters.push(`c.company_name ILIKE $${i}`);
      params.push(`%${company_name}%`);
      i++;
    }
    if (sklo_number && typeof sklo_number === 'string') {
      filters.push(`ua.sklo_number ILIKE $${i}`);
      params.push(`%${sklo_number}%`);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`ua.issued_at >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`ua.issued_at <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.ulo_applications ua
      LEFT JOIN public.license_applications la ON ua.license_application_id = la.id
      LEFT JOIN public.companies c ON la.company_id = c.id
      LEFT JOIN public.sub_services ss ON la.license_service_id = ss.id
    ${whereSql}
  `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT ua.id, ua.sklo_number, ua.status, ua.issued_at,
             c.company_name, la.application_number as license_number, la.submitted_at,
             COALESCE(ss.name, ls.name) as sub_service_name
      FROM public.ulo_applications ua
      LEFT JOIN public.license_applications la ON ua.license_application_id = la.id
      LEFT JOIN public.companies c ON la.company_id = c.id
      LEFT JOIN public.sub_services ss ON la.license_service_id = ss.id
      LEFT JOIN public.services ls ON ss.service_id = ls.id
      ${whereSql}
      ORDER BY ua.issued_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    // Format the response to match the frontend expectation
    const formattedData = rows.map(row => ({
      id: row.id,
      perusahaan: row.company_name || '',
      perusahaanAlt: row.company_name || '', // Using same as perusahaan for now
      izinLayanan: row.sub_service_name || '',
      nomorSKLO: row.sklo_number || '',
      tanggalBerlaku: row.issued_at ? new Date(row.issued_at).toLocaleDateString('id-ID', {
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
    console.error('Failed to fetch SKLO data', e);
    res.status(500).json({ error: 'Failed to fetch SKLO data' });
  }
});

// Helper function to format status
function formatStatus(dbStatus) {
  if (!dbStatus) return 'Disetujui';
  
  // Convert database status to frontend status
  const statusMap = {
    'submitted': 'Permohonan Baru',
    'in_review': 'Diproses',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'completed': 'Disetujui',
    'under_review': 'Diproses',
    'need_correction': 'Diproses',
    'draft': 'Diproses'
  };
  
  return statusMap[dbStatus] || 'Disetujui';
}

export default router;