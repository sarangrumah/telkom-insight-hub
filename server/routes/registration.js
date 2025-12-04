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

// Middleware to check user role
const requireRole = (roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;

      // Check if user has required role
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', roles);

      if (roleError || !data || data.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.userId = user.id;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Registration with documents endpoint
router.post('/register-with-documents', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'nib_document', maxCount: 1 },
  { name: 'npwp_document', maxCount: 1 },
  { name: 'akta_document', maxCount: 1 },
  { name: 'ktp_document', maxCount: 1 },
  { name: 'assignment_letter', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      company_name,
      phone,
      position,
      maksud_tujuan,
      address,
      province_id,
      kabupaten_id,
      kecamatan,
      kelurahan,
      postal_code,
      pic_full_name,
      pic_id_number,
      pic_phone_number,
      pic_position,
      pic_address,
      pic_province_id,
      pic_kabupaten_id,
      pic_kecamatan,
      pic_kelurahan,
      pic_postal_code
    } = req.body;

    // Sign up the user with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          company_name,
          phone,
          maksud_tujuan
        }
      }
    });

    if (signUpError) throw signUpError;

    const user = signUpData.user;

    // Create company record
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{
        company_name,
        email,
        phone,
        company_address: address,
        province_id,
        kabupaten_id,
        kecamatan,
        kelurahan,
        postal_code,
        business_field: 'telecommunications',
        status: 'pending_verification',
        nib_number: null,
        npwp_number: null,
        company_type: 'pt',
        akta_number: null
      }])
      .select()
      .single();

    if (companyError) throw companyError;

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company_name,
        phone,
        is_validated: false,
        maksud_tujuan
      })
      .eq('user_id', user.id);

    if (profileError) throw profileError;

    // Create user profile linking to company
    const { error: userprofileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        company_id: companyData.id,
        full_name,
        position,
        phone,
        role: 'pelaku_usaha',
        is_company_admin: true
      }]);

    if (userprofileError) throw userprofileError;

    // Upload documents to storage and save references
    const documentTypes = [
      { field: 'nib_document', type: 'nib' },
      { field: 'npwp_document', type: 'npwp' },
      { field: 'akta_document', type: 'akta' },
      { field: 'ktp_document', type: 'ktp' },
      { field: 'assignment_letter', type: 'assignment_letter' }
    ];

    for (const doc of documentTypes) {
      if (req.files[doc.field]) {
        const file = req.files[doc.field][0];
        
        // Upload to Supabase storage
        const fileName = `${Date.now()}-${companyData.id}-${doc.type}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`temp/registration/${companyData.id}/${fileName}`, file.buffer, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save document reference to database
        const { error: docError } = await supabase
          .from('company_documents')
          .insert([{
            company_id: companyData.id,
            document_type: doc.type,
            file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/temp/registration/${companyData.id}/${fileName}`,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.mimetype,
            uploaded_by: user.id
          }]);

        if (docError) throw docError;
      }
    }

    // Upload profile picture if provided
    if (req.files.profile_picture) {
      const file = req.files.profile_picture[0];
      const fileName = `${Date.now()}-${user.id}-profile-${file.originalname}`;
      
      const { error: profileUploadError } = await supabase.storage
        .from('documents')
        .upload(`profiles/${user.id}/${fileName}`, file.buffer, {
          cacheControl: '3600',
          upsert: false
        });

      if (profileUploadError) throw profileUploadError;

      // Update profile with profile picture URL
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/profiles/${user.id}/${fileName}`
        })
        .eq('user_id', user.id);

      if (updateProfileError) throw updateProfileError;
    }

    // Create person in charge record
    if (pic_full_name) {
      const { data: picData, error: picError } = await supabase
        .from('person_in_charge')
        .insert([{
          company_id: companyData.id,
          full_name: pic_full_name,
          id_number: pic_id_number,
          phone_number: pic_phone_number,
          position: pic_position,
          address: pic_address,
          province_id: pic_province_id,
          kabupaten_id: pic_kabupaten_id,
          kecamatan: pic_kecamatan,
          kelurahan: pic_kelurahan,
          postal_code: pic_postal_code
        }])
        .select()
        .single();

      if (picError) throw picError;

      // Upload PIC documents if provided
      const picDocTypes = [
        { field: 'pic_ktp_document', type: 'ktp' },
        { field: 'pic_assignment_letter', type: 'assignment_letter' }
      ];

      for (const doc of picDocTypes) {
        if (req.files[doc.field]) {
          const file = req.files[doc.field][0];
          
          const fileName = `${Date.now()}-${picData.id}-${doc.type}-${file.originalname}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`temp/pic/${picData.id}/${fileName}`, file.buffer, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { error: picDocError } = await supabase
            .from('pic_documents')
            .insert([{
              pic_id: picData.id,
              document_type: doc.type,
              file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/temp/pic/${picData.id}/${fileName}`,
              file_name: fileName,
              file_size: file.size,
              mime_type: file.mimetype,
              uploaded_by: user.id
            }]);

          if (picDocError) throw picDocError;
        }
      }
    }

    res.json({
      success: true,
      message: 'Registration successful. Please check your email for confirmation.',
      company_id: companyData.id,
      user_id: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get verification status for a user
router.get('/verification-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Get user's company information
    const { data: companies, error: companyError } = await supabase
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
        verified_at,
        verified_by,
        verification_notes,
        correction_notes,
        correction_status,
        nib_number,
        npwp_number,
        company_type,
        akta_number,
        province_id,
        kabupaten_id,
        kecamatan,
        kelurahan,
        postal_code,
        company_documents (
          id,
          document_type,
          file_name,
          file_size,
          mime_type,
          uploaded_at
        ),
        person_in_charge (
          id,
          full_name,
          id_number,
          position,
          phone_number
        )
      `)
      .eq('user_profiles.user_id', user.id)
      .single();

    if (companyError && companyError.code !== 'PGRST116') throw companyError;

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    // Generate notification message based on status
    let notificationMessage = '';
    switch (companies?.status) {
      case 'pending_verification':
        notificationMessage = 'Your registration is under review. Please wait for verification.';
        break;
      case 'verified':
        notificationMessage = 'Your company has been successfully verified. You now have full access to the platform.';
        break;
      case 'rejected':
        notificationMessage = 'Your registration has been rejected. Please contact support for more information.';
        break;
      case 'needs_correction':
        notificationMessage = 'Your registration needs correction. Please update the required information.';
        break;
      default:
        notificationMessage = 'Please complete your registration to proceed.';
    }

    res.json({
      success: true,
      status: companies?.status || 'unregistered',
      company: companies || null,
      user: userProfile,
      notification_message: notificationMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companies for management (for admin users)
router.get('/admin/companies', requireRole(['super_admin', 'internal_admin', 'pengolah_data']), async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        email,
        phone,
        status,
        created_at,
        updated_at,
        verified_at,
        verified_by,
        verification_notes,
        correction_notes,
        correction_status,
        nib_number,
        npwp_number,
        company_type,
        akta_number,
        company_documents (count),
        person_in_charge (count),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add validator names
    const companiesWithValidator = await Promise.all(companies.map(async (company) => {
      if (company.verified_by) {
        const { data: validatorProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', company.verified_by)
          .single();
        
        return {
          ...company,
          validator_name: validatorProfile?.full_name || 'Unknown'
        };
      }
      return company;
    }));

    res.json({
      success: true,
      companies: companiesWithValidator
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;