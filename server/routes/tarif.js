const express = require('express');
const router = express.Router();
const db = require('../db');

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
    let query = 'SELECT * FROM tariff_data WHERE 1=1';
    const queryParams = [];
    
    if (tahun !== null) {
      query += ' AND tahun = ?';
      queryParams.push(tahun);
    }
    
    if (periode !== null) {
      query += ' AND periode = ?';
      queryParams.push(periode);
    }
    
    if (jenis !== null) {
      // For jenis parameter, we need to match against jenis_izin field which contains 'Jasa-' or 'Jaringan-' prefix
      if (jenis === 'Jasa') {
        query += ' AND jenis_izin LIKE \'Jasa-%\'';
      } else if (jenis === 'Jaringan') {
        query += ' AND jenis_izin LIKE \'Jaringan-%\'';
      }
    }
    
    query += ' ORDER BY id DESC';
    
    if (limit !== null) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }
    
    const results = await db.all(query, queryParams);
    
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
    
    const query = 'SELECT * FROM tariff_data WHERE id = ?';
    const result = await db.get(query, [id]);
    
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
    const query = `
      INSERT INTO tariff_data (
        jenis_izin, title, color, title_jenis, penyelenggara, pic, email, 
        status_email, id_user, app_name, id_jenis_izin, id_izin, 
        id_jenis_report, jenis_periode, jenis, tanggal, filename, 
        status, tahun, periode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        jenis_izin = excluded.jenis_izin,
        title = excluded.title,
        color = excluded.color,
        title_jenis = excluded.title_jenis,
        penyelenggara = excluded.penyelenggara,
        pic = excluded.pic,
        email = excluded.email,
        status_email = excluded.status_email,
        id_user = excluded.id_user,
        app_name = excluded.app_name,
        id_jenis_izin = excluded.id_jenis_izin,
        id_izin = excluded.id_izin,
        id_jenis_report = excluded.id_jenis_report,
        jenis_periode = excluded.jenis_periode,
        jenis = excluded.jenis,
        tanggal = excluded.tanggal,
        filename = excluded.filename,
        status = excluded.status,
        tahun = excluded.tahun,
        periode = excluded.periode,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const result = await db.run(query, [
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
      id: result.lastID
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
    await db.run('BEGIN TRANSACTION');
    
    const insertQuery = `
      INSERT INTO tariff_data (
        jenis_izin, title, color, title_jenis, penyelenggara, pic, email, 
        status_email, id_user, app_name, id_jenis_izin, id_izin, 
        id_jenis_report, jenis_periode, jenis, tanggal, filename, 
        status, tahun, periode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        jenis_izin = excluded.jenis_izin,
        title = excluded.title,
        color = excluded.color,
        title_jenis = excluded.title_jenis,
        penyelenggara = excluded.penyelenggara,
        pic = excluded.pic,
        email = excluded.email,
        status_email = excluded.status_email,
        id_user = excluded.id_user,
        app_name = excluded.app_name,
        id_jenis_izin = excluded.id_jenis_izin,
        id_izin = excluded.id_izin,
        id_jenis_report = excluded.id_jenis_report,
        jenis_periode = excluded.jenis_periode,
        jenis = excluded.jenis,
        tanggal = excluded.tanggal,
        filename = excluded.filename,
        status = excluded.status,
        tahun = excluded.tahun,
        periode = excluded.periode,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    for (const item of data) {
      await db.run(insertQuery, [
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
    
    await db.run('COMMIT');
    
    res.json({
      status: true,
      message: `Successfully imported ${data.length} records`
    });
  } catch (error) {
    console.error('Error importing tariff data:', error);
    await db.run('ROLLBACK');
    res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;