# Certificate Document Submission Implementation

## Overview
This document outlines the implementation of certificate document submission functionality, allowing verified users to submit certificates after their company registration has been approved.

## Current System Capabilities
The existing system already has:
- Document storage and management system
- User role management
- Company verification status tracking
- File upload functionality
- Notification system via tickets

## Implementation Plan

### 1. Backend Implementation

#### Certificate Document Database Table
```sql
-- Create certificate documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificate_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    verification_status TEXT DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'verified', 'rejected', 'needs_correction')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on certificate_documents table
ALTER TABLE public.certificate_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for certificate_documents
CREATE POLICY "Users can view certificates for their companies" ON public.certificate_documents
    FOR SELECT USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "Company admins can upload certificates" ON public.certificate_documents
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.is_company_admin = true
        )
    );

CREATE POLICY "Company admins can update certificates" ON public.certificate_documents
    FOR UPDATE USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.is_company_admin = true
        )
    );

CREATE POLICY "Company admins can delete certificates" ON public.certificate_documents
    FOR DELETE USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.is_company_admin = true
        )
    );

CREATE POLICY "Admins can manage all certificates" ON public.certificate_documents
    FOR ALL USING (
        public.has_role(auth.uid(), 'super_admin'::public.app_role) OR 
        public.has_role(auth.uid(), 'internal_admin'::public.app_role)
    );

-- Add trigger for updated_at column
CREATE TRIGGER update_certificate_documents_updated_at
    BEFORE UPDATE ON public.certificate_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

#### Certificate Submission Functions
```sql
-- Function to submit a certificate for verification
CREATE OR REPLACE FUNCTION public.submit_certificate_document(
    _company_id UUID,
    _user_id UUID,
    _document_type TEXT,
    _file_path TEXT,
    _file_name TEXT,
    _file_size INTEGER,
    _mime_type TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    certificate_id UUID,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _new_certificate_id UUID;
    _company_status TEXT;
    _result RECORD;
BEGIN
    -- Check if user has access to this company
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = _user_id AND company_id = _company_id AND is_company_admin = true
    ) THEN
        RAISE EXCEPTION 'User does not have admin access to this company';
    END IF;

    -- Check if company is verified
    SELECT status INTO _company_status
    FROM public.companies
    WHERE id = _company_id;

    IF _company_status != 'verified' THEN
        RAISE EXCEPTION 'Company must be verified to submit certificates';
    END IF;

    -- Insert certificate document record
    INSERT INTO public.certificate_documents (
        company_id,
        document_type,
        file_path,
        file_name,
        file_size,
        mime_type,
        uploaded_by
    )
    VALUES (
        _company_id,
        _document_type,
        _file_path,
        _file_name,
        _file_size,
        _mime_type,
        _user_id
    )
    RETURNING id INTO _new_certificate_id;

    -- Return success response
    RETURN QUERY
    SELECT 
        true as success,
        'Certificate submitted successfully' as message,
        _new_certificate_id as certificate_id,
        'pending_verification' as status;
END;
$$;

-- Function to verify certificate document
CREATE OR REPLACE FUNCTION public.verify_certificate_document(
    _certificate_id UUID,
    _verified_by UUID,
    _status TEXT,
    _notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    certificate_id UUID,
    updated_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_role public.app_role;
    _result RECORD;
BEGIN
    -- Check if user has required role to verify certificates
    IF NOT (public.has_role(_verified_by, 'super_admin'::public.app_role) OR 
            public.has_role(_verified_by, 'internal_admin'::public.app_role)) THEN
        RAISE EXCEPTION 'Insufficient permissions to verify certificates';
    END IF;

    -- Validate status parameter
    IF _status NOT IN ('verified', 'rejected', 'needs_correction') THEN
        RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or needs_correction';
    END IF;

    -- Update certificate verification status
    UPDATE public.certificate_documents
    SET 
        verification_status = _status,
        verified_at = CASE WHEN _status = 'verified' THEN now() ELSE verified_at END,
        verified_by = CASE WHEN _status IN ('verified', 'rejected', 'needs_correction') THEN _verified_by ELSE verified_by END,
        verification_notes = _notes,
        updated_at = now()
    WHERE id = _certificate_id;

    -- Return success response
    RETURN QUERY
    SELECT 
        true as success,
        'Certificate verification status updated' as message,
        _certificate_id as certificate_id,
        _status as updated_status;
END;
$$;

-- Function to get certificates for company
CREATE OR REPLACE FUNCTION public.get_company_certificates(
    _company_id UUID,
    _user_id UUID
)
RETURNS TABLE(
    id UUID,
    document_type TEXT,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_status TEXT,
    verification_notes TEXT,
    verified_by_name TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.id,
        cd.document_type,
        cd.file_name,
        cd.file_size,
        cd.mime_type,
        cd.submitted_at,
        cd.verified_at,
        cd.verification_status,
        cd.verification_notes,
        p.full_name as verified_by_name
    FROM public.certificate_documents cd
    LEFT JOIN public.profiles p ON cd.verified_by = p.user_id
    WHERE cd.company_id = _company_id
    ORDER BY cd.created_at DESC;
END;
$$;
```

#### Certificate Submission API Routes
```javascript
// server/routes/certificateSubmission.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

    // Check if user has admin access to the company
    const { data: userCompanies, error: accessError } = await supabase
      .from('user_profiles')
      .select('company_id, is_company_admin')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (accessError || !userCompanies || !userCompanies.is_company_admin) {
      return res.status(403).json({ error: 'Unauthorized access to company or insufficient permissions' });
    }

    // Check if company is verified
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('status')
      .eq('id', companyId)
      .single();

    if (companyError || !companyData || companyData.status !== 'verified') {
      return res.status(403).json({ error: 'Company must be verified to submit certificates' });
    }

    req.user = user;
    req.companyId = companyId;
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
      .in('role', ['super_admin', 'internal_admin']);

    if (roleError || !userRoles || userRoles.length === 0) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit certificate document
router.post('/submit', requireCompanyAccess, upload.single('certificate'), async (req, res) => {
  const { companyId } = req;
  const { document_type } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
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
    const fileName = `${Date.now()}-${companyId}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`certificates/${companyId}/${fileName}`, file.buffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Call database function to submit certificate
    const { data: certificateResult, error: certError } = await supabase
      .rpc('submit_certificate_document', {
        _company_id: companyId,
        _user_id: req.user.id,
        _document_type: document_type,
        _file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/certificates/${companyId}/${fileName}`,
        _file_name: fileName,
        _file_size: file.size,
        _mime_type: file.mimetype
      });

    if (certError) throw certError;

    res.json({
      success: true,
      message: 'Certificate submitted successfully',
      certificate: certificateResult[0]
    });
  } catch (error) {
    console.error('Error submitting certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get certificates for a company
router.get('/:companyId/certificates', requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req;

    const { data: certificates, error } = await supabase
      .rpc('get_company_certificates', {
        _company_id: companyId,
        _user_id: req.user.id
      });

    if (error) throw error;

    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin route: Get all certificates for verification
router.get('/admin/pending-certificates', requireAdminAccess, async (req, res) => {
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
        verification_status,
        companies (company_name, email),
        profiles (full_name)
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
        mime_type: cert.mime_type,
        submitted_at: cert.submitted_at,
        verification_status: cert.verification_status,
        company_name: cert.companies?.company_name,
        company_email: cert.companies?.email,
        uploader_name: cert.profiles?.full_name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin route: Verify certificate
router.post('/admin/verify/:certificateId', requireAdminAccess, async (req, res) => {
  const { certificateId } = req.params;
  const { status, notes } = req.body;

  try {
    const { data: result, error } = await supabase
      .rpc('verify_certificate_document', {
        _certificate_id: certificateId,
        _verified_by: req.userId,
        _status: status,
        _notes: notes || null
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Certificate verification status updated',
      certificate: result[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete certificate (only allowed if pending verification)
router.delete('/:certificateId', requireCompanyAccess, async (req, res) => {
  const { certificateId } = req.params;

  try {
    // Get certificate details to check status
    const { data: certificate, error: fetchError } = await supabase
      .from('certificate_documents')
      .select('verification_status, file_name')
      .eq('id', certificateId)
      .single();

    if (fetchError) throw fetchError;

    // Only allow deletion if status is pending_verification
    if (certificate.verification_status !== 'pending_verification') {
      return res.status(403).json({ error: 'Certificate cannot be deleted after verification process started' });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('certificate_documents')
      .delete()
      .eq('id', certificateId);

    if (deleteError) throw deleteError;

    // Delete from storage
    const fileName = certificate.file_name;
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([`certificates/${req.companyId}/${fileName}`]);

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

module.exports = router;
```

### 2. Frontend Implementation

#### Certificate Submission Form Component
```tsx
// src/components/CertificateSubmissionForm.tsx
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CertificateSubmissionFormProps {
  companyId: string;
}

const CertificateSubmissionForm: React.FC<CertificateSubmissionFormProps> = ({ companyId }) => {
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const documentTypes = [
    { value: 'iso_certificate', label: 'ISO Certificate' },
    { value: 'quality_certificate', label: 'Quality Certificate' },
    { value: 'safety_certificate', label: 'Safety Certificate' },
    { value: 'compliance_certificate', label: 'Compliance Certificate' },
    { value: 'license_certificate', label: 'License Certificate' },
    { value: 'certificate_of_origin', label: 'Certificate of Origin' },
    { value: 'certificate_other', label: 'Other Certificate' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size exceeds 10MB limit');
        return;
      }

      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const submitCertificateMutation = useMutation({
    mutationFn: async () => {
      if (!documentType || !selectedFile) {
        throw new Error('Please select document type and file');
      }

      const formData = new FormData();
      formData.append('certificate', selectedFile);
      formData.append('document_type', documentType);

      const response = await fetch(`/api/certificates/submit`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit certificate');
      }

      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setDocumentType('');
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['company-certificates', companyId] });
      alert('Certificate submitted successfully!');
    },
    onError: (error) => {
      alert(`Error submitting certificate: ${error.message}`);
    }
  });

  const handleSubmit = () => {
    submitCertificateMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="document_type">Certificate Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Upload Certificate Document</Label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            <div className="mt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {fileName ? 'Change File' : 'Choose File'}
              </Button>
              
              {fileName && (
                <div className="text-sm text-gray-500">
                  {fileName} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
          
          {submitCertificateMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {submitCertificateMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleSubmit} 
            disabled={!documentType || !selectedFile || submitCertificateMutation.isPending}
            className="w-full"
          >
            {submitCertificateMutation.isPending ? 'Submitting...' : 'Submit Certificate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateSubmissionForm;
```

#### Certificate Management Page
```tsx
// src/pages/CertificateManagementPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

const CertificateManagementPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch user's companies
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['user-companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch companies');
      const result = await response.json();
      return result.companies;
    }
  });

  // Fetch certificates for selected company
  const { data: certificates, isLoading: certsLoading } = useQuery({
    queryKey: ['company-certificates', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const response = await fetch(`/api/certificates/${selectedCompanyId}/certificates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch certificates');
      const result = await response.json();
      return result.certificates;
    },
    enabled: !!selectedCompanyId
  });

  // Mutation to delete certificate
  const deleteCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete certificate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-certificates', selectedCompanyId] });
      alert('Certificate deleted successfully');
    },
    onError: (error) => {
      alert(`Error deleting certificate: ${error.message}`);
    }
  });

  const handleDeleteCertificate = (certificateId: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      deleteCertificateMutation.mutate(certificateId);
    }
  };

  const handleViewCertificate = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  if (companiesLoading) {
    return <div className="container mx-auto py-10">Loading companies...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Certificate Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companies?.map(company => (
                <div 
                  key={company.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedCompanyId === company.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="font-medium">{company.company_name}</div>
                  <div className="text-sm text-gray-500">{company.email}</div>
                  <Badge variant={
                    company.status === 'verified' ? 'default' :
                    company.status === 'pending_verification' ? 'secondary' :
                    company.status === 'needs_correction' ? 'warning' : 'destructive'
                  }>
                    {company.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Certificate Submission Form */}
        <div className="lg:col-span-2">
          {selectedCompanyId ? (
            <>
              <CertificateSubmissionForm companyId={selectedCompanyId} />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Certificate List</CardTitle>
                </CardHeader>
                <CardContent>
                  {certsLoading ? (
                    <div>Loading certificates...</div>
                  ) : certificates && certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.map(certificate => (
                        <div key={certificate.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                              <div className="font-medium">{certificate.file_name}</div>
                              <div className="text-sm text-gray-500 capitalize">
                                {certificate.document_type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-400">
                                Submitted: {new Date(certificate.submitted_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                certificate.verification_status === 'verified' ? 'default' :
                                certificate.verification_status === 'pending_verification' ? 'secondary' :
                                certificate.verification_status === 'rejected' ? 'destructive' :
                                'warning'
                              }
                            >
                              {certificate.verification_status.replace('_', ' ')}
                            </Badge>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewCertificate(certificate.file_path)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {certificate.verification_status === 'pending_verification' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteCertificate(certificate.id)}
                                disabled={deleteCertificateMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No certificates submitted yet.</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p>Please select a company to manage certificates</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateManagementPage;
```

#### Admin Certificate Verification Page
```tsx
// src/pages/AdminCertificateVerificationPage.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminCertificateVerificationPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch pending certificates
  const { data: pendingCertificates, isLoading } = useQuery({
    queryKey: ['pending-certificates'],
    queryFn: async () => {
      const response = await fetch('/api/certificates/admin/pending-certificates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch pending certificates');
      const result = await response.json();
      return result.certificates;
    }
  });

  // Mutation to verify certificate
  const verifyCertificateMutation = useMutation({
    mutationFn: async ({ certificateId, status, notes }: { certificateId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/certificates/admin/verify/${certificateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, notes })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify certificate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-certificates'] });
      alert('Certificate verification updated successfully');
    },
    onError: (error) => {
      alert(`Error verifying certificate: ${error.message}`);
    }
  });

  const handleVerify = (certificateId: string) => {
    verifyCertificateMutation.mutate({ certificateId, status: 'verified' });
  };

  const handleReject = (certificateId: string, notes: string) => {
    verifyCertificateMutation.mutate({ certificateId, status: 'rejected', notes });
  };

  const handleRequestCorrection = (certificateId: string, notes: string) => {
    verifyCertificateMutation.mutate({ certificateId, status: 'needs_correction', notes });
  };

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading pending certificates...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Certificate Verification</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Certificates for Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCertificates && pendingCertificates.length > 0 ? (
            <div className="space-y-4">
              {pendingCertificates.map(certificate => (
                <div key={certificate.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{certificate.file_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {certificate.document_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Company: {certificate.company_name} ({certificate.company_email})
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(certificate.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCertificate(certificate.file_path)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleVerify(certificate.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const notes = prompt('Enter rejection notes:');
                          if (notes) handleReject(certificate.id, notes);
                        }}
                        className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const notes = prompt('Enter correction notes:');
                          if (notes) handleRequestCorrection(certificate.id, notes);
                        }}
                        className="flex items-center gap-1 text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Correct
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending certificates for verification.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCertificateVerificationPage;
```

### 3. Integration Points

#### Update Main App Router
```javascript
// server/app.js (add to existing routes)
const certificateRoutes = require('./routes/certificateSubmission');

app.use('/api/certificates', certificateRoutes);
```

#### Update Navigation
```tsx
// src/components/AppLayout.tsx (add to navigation)
{
  userRole === 'pelaku_usaha' && (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to="/certificates">
          <FileText className="mr-2 h-4 w-4" />
          <span>Certificates</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

{
  (userRole === 'super_admin' || userRole === 'internal_admin') && (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to="/admin/certificates">
          <FileText className="mr-2 h-4 w-4" />
          <span>Verify Certificates</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
```

This implementation provides a complete certificate document submission system that allows verified companies to submit certificates for verification by internal administrators, with appropriate access controls and workflow management.