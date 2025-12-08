const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Simple sanitization function to prevent XSS
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input.replace(/[<>"]/g, (match) => {
      switch(match) {
        case '<': return '<';
        case '>': return '>';
        case '"': return '"';
        default: return match;
      }
    }).trim();
  }
  return input;
}

// Configure multer for file uploads with enhanced validation
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow both PDF and image files for different document types
    const allowedMimeTypes = [
      'application/pdf', // PDF documents
      'image/jpeg',      // JPEG images
      'image/jpg',       // JPG images
      'image/png'        // PNG images
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
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
  { name: 'assignment_letter', maxCount: 1 },
  { name: 'business_license_document', maxCount: 1 },
  { name: 'company_stamp', maxCount: 1 },
  { name: 'company_certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    // Sanitize input data to prevent XSS attacks
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(req.body)) {
      sanitizedBody[key] = sanitizeInput(value);
    }

    const {
      email,
      password,
      full_name,
      company_name,
      company_type,
      business_field,
      business_subfield,
      phone,
      position,
      maksud_tujuan,
      address,
      province_id,
      kabupaten_id,
      kecamatan,
      kelurahan,
      postal_code,
      npwp_number,
      nib_number,
      akta_number,
      akta_date,
      company_phone,
      company_email,
      company_website,
      business_activity,
      business_scale,
      business_established_year,
      employee_count,
      annual_revenue,
      business_license_type,
      business_license_number,
      business_license_expiry,
      pic_full_name,
      pic_id_number,
      pic_phone_number,
      pic_position,
      pic_address,
      pic_province_id,
      pic_kabupaten_id,
      pic_kecamatan,
      pic_kelurahan,
      pic_postal_code,
      verification_notes
    } = sanitizedBody;

    // Validate required fields
    const requiredFields = [email, password, full_name, company_name, company_type, business_field, address, province_id, kabupaten_id, kecamatan, kelurahan, postal_code, pic_full_name, pic_id_number, pic_phone_number, pic_position, pic_address, pic_province_id, pic_kabupaten_id, pic_kecamatan, pic_kelurahan, pic_postal_code];
    if (requiredFields.some(field => !field || field.toString().trim() === '')) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone number format (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[2-9]\d{6,}$/;
    if (!phoneRegex.test(phone) && !phoneRegex.test(pic_phone_number)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate business establishment year
    const currentYear = new Date().getFullYear();
    if (business_established_year && (isNaN(business_established_year) || business_established_year < 1900 || business_established_year > currentYear)) {
      return res.status(400).json({ error: 'Invalid establishment year' });
    }

    // Validate employee count
    if (employee_count && (isNaN(employee_count) || employee_count < 0)) {
      return res.status(400).json({ error: 'Invalid employee count' });
    }

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

    // Create company record with additional business details
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{
        company_name,
        email,
        phone: company_phone || phone,
        company_address: address,
        province_id,
        kabupaten_id,
        kecamatan,
        kelurahan,
        postal_code,
        business_field: business_field || 'telecommunications',
        business_subfield: business_subfield || null,
        status: 'pending_verification',
        nib_number: nib_number || null,
        npwp_number: npwp_number || null,
        company_type: company_type || 'pt',
        akta_number: akta_number || null,
        akta_date: akta_date || null,
        company_email: company_email || email,
        company_website: company_website || null,
        business_activity: business_activity || null,
        business_scale: business_scale || null,
        business_established_year: business_established_year ? parseInt(business_established_year) : null,
        employee_count: employee_count ? parseInt(employee_count) : null,
        annual_revenue: annual_revenue || null,
        business_license_type: business_license_type || null,
        business_license_number: business_license_number || null,
        business_license_expiry: business_license_expiry || null,
        verification_notes: verification_notes || null
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

    // Define all document types including new ones with enhanced validation
    const documentTypes = [
      { field: 'nib_document', type: 'nib', required: true, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'npwp_document', type: 'npwp', required: true, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'akta_document', type: 'akta', required: true, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'ktp_document', type: 'ktp', required: true, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'assignment_letter', type: 'assignment_letter', required: false, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'business_license_document', type: 'business_license', required: false, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'company_stamp', type: 'company_stamp', required: false, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
      { field: 'company_certificate', type: 'company_certificate', required: false, allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 }
    ];

    // Upload documents to storage and save references with enhanced validation
    for (const doc of documentTypes) {
      if (req.files[doc.field]) {
        const file = req.files[doc.field][0];
        
        // Validate file type
        if (!doc.allowedTypes.includes(file.mimetype)) {
          throw new Error(`Invalid file type for ${doc.type}. Allowed types: ${doc.allowedTypes.join(', ')}`);
        }

        // Validate file size
        if (file.size > doc.maxSize) {
          throw new Error(`File ${file.originalname} exceeds ${doc.maxSize / (1024 * 1024)}MB limit for ${doc.type}`);
        }

        // Additional validation could be added here if needed
        // Currently just basic validation is performed above

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
      } else if (doc.required) {
        throw new Error(`${doc.type} document is required`);
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
    }

    // Log the registration event for audit purposes
    await supabase.from('registration_logs').insert([{
      user_id: user.id,
      company_id: companyData.id,
      action: 'registration_initiated',
      ip_address: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '',
      user_agent: req.get('User-Agent') || '',
      timestamp: new Date().toISOString()
    }]);

    res.json({
      success: true,
      message: 'Registration successful. Please check your email for confirmation.',
      company_id: companyData.id,
      user_id: user.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Log the error for monitoring
    try {
      await supabase.from('error_logs').insert([{
        error_type: 'registration_error',
        error_message: error.message || error.toString(),
        user_id: req.user?.id || null,
        ip_address: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '',
        timestamp: new Date().toISOString(),
        stack_trace: error.stack || ''
      }]);
    } catch (logError) {
      console.error('Logging error failed:', logError);
    }

    res.status(500).json({
      error: error.message || 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Complete company and PIC information after initial registration
router.post('/complete-registration', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const {
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

    // Check if user already has a company profile through user_profiles (prevent duplicate registration)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile && existingProfile.company_id) {
      return res.status(400).json({ error: 'Company information already exists for this user' });
    }

    // Create company record
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{
        company_name,
        email: user.email,
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

    // Update user profile with company information
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
        full_name: user.user_metadata.full_name,
        position,
        phone,
        role: 'pelaku_usaha',
        is_company_admin: true
      }]);

    if (userprofileError) throw userprofileError;

    // Create person in charge record if provided
    if (pic_full_name) {
      const { error: picError } = await supabase
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
        }]);

      if (picError) throw picError;
    }

    res.json({
      success: true,
      message: 'Company and PIC information completed successfully.',
      company_id: companyData.id,
      user_id: user.id
    });
  } catch (error) {
    console.error('Complete registration error:', error);
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