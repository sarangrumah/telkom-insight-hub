const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware to check company access
const requireCompanyAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const companyId = req.params.companyId || req.body.companyId;

    // Check if user has access to the company
    const { data: userCompanies, error: accessError } = await supabase
      .from('user_profiles')
      .select('company_id, is_company_admin')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (accessError || !userCompanies) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Check company verification status
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('status')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    if (company.status !== 'verified') {
      return res.status(403).json({ 
        error: 'Company must be verified to submit certificates',
        company_status: company.status
      });
    }

    req.user = user;
    req.companyId = companyId;
    req.isCompanyAdmin = userCompanies.is_company_admin;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// Submit certificate document
router.post('/submit', requireCompanyAccess, upload.single('certificate'), async (req, res) => {
  const { document_type } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Certificate document is required' });
  }

  try {
    // Validate document type
    const validTypes = [
      'iso_certificate', 
      'quality_certificate', 
      'safety_certificate', 
      'compliance_certificate',
      'license_certificate',
      'certificate_of_origin',
      'certificate_other'
    ];
    
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    // Upload to Supabase storage
    const fileName = `${Date.now()}-${req.companyId}-${document_type}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`certificates/${req.companyId}/${fileName}`, file.buffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Save document reference to database
    const { data: certificate, error: certError } = await supabase
      .from('certificate_documents')
      .insert([{
        company_id: req.companyId,
        document_type,
        file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/certificates/${req.companyId}/${fileName}`,
        file_name: fileName,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id
      }])
      .select()
      .single();

    if (certError) throw certError;

    res.json({
      success: true,
      message: 'Certificate submitted successfully',
      certificate: {
        id: certificate.id,
        document_type: certificate.document_type,
        file_name: certificate.file_name,
        file_size: certificate.file_size,
        verification_status: certificate.verification_status,
        submitted_at: certificate.submitted_at
      }
    });
  } catch (error) {
    console.error('Certificate submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get certificates for a company
router.get('/:companyId/certificates', requireCompanyAccess, async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificate_documents')
      .select(`
        id,
        document_type,
        file_name,
        file_size,
        mime_type,
        submitted_at,
        verified_at,
        verification_status,
        verification_notes,
        profiles!verified_by (full_name)
      `)
      .eq('company_id', req.companyId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all pending certificates for verification
router.get('/admin/pending-certificates', requireAdminAccess, async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificate_documents')
      .select(`
        id,
        document_type,
        file_name,
        file_size,
        submitted_at,
        companies (company_name, email)
      `)
      .eq('verification_status', 'pending_verification')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      certificates: certificates.map(cert => ({
        id: cert.id,
        document_type: cert.document_type,
        file_name: cert.file_name,
        file_size: cert.file_size,
        submitted_at: cert.submitted_at,
        company_name: cert.companies?.company_name,
        company_email: cert.companies?.email
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Verify certificate
router.post('/admin/certificates/:certificateId/verify', requireAdminAccess, async (req, res) => {
  const { certificateId } = req.params;
  const { status, notes } = req.body;

  try {
    // Validate status
    if (!['verified', 'rejected', 'needs_correction'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be verified, rejected, or needs_correction' });
    }

    const { data: certificate, error: certError } = await supabase
      .from('certificate_documents')
      .update({
        verification_status: status,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verified_by: req.userId,
        verification_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', certificateId)
      .select(`
        id,
        company_id,
        verification_status,
        companies (company_name, email)
      `)
      .single();

    if (certError) throw certError;

    // Create notification ticket for the company
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        user_id: (await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('company_id', certificate.company_id)
          .limit(1)
          .single()).data?.user_id,
        title: `Certificate ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Your certificate "${certificate.file_name}" has been ${status}. ${notes || ''}`,
        status: 'open',
        priority: 'medium',
        category: 'verification',
        created_at: new Date().toISOString()
      }]);

    if (ticketError) {
      console.error('Error creating notification ticket:', ticketError);
    }

    res.json({
      success: true,
      message: `Certificate ${status} successfully`,
      certificate: {
        id: certificate.id,
        verification_status: certificate.verification_status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete certificate (only if pending verification)
router.delete('/certificates/:certificateId', requireCompanyAccess, async (req, res) => {
  const { certificateId } = req.params;

  try {
    // Get certificate to check status
    const { data: certificate, error: fetchError } = await supabase
      .from('certificate_documents')
      .select('verification_status, file_name')
      .eq('id', certificateId)
      .eq('company_id', req.companyId)
      .single();

    if (fetchError) throw fetchError;

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Only allow deletion if status is pending_verification
    if (certificate.verification_status !== 'pending_verification') {
      return res.status(403).json({ 
        error: 'Certificate cannot be deleted after verification process started',
        current_status: certificate.verification_status
      });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('certificate_documents')
      .delete()
      .eq('id', certificateId);

    if (deleteError) throw deleteError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([`certificates/${req.companyId}/${certificate.file_name}`]);

    if (storageError) {
      console.warn('Warning: Could not delete file from storage:', storageError);
    }

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update certificate (only if pending verification)
router.put('/certificates/:certificateId', requireCompanyAccess, upload.single('certificate'), async (req, res) => {
  const { certificateId } = req.params;
  const file = req.file;

  try {
    // Get current certificate to check status
    const { data: currentCert, error: fetchError } = await supabase
      .from('certificate_documents')
      .select('verification_status, file_name')
      .eq('id', certificateId)
      .eq('company_id', req.companyId)
      .single();

    if (fetchError) throw fetchError;

    if (!currentCert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (currentCert.verification_status !== 'pending_verification') {
      return res.status(403).json({ 
        error: 'Certificate cannot be updated after verification process started',
        current_status: currentCert.verification_status
      });
    }

    // If new file is provided, upload it and update the reference
    if (file) {
      // Delete old file from storage
      const { error: deleteOldError } = await supabase.storage
        .from('documents')
        .remove([`certificates/${req.companyId}/${currentCert.file_name}`]);

      if (deleteOldError) {
        console.warn('Warning: Could not delete old file from storage:', deleteOldError);
      }

      // Upload new file
      const fileName = `${Date.now()}-${req.companyId}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`certificates/${req.companyId}/${fileName}`, file.buffer, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update database record
      const { data: updatedCert, error: updateError } = await supabase
        .from('certificate_documents')
        .update({
          file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/certificates/${req.companyId}/${fileName}`,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.mimetype,
          updated_at: new Date().toISOString()
        })
        .eq('id', certificateId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: 'Certificate updated successfully',
        certificate: updatedCert
      });
    } else {
      res.status(400).json({ error: 'New certificate file is required for update' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;