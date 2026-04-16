# User Validation Workflow Implementation

## Overview
This document outlines the implementation of the user validation workflow involving data processors and internal admins, leveraging the existing system architecture.

## Current System Capabilities
The existing system already has:
- Role-based access control with `pengolah_data` (data processor) and `internal_admin` roles
- Company verification status tracking with `pending_verification`, `verified`, `rejected`, `needs_correction` states
- Document management for company and PIC documents
- Notification systems via tickets and messages
- Audit logging capabilities

## Implementation Plan

### 1. Database Schema (No Changes Required)
The existing schema already supports the required functionality:
- `companies` table with `status`, `verified_at`, `verified_by`, `verification_notes`, `correction_notes`, `correction_status` fields
- `company_documents` table for storing uploaded documents
- `person_in_charge` and `pic_documents` tables for PIC information
- `user_roles` table for role management
- `ticket_messages` for communication between users and admins

### 2. Backend Implementation

#### Verification Functions
The existing functions already handle most of the workflow:

```sql
-- Already implemented functions:
CREATE OR REPLACE FUNCTION public.approve_company(
  _company_id UUID,
  _verified_by UUID,
  _notes TEXT DEFAULT NULL
)

CREATE OR REPLACE FUNCTION public.reject_company(
  _company_id UUID,
  _rejected_by UUID,
  _rejection_notes TEXT
)

CREATE OR REPLACE FUNCTION public.request_company_correction(
  _company_id UUID,
  _requested_by UUID,
  _correction_notes JSONB
)

CREATE OR REPLACE FUNCTION public.submit_company_corrections(
  _company_id UUID,
  _submitted_by UUID,
  _updated_data JSONB
)

CREATE OR REPLACE FUNCTION public.get_companies_for_management()
```

#### Enhanced Verification Workflow
We'll enhance the existing workflow with additional validation:

```sql
-- Enhanced function to check if all required documents are uploaded
CREATE OR REPLACE FUNCTION public.validate_company_documents(
  _company_id UUID
)
RETURNS TABLE(is_complete BOOLEAN, missing_documents TEXT[])
LANGUAGE plpgsql
AS $$
DECLARE
  required_docs TEXT[] := ARRAY['nib', 'npwp', 'akta'];
  uploaded_docs TEXT[];
BEGIN
  -- Get all uploaded document types for the company
  SELECT ARRAY_AGG(cd.document_type) INTO uploaded_docs
  FROM public.company_documents cd
  WHERE cd.company_id = _company_id;
  
  -- Check if all required documents are present
  RETURN QUERY
  SELECT 
    NOT (required_docs @> uploaded_docs) AS is_complete,
    ARRAY(SELECT UNNEST(required_docs) EXCEPT SELECT UNNEST(uploaded_docs OR ARRAY[]::TEXT[])) AS missing_documents;
END;
$$;

-- Function to notify users about verification status changes
CREATE OR REPLACE FUNCTION public.notify_verification_status_change(
  _company_id UUID,
  _status company_status,
  _notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _subject TEXT;
  _message TEXT;
BEGIN
  -- Get the user ID associated with the company
  SELECT up.user_id INTO _user_id
  FROM public.user_profiles up
  WHERE up.company_id = _company_id
  LIMIT 1;
  
  -- Prepare notification subject and message based on status
  CASE _status
    WHEN 'verified' THEN
      _subject := 'Company Verification Approved';
      _message := 'Your company registration has been approved. You now have full access to the platform.';
    WHEN 'rejected' THEN
      _subject := 'Company Registration Rejected';
      _message := 'Your company registration has been rejected. ' || COALESCE(_notes, '');
    WHEN 'needs_correction' THEN
      _subject := 'Company Registration Needs Correction';
      _message := 'Your company registration needs correction. Please update the required information. ' || COALESCE(_notes, '');
    WHEN 'pending_verification' THEN
      _subject := 'Company Registration Submitted';
      _message := 'Your company registration has been submitted and is under review.';
    ELSE
      _subject := 'Company Verification Status Updated';
      _message := 'Your company verification status has been updated to: ' || _status;
  END CASE;
  
  -- Create a support ticket for the notification
  INSERT INTO public.tickets (user_id, title, description, status, priority)
  VALUES (_user_id, _subject, _message, 'open', 'medium');
END;
$$;
```

#### Update existing approval function to include notifications
```sql
CREATE OR REPLACE FUNCTION public.approve_company(
  _company_id UUID,
  _verified_by UUID,
  _notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to approve companies
  IF NOT (has_role(_verified_by, 'super_admin') OR has_role(_verified_by, 'internal_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to approve companies';
  END IF;

  -- Update company status to verified
  UPDATE public.companies
  SET 
    status = 'verified',
    verified_at = now(),
    verified_by = _verified_by,
    verification_notes = _notes,
    updated_at = now()
  WHERE id = _company_id;

  -- Update associated user profiles to validated status
  UPDATE public.profiles
  SET 
    is_validated = true,
    updated_at = now()
  WHERE user_id IN (
    SELECT up.user_id 
    FROM public.user_profiles up 
    WHERE up.company_id = _company_id
  );

  -- Notify user about approval
  PERFORM public.notify_verification_status_change(_company_id, 'verified', _notes);
END;
$$;
```

### 3. Backend API Implementation

#### Express.js Routes for Verification Workflow
```javascript
// server/routes/verification.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Get pending registrations for verification
router.get('/pending-registrations', requireRole(['internal_admin', 'pengolah_data']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        email,
        phone,
        status,
        created_at,
        person_in_charge (id, full_name),
        company_documents (id, document_type)
      `)
      .in('status', ['pending_verification', 'needs_correction'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match frontend requirements
    const transformedData = data.map(company => ({
      id: company.id,
      company_name: company.company_name,
      email: company.email,
      phone: company.phone,
      status: company.status,
      created_at: company.created_at,
      pic_count: company.person_in_charge?.length || 0,
      document_count: company.company_documents?.length || 0
    }));

    res.json({ success: true, registrations: transformedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve company registration
router.post('/companies/:id/approve', requireRole(['internal_admin']), async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    // Call the database function to approve the company
    const { data, error } = await supabase.rpc('approve_company', {
      _company_id: id,
      _verified_by: req.userId,
      _notes: notes || null
    });

    if (error) throw error;

    res.json({ success: true, message: 'Company approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject company registration
router.post('/companies/:id/reject', requireRole(['internal_admin']), async (req, res) => {
  const { id } = req.params;
  const { rejection_notes } = req.body;

  try {
    // Call the database function to reject the company
    const { data, error } = await supabase.rpc('reject_company', {
      _company_id: id,
      _rejected_by: req.userId,
      _rejection_notes: rejection_notes
    });

    if (error) throw error;

    res.json({ success: true, message: 'Company rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request company correction
router.post('/companies/:id/request-correction', requireRole(['internal_admin', 'pengolah_data']), async (req, res) => {
  const { id } = req.params;
  const { correction_notes } = req.body;

  try {
    // Call the database function to request corrections
    const { data, error } = await supabase.rpc('request_company_correction', {
      _company_id: id,
      _requested_by: req.userId,
      _correction_notes: correction_notes
    });

    if (error) throw error;

    res.json({ success: true, message: 'Correction requested', status: 'needs_correction' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verification status for a user
router.get('/status', async (req, res) => {
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
        nib_number,
        npwp_number,
        status,
        created_at,
        updated_at,
        verified_at,
        verified_by,
        verification_notes,
        correction_notes,
        correction_status,
        company_documents (
          id,
          document_type,
          file_name,
          uploaded_at
        ),
        person_in_charge (
          id,
          full_name,
          id_number,
          position
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

module.exports = router;
```

#### Registration Endpoint with Document Upload
```javascript
// server/routes/auth.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file upload
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

// Registration with documents endpoint
router.post('/register-with-documents', upload.fields([
  { name: 'nib_document', maxCount: 1 },
  { name: 'npwp_document', maxCount: 1 },
  { name: 'akta_document', maxCount: 1 },
  { name: 'ktp_document', maxCount: 1 },
  { name: 'assignment_letter', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 }
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

    // Update user profile with company association
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
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`temp/registration/${fileName}`, file.buffer, {
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
            file_path: `${supabaseUrl}/storage/v1/object/public/documents/temp/registration/${fileName}`,
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
      const fileName = `${Date.now()}-profile-${file.originalname}`;
      
      const { error: profileUploadError } = await supabase.storage
        .from('documents')
        .upload(`temp/profiles/${user.id}/${fileName}`, file.buffer, {
          cacheControl: '3600',
          upsert: false
        });

      if (profileUploadError) throw profileUploadError;

      // Update profile with profile picture URL
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: `${supabaseUrl}/storage/v1/object/public/documents/temp/profiles/${user.id}/${fileName}`
        })
        .eq('user_id', user.id);

      if (updateProfileError) throw updateProfileError;
    }

    // Create person in charge record
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

    // Upload PIC documents
    const picDocTypes = [
      { field: 'pic_ktp_document', type: 'ktp' },
      { field: 'pic_assignment_letter', type: 'assignment_letter' }
    ];

    for (const doc of picDocTypes) {
      if (req.files[doc.field]) {
        const file = req.files[doc.field][0];
        
        const fileName = `${Date.now()}-pic-${doc.type}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`temp/pic/${fileName}`, file.buffer, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { error: picDocError } = await supabase
          .from('pic_documents')
          .insert([{
            pic_id: picData.id,
            document_type: doc.type,
            file_path: `${supabaseUrl}/storage/v1/object/public/documents/temp/pic/${fileName}`,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.mimetype,
            uploaded_by: user.id
          }]);

        if (picDocError) throw picDocError;
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

module.exports = router;
```

### 4. Frontend Implementation

#### React Hook for Verification Status
```tsx
// src/hooks/useVerificationStatus.ts
import { useState, useEffect } from 'react';

interface VerificationData {
  status: string;
  company: any;
  user: any;
  documents: any[];
  notification_message: string;
}

export const useVerificationStatus = () => {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verification-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      
      const data = await response.json();
      setVerificationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  return { verificationData, loading, error, refetch: fetchVerificationStatus };
};
```

#### Admin Verification Components
```tsx
// src/components/AdminVerificationTable.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, AlertTriangle } from 'lucide-react';

interface CompanyRegistration {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  document_count: number;
  pic_count: number;
}

interface AdminVerificationTableProps {
  onReview: (companyId: string) => void;
  onApprove: (companyId: string, notes?: string) => void;
  onReject: (companyId: string, notes: string) => void;
  onRequestCorrection: (companyId: string, notes: string) => void;
}

const AdminVerificationTable: React.FC<AdminVerificationTableProps> = ({
  onReview,
  onApprove,
  onReject,
  onRequestCorrection
}) => {
  const [registrations, setRegistrations] = useState<CompanyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/verification/pending-registrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading pending registrations...</div>;
  }

  return (
    <div className="space-y-4">
      {registrations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending registrations to review
        </div>
      ) : (
        registrations.map(registration => (
          <Card key={registration.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{registration.company_name}</h3>
                    <Badge variant={
                      registration.status === 'pending_verification' ? 'default' :
                      registration.status === 'needs_correction' ? 'warning' :
                      registration.status === 'verified' ? 'success' : 'destructive'
                    }>
                      {registration.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{registration.email} | {registration.phone}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{registration.document_count} documents</Badge>
                    <Badge variant="secondary">{registration.pic_count} PIC</Badge>
                    <Badge variant="outline">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReview(registration.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onApprove(registration.id)}
                    className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCompany(selectedCompany === registration.id ? null : registration.id);
                    }}
                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                  
                  {selectedCompany === registration.id && (
                    <div className="mt-2 p-3 bg-red-50 rounded-md w-full md:w-auto md:absolute md:z-10">
                      <textarea 
                        placeholder="Enter rejection notes..."
                        className="w-full p-2 border rounded mb-2"
                        rows={3}
                      ></textarea>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            // Handle rejection with notes
                            onReject(registration.id, 'Notes from admin');
                            setSelectedCompany(null);
                          }}
                        >
                          Confirm Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCompany(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCompany(selectedCompany === registration.id ? null : registration.id);
                    }}
                    className="flex items-center gap-1 text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Correct
                  </Button>
                  
                  {selectedCompany === registration.id && (
                    <div className="mt-2 p-3 bg-orange-50 rounded-md w-full md:w-auto md:absolute md:z-10">
                      <textarea 
                        placeholder="Enter correction notes..."
                        className="w-full p-2 border rounded mb-2"
                        rows={3}
                      ></textarea>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="warning"
                          onClick={() => {
                            // Handle correction request
                            onRequestCorrection(registration.id, 'Notes from admin');
                            setSelectedCompany(null);
                          }}
                        >
                          Request Correction
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCompany(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminVerificationTable;
```

### 5. Verification Workflow Process

#### Data Processor Responsibilities
1. Review submitted company registration documents
2. Check for completeness and validity of documents
3. Request corrections if documents are incomplete or invalid
4. Pass verified applications to internal admin for final approval

#### Internal Admin Responsibilities
1. Perform final verification of company information
2. Approve or reject company registration
3. Update company status in the system
4. Notify applicants of verification decisions

#### Workflow Steps
1. User completes registration with required documents
2. System sets company status to `pending_verification`
3. Data processor reviews documents and either:
   - Requests corrections (sets status to `needs_correction`)
   - Approves for internal admin review (status remains `pending_verification`)
4. Internal admin performs final review and either:
   - Approves company (sets status to `verified`)
   - Rejects company (sets status to `rejected`)
5. User receives notification of status change
6. Verified users gain full access to the system

This implementation leverages the existing database functions and enhances them with additional validation and notification capabilities to support the required workflow.