import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper function to validate and sanitize query parameters
const validateAndSanitizeParams = (req) => {
  const { tahun, periode, limit, jenis } = req.query;
  
  // Validate tahun (year)
  let validatedTahun = null;
  if (tahun !== undefined && tahun !== '') {
    const yearNum = parseInt(tahun, 10);
    if (!isNaN(yearNum) && yearNum > 0) {
      validatedTahun = yearNum;
    }
  }
  
  // Validate periode (period)
  let validatedPeriode = null;
  if (periode !== undefined && periode !== '') {
    const validPeriods = ['Bulanan', 'Triwulan', 'Tahunan'];
    if (validPeriods.includes(periode)) {
      validatedPeriode = periode;
    }
 }
  
  // Validate limit
  let validatedLimit = null;
  if (limit !== undefined && limit !== '') {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 1000) { // Reasonable max limit
      validatedLimit = limitNum;
    }
  }
  
  // Validate jenis (type)
  let validatedJenis = null;
  if (jenis !== undefined && jenis !== '') {
    const validJenis = ['Jasa', 'Jaringan'];
    if (validJenis.includes(jenis)) {
      validatedJenis = jenis;
    }
  }
  
  return {
    tahun: validatedTahun,
    periode: validatedPeriode,
    limit: validatedLimit,
    jenis: validatedJenis
  };
};

// API endpoint to get tariff data with dynamic parameters
router.get('/tarif-data', async (req, res) => {
  try {
    const { tahun, periode, limit, jenis } = validateAndSanitizeParams(req);
    
    // Build the query dynamically based on provided parameters
    let sqlQuery = 'SELECT * FROM tariff_data WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;
    
    if (tahun !== null) {
      sqlQuery += ` AND tahun = $${paramIndex}`;
      queryParams.push(tahun);
      paramIndex++;
    }
    
    if (periode !== null) {
      sqlQuery += ` AND periode = $${paramIndex}`;
      queryParams.push(periode);
      paramIndex++;
    }
    
    if (jenis !== null) {
      // For jenis parameter, we need to match against jenis_izin field which contains 'Jasa-' or 'Jaringan-' prefix
      if (jenis === 'Jasa') {
        sqlQuery += ` AND jenis_izin LIKE $${paramIndex}`;
        queryParams.push('Jasa-%');
        paramIndex++;
      } else if (jenis === 'Jaringan') {
        sqlQuery += ` AND jenis_izin LIKE $${paramIndex}`;
        queryParams.push('Jaringan-%');
        paramIndex++;
      }
    }
    
    sqlQuery += ' ORDER BY id DESC';
    
    if (limit !== null) {
      sqlQuery += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
    }
    
    const { rows: results } = await query(sqlQuery, queryParams);
    
    res.json({
      status: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching tariff data:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// API endpoint to get tariff data by ID
router.get('/tarif-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'SELECT * FROM tariff_data WHERE id = $1';
    const { rows } = await query(sqlQuery, [id]);
    const result = rows.length > 0 ? rows[0] : null;
    
    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'Tariff data not found'
      });
    }
    
    res.json({
      status: true,
      data: [result]
    });
 } catch (error) {
    console.error('Error fetching tariff data by ID:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// API endpoint to create/update tariff data
router.post('/tarif-data', async (req, res) => {
  try {
    const {
      jenis_izin,
      title,
      color,
      title_jenis,
      penyelenggara,
      pic,
      email,
      status_email,
      id_user,
      app_name,
      id_jenis_izin,
      id_izin,
      id_jenis_report,
      jenis_periode,
      jenis,
      tanggal,
      filename,
      status,
      tahun,
      periode
    } = req.body;
    
    // Insert or update tariff data
    const insertQuery = `
      INSERT INTO tariff_data (
        jenis_izin, title, color, title_jenis, penyelenggara, pic, email, 
        status_email, id_user, app_name, id_jenis_izin, id_izin, 
        id_jenis_report, jenis_periode, jenis, tanggal, filename, 
        status, tahun, periode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT(id) DO UPDATE SET
        jenis_izin = EXCLUDED.jenis_izin,
        title = EXCLUDED.title,
        color = EXCLUDED.color,
        title_jenis = EXCLUDED.title_jenis,
        penyelenggara = EXCLUDED.penyelenggara,
        pic = EXCLUDED.pic,
        email = EXCLUDED.email,
        status_email = EXCLUDED.status_email,
        id_user = EXCLUDED.id_user,
        app_name = EXCLUDED.app_name,
        id_jenis_izin = EXCLUDED.id_jenis_izin,
        id_izin = EXCLUDED.id_izin,
        id_jenis_report = EXCLUDED.id_jenis_report,
        jenis_periode = EXCLUDED.jenis_periode,
        jenis = EXCLUDED.jenis,
        tanggal = EXCLUDED.tanggal,
        filename = EXCLUDED.filename,
        status = EXCLUDED.status,
        tahun = EXCLUDED.tahun,
        periode = EXCLUDED.periode,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    const result = await query(insertQuery, [
      jenis_izin,
      title,
      color,
      title_jenis,
      penyelenggara,
      pic,
      email,
      status_email,
      id_user,
      app_name,
      id_jenis_izin,
      id_izin,
      id_jenis_report,
      jenis_periode,
      jenis,
      tanggal,
      filename,
      status,
      tahun || 2023,
      periode || 'Bulanan'
    ]);
    
    res.json({
      status: true,
      message: 'Tariff data saved successfully',
      id: result.rows[0]?.id || null
    });
  } catch (error) {
    console.error('Error saving tariff data:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// API endpoint to bulk import tariff data
router.post('/tarif-data/bulk', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({
        status: false,
        message: 'Data must be an array'
      });
    }
    
    // Begin transaction for bulk insert
    await query('BEGIN');
    
    const insertQuery = `
      INSERT INTO tariff_data (
        jenis_izin, title, color, title_jenis, penyelenggara, pic, email, 
        status_email, id_user, app_name, id_jenis_izin, id_izin, 
        id_jenis_report, jenis_periode, jenis, tanggal, filename, 
        status, tahun, periode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT(id) DO UPDATE SET
        jenis_izin = EXCLUDED.jenis_izin,
        title = EXCLUDED.title,
        color = EXCLUDED.color,
        title_jenis = EXCLUDED.title_jenis,
        penyelenggara = EXCLUDED.penyelenggara,
        pic = EXCLUDED.pic,
        email = EXCLUDED.email,
        status_email = EXCLUDED.status_email,
        id_user = EXCLUDED.id_user,
        app_name = EXCLUDED.app_name,
        id_jenis_izin = EXCLUDED.id_jenis_izin,
        id_izin = EXCLUDED.id_izin,
        id_jenis_report = EXCLUDED.id_jenis_report,
        jenis_periode = EXCLUDED.jenis_periode,
        jenis = EXCLUDED.jenis,
        tanggal = EXCLUDED.tanggal,
        filename = EXCLUDED.filename,
        status = EXCLUDED.status,
        tahun = EXCLUDED.tahun,
        periode = EXCLUDED.periode,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    for (const item of data) {
      await query(insertQuery, [
        item.jenis_izin,
        item.title,
        item.color,
        item.title_jenis,
        item.penyelenggara,
        item.pic,
        item.email,
        item.status_email,
        item.id_user,
        item.app_name,
        item.id_jenis_izin,
        item.id_izin,
        item.id_jenis_report,
        item.jenis_periode,
        item.jenis,
        item.tanggal,
        item.filename,
        item.status,
        item.tahun || 2023,
        item.periode || 'Bulanan'
      ]);
    }
    
    await query('COMMIT');
    
    res.json({
      status: true,
      message: `Successfully imported ${data.length} records`
    });
  } catch (error) {
    console.error('Error importing tariff data:', error);
    await query('ROLLBACK');
    res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Export the router for use in the main server file
export default router;