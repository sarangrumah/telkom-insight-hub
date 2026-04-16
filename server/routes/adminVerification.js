const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware to check admin access
const requireAdminAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'internal_admin', 'pengolah_data'])
      .single();

    if (roleError || !userRoles) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = userRoles.role;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending companies for verification
router.get('/pending-companies', requireAdminAccess, async (req, res) => {
  try {
    let query = supabase
      .from('companies')
      .select(`
        id,
        company_name,
        email,
        phone,
        company_address,
        business_field,
        status,
        created_at,
        updated_at,
        nib_number,
        npwp_number,
        company_type,
        akta_number,
        province_id,
        kabupaten_id,
        kecamatan,
        kelurahan,
        postal_code,
        correction_notes,
        correction_status,
        verified_at,
        verified_by,
        verification_notes,
        profiles!inner(full_name, phone),
        company_documents(count),
        person_in_charge(count)
      `)
      .in('status', ['pending_verification', 'needs_correction'])
      .order('created_at', { ascending: false });

    // For data processors, only show unassigned companies or those assigned to them
    if (req.userRole === 'pengolah_data') {
      query = query.or('assigned_to.is.null,assigned_to.eq.' + req.userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format the response
    const companies = data.map(company => ({
      id: company.id,
      company_name: company.company_name,
      email: company.email,
      phone: company.phone,
      company_address: company.company_address,
      business_field: company.business_field,
      status: company.status,
      created_at: company.created_at,
      updated_at: company.updated_at,
      nib_number: company.nib_number,
      npwp_number: company.npwp_number,
      company_type: company.company_type,
      akta_number: company.akta_number,
      province_id: company.province_id,
      kabupaten_id: company.kabupaten_id,
      kecamatan: company.kecamatan,
      kelurahan: company.kelurahan,
      postal_code: company.postal_code,
      correction_notes: company.correction_notes,
      correction_status: company.correction_status,
      verified_at: company.verified_at,
      verified_by: company.verified_by,
      verification_notes: company.verification_notes,
      owner_name: company.profiles?.full_name,
      owner_phone: company.profiles?.phone,
      document_count: company.company_documents?.length || 0,
      pic_count: company.person_in_charge?.length || 0
    }));

    res.json({
      success: true,
      companies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company details for verification
router.get('/companies/:companyId', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        company_documents (
          id,
          document_type,
          file_path,
          file_name,
          file_size,
          mime_type,
          uploaded_by,
          created_at,
          profiles (full_name)
        ),
        person_in_charge (
          id,
          full_name,
          id_number,
          phone_number,
          position,
          address,
          province_id,
          kabupaten_id,
          kecamatan,
          kelurahan,
          postal_code,
          pic_documents (
            id,
            document_type,
            file_path,
            file_name,
            file_size,
            mime_type,
            uploaded_by,
            created_at
          )
        ),
        profiles (full_name, phone, email)
      `)
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign company to data processor for verification
router.post('/companies/:companyId/assign', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { assigned_to } = req.body;

  try {
    // Only internal admins and super admins can assign to data processors
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Only internal admins can assign companies' });
    }

    const { data, error } = await supabase
      .from('companies')
      .update({
        assigned_to: assigned_to,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company assigned successfully',
      company: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve company registration
router.post('/companies/:companyId/approve', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { notes } = req.body;

  try {
    // Only internal admins and super admins can approve
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions to approve companies' });
    }

    // Update company status to verified
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: req.userId,
        verification_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (companyError) throw companyError;

    // Update associated user profiles to validated status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_validated: true,
        updated_at: new Date().toISOString()
      })
      .in('user_id', 
        await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('company_id', companyId)
          .then(result => result.data.map(up => up.user_id))
      );

    if (profileError) throw profileError;

    res.json({
      success: true,
      message: 'Company approved successfully',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject company registration
router.post('/companies/:companyId/reject', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { rejection_notes } = req.body;

  try {
    // Only internal admins and super admins can reject
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions to reject companies' });
    }

    if (!rejection_notes) {
      return res.status(400).json({ error: 'Rejection notes are required' });
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update({
        status: 'rejected',
        verified_by: req.userId,
        verification_notes: rejection_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (companyError) throw companyError;

    res.json({
      success: true,
      message: 'Company rejected',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request company correction
router.post('/companies/:companyId/request-correction', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { correction_notes } = req.body;

  try {
    // Both data processors and internal admins can request corrections
    if (!['pengolah_data', 'internal_admin', 'super_admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions to request corrections' });
    }

    if (!correction_notes) {
      return res.status(400).json({ error: 'Correction notes are required' });
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update({
        status: 'needs_correction',
        correction_notes: correction_notes,
        correction_status: 'pending_correction',
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (companyError) throw companyError;

    res.json({
      success: true,
      message: 'Correction requested successfully',
      company_id: companyId,
      status: 'needs_correction'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit company corrections (for users)
router.put('/companies/:companyId/submit-corrections', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const { companyId } = req.params;
    const { updated_data } = req.body;

    // Verify user has access to this company
    const { data: userCompanies, error: accessError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', companyId);

    if (accessError || !userCompanies || userCompanies.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Update company data with corrections
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        ...updated_data,
        status: 'pending_verification', // Reset to pending verification
        correction_status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Corrections submitted successfully',
      company_id: companyId,
      status: 'pending_verification'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verification statistics
router.get('/verification-stats', requireAdminAccess, async (req, res) => {
  try {
    // Get overall verification statistics
    const { data: stats, error: statsError } = await supabase
      .from('companies')
      .select(`
        status,
        count(*) as count
      `)
      .group('status');

    if (statsError) throw statsError;

    // Get recent activities
    const { data: recentActivities, error: activityError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        created_at,
        profiles (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) throw activityError;

    res.json({
      success: true,
      stats,
      recent_activities: recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;