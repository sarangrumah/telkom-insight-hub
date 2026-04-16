# Company Management System with Completion Workflow

## Overview
This document outlines the implementation of a company management system that allows users to complete their company information after initial registration and verification.

## Current System Capabilities
The existing system already has:
- Companies table with fields for storing company information
- User profiles linked to companies
- Company document management
- Person in charge (PIC) management
- Verification status tracking

## Implementation Plan

### 1. Backend Implementation

#### Company Completion RPC Function
```sql
-- Enhanced function to complete company information
CREATE OR REPLACE FUNCTION public.complete_company_info(
  _company_id UUID,
  _user_id UUID,
  _company_address TEXT,
  _business_field TEXT,
  _company_type TEXT,
  _akta_number TEXT,
  _kecamatan TEXT,
  _kelurahan TEXT,
  _postal_code TEXT,
  _province_id UUID,
  _kabupaten_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  company_id UUID,
  updated_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_status TEXT;
  _result RECORD;
BEGIN
  -- Check if user has access to this company
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = _user_id AND company_id = _company_id
  ) THEN
    RAISE EXCEPTION 'User does not have access to this company';
  END IF;

  -- Get current company status
  SELECT status INTO _current_status
  FROM public.companies
  WHERE id = _company_id;

  -- Only allow completion if company is verified or needs correction
  IF _current_status NOT IN ('verified', 'needs_correction', 'pending_verification') THEN
    RAISE EXCEPTION 'Company must be verified or pending verification to complete information';
  END IF;

  -- Update company information
  UPDATE public.companies
  SET 
    company_address = COALESCE(_company_address, company_address),
    business_field = COALESCE(_business_field, business_field),
    company_type = COALESCE(_company_type, company_type),
    akta_number = COALESCE(_akta_number, akta_number),
    kecamatan = COALESCE(_kecamatan, kecamatan),
    kelurahan = COALESCE(_kelurahan, kelurahan),
    postal_code = COALESCE(_postal_code, postal_code),
    province_id = COALESCE(_province_id, province_id),
    kabupaten_id = COALESCE(_kabupaten_id, kabupaten_id),
    updated_at = now()
  WHERE id = _company_id;

  -- If company was pending verification and now has complete info, set to verified
  IF _current_status = 'pending_verification' THEN
    -- Check if all required info is complete
    SELECT * INTO _result
    FROM public.validate_company_documents(_company_id);
    
    IF _result.is_complete = false AND array_length(_result.missing_documents, 1) = 0 THEN
      UPDATE public.companies
      SET 
        status = 'verified',
        updated_at = now()
      WHERE id = _company_id;
      
      -- Update user profile to validated
      UPDATE public.profiles
      SET 
        is_validated = true,
        updated_at = now()
      WHERE user_id IN (
        SELECT user_id 
        FROM public.user_profiles 
        WHERE company_id = _company_id
      );
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    true as success,
    'Company information completed successfully' as message,
    _company_id as company_id,
    (SELECT status FROM public.companies WHERE id = _company_id) as updated_status;
END;
$$;

-- Function to validate if company information is complete
CREATE OR REPLACE FUNCTION public.validate_company_completion(
  _company_id UUID
)
RETURNS TABLE(
  is_complete BOOLEAN,
  missing_fields TEXT[],
  has_required_documents BOOLEAN,
  missing_documents TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_record RECORD;
  _missing_fields TEXT[];
  _missing_docs TEXT[];
  _has_required_docs BOOLEAN;
BEGIN
  SELECT * INTO _company_record
  FROM public.companies
  WHERE id = _company_id;

  -- Check for missing required fields
  _missing_fields := ARRAY[]::TEXT[];
  
  IF _company_record.company_address IS NULL OR _company_record.company_address = '' THEN
    _missing_fields := _missing_fields || 'company_address';
  END IF;
  
  IF _company_record.business_field IS NULL OR _company_record.business_field = '' THEN
    _missing_fields := _missing_fields || 'business_field';
  END IF;
  
  IF _company_record.company_type IS NULL OR _company_record.company_type = '' THEN
    _missing_fields := _missing_fields || 'company_type';
  END IF;
  
  IF _company_record.province_id IS NULL THEN
    _missing_fields := _missing_fields || 'province_id';
  END IF;
  
  IF _company_record.kabupaten_id IS NULL THEN
    _missing_fields := _missing_fields || 'kabupaten_id';
  END IF;

  -- Check required documents
  SELECT 
    NOT (required_docs @> uploaded_docs) AS has_docs,
    ARRAY(SELECT UNNEST(required_docs) EXCEPT SELECT UNNEST(uploaded_docs || ARRAY[]::TEXT[])) AS missing_docs
  INTO _has_required_docs, _missing_docs
  FROM (
    SELECT 
      ARRAY['nib', 'npwp', 'akta'] AS required_docs,
      COALESCE(ARRAY_AGG(cd.document_type), ARRAY[]::TEXT[]) AS uploaded_docs
    FROM public.company_documents cd
    WHERE cd.company_id = _company_id
  ) docs;

  RETURN QUERY
  SELECT
    (array_length(_missing_fields, 1) IS NULL) AS is_complete,
    _missing_fields,
    _has_required_docs,
    COALESCE(_missing_docs, ARRAY[]::TEXT[]) AS missing_documents;
END;
$$;
```

#### Company Management API Routes
```javascript
// server/routes/companyManagement.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', companyId);

    if (accessError || !userCompanies || userCompanies.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    req.user = user;
    req.companyId = companyId;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get company information
router.get('/:companyId', requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req;

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        province:name,
        kabupaten:name,
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
          position,
          phone_number
        )
      `)
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Validate company completion
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_company_completion', { _company_id: companyId });

    if (validationError) throw validationError;

    res.json({
      success: true,
      company: companyData,
      validation: validationData[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete company information
router.put('/:companyId/complete-info', requireCompanyAccess, async (req, res) => {
  const { companyId } = req;
  const {
    company_address,
    business_field,
    company_type,
    akta_number,
    kecamatan,
    kelurahan,
    postal_code,
    province_id,
    kabupaten_id
  } = req.body;

  try {
    const { data, error } = await supabase
      .rpc('complete_company_info', {
        _company_id: companyId,
        _user_id: req.user.id,
        _company_address: company_address,
        _business_field: business_field,
        _company_type: company_type,
        _akta_number: akta_number,
        _kecamatan: kecamatan,
        _kelurahan: kelurahan,
        _postal_code: postal_code,
        _province_id: province_id,
        _kabupaten_id: kabupaten_id
      });

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companies for current user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Get companies associated with user
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        company_id,
        companies (
          id,
          company_name,
          email,
          phone,
          company_address,
          business_field,
          company_type,
          status,
          created_at,
          updated_at,
          verified_at,
          nib_number,
          npwp_number
        )
      `)
      .eq('user_id', user.id);

    if (profileError) throw profileError;

    // Extract company data
    const companies = userProfiles.map(up => up.companies).filter(Boolean);

    // Get validation status for each company
    const companiesWithValidation = await Promise.all(companies.map(async (company) => {
      const { data: validationData } = await supabase
        .rpc('validate_company_completion', { _company_id: company.id });
      
      return {
        ...company,
        validation: validationData?.[0] || null
      };
    }));

    res.json({
      success: true,
      companies: companiesWithValidation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companies for admin management
router.get('/admin/list', requireRole(['internal_admin', 'super_admin']), async (req, res) => {
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
        nib_number,
        npwp_number,
        verification_notes,
        verified_by,
        person_in_charge (full_name),
        company_documents (count)
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

// Admin approve company
router.post('/:companyId/approve', requireRole(['internal_admin', 'super_admin']), async (req, res) => {
  const { companyId } = req;
  const { notes } = req.body;

  try {
    const { data, error } = await supabase
      .rpc('approve_company', {
        _company_id: companyId,
        _verified_by: req.userId,
        _notes: notes || null
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company approved successfully',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reject company
router.post('/:companyId/reject', requireRole(['internal_admin', 'super_admin']), async (req, res) => {
  const { companyId } = req;
  const { rejection_notes } = req.body;

  try {
    const { data, error } = await supabase
      .rpc('reject_company', {
        _company_id: companyId,
        _rejected_by: req.userId,
        _rejection_notes: rejection_notes
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company rejected',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Company Document Management
```javascript
// server/routes/companyDocuments.js
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

// Upload company document
router.post('/upload', requireCompanyAccess, upload.single('document'), async (req, res) => {
  const { companyId } = req;
  const { document_type } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    // Validate document type
    const validTypes = ['nib', 'npwp', 'akta', 'ktp', 'assignment_letter'];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    // Upload to Supabase storage
    const fileName = `${Date.now()}-${companyId}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`companies/${companyId}/${fileName}`, file.buffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Save document reference to database
    const { data: documentRecord, error: docError } = await supabase
      .from('company_documents')
      .insert([{
        company_id: companyId,
        document_type,
        file_path: `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/companies/${companyId}/${fileName}`,
        file_name: fileName,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id
      }])
      .select()
      .single();

    if (docError) throw docError;

    // Check if company needs to be validated after document upload
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_company_documents', { _company_id: companyId });

    if (validationError) throw validationError;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentRecord,
      validation: validationData[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company documents
router.get('/:companyId/documents', requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req;

    const { data: documents, error } = await supabase
      .from('company_documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Frontend Implementation

#### Company Management Page
```tsx
// src/pages/CompanyManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Upload, FileText, Eye, Trash2 } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  company_address?: string;
  business_field?: string;
  company_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  nib_number?: string;
  npwp_number?: string;
  validation?: {
    is_complete: boolean;
    missing_fields: string[];
    has_required_documents: boolean;
    missing_documents: string[];
  };
}

const CompanyManagementPage: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    company_address: '',
    business_field: '',
    company_type: '',
    akta_number: '',
    kecamatan: '',
    kelurahan: '',
    postal_code: '',
    province_id: '',
    kabupaten_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies, isLoading, error } = useQuery<Company[]>({
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

  // Fetch provinces
  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await fetch('/api/regions/provinces');
      if (!response.ok) throw new Error('Failed to fetch provinces');
      return response.json();
    }
  });

  // Fetch kabupaten by province
  const { data: kabupatens } = useQuery({
    queryKey: ['kabupatens', formData.province_id],
    queryFn: async () => {
      if (!formData.province_id) return [];
      const response = await fetch(`/api/regions/kabupatens/${formData.province_id}`);
      if (!response.ok) throw new Error('Failed to fetch kabupatens');
      return response.json();
    },
    enabled: !!formData.province_id
  });

  // Mutation for updating company info
  const updateCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const response = await fetch(`/api/companies/${selectedCompany?.id}/complete-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(companyData)
      });
      
      if (!response.ok) throw new Error('Failed to update company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      setEditMode(false);
      alert('Company information updated successfully!');
    }
  });

  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        company_address: selectedCompany.company_address || '',
        business_field: selectedCompany.business_field || '',
        company_type: selectedCompany.company_type || '',
        akta_number: selectedCompany.akta_number || '',
        kecamatan: selectedCompany.kecamatan || '',
        kelurahan: selectedCompany.kelurahan || '',
        postal_code: selectedCompany.postal_code || '',
        province_id: selectedCompany.province_id || '',
        kabupaten_id: selectedCompany.kabupaten_id || ''
      });
    }
  }, [selectedCompany]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCompany = () => {
    if (selectedCompany) {
      updateCompanyMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-6">Loading companies...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Company Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies?.map(company => (
                <div 
                  key={company.id} 
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedCompany?.id === company.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{company.company_name}</h3>
                      <p className="text-sm text-gray-600">{company.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          company.status === 'verified' ? 'default' :
                          company.status === 'pending_verification' ? 'secondary' :
                          company.status === 'needs_correction' ? 'warning' : 'destructive'
                        }>
                          {company.status.replace('_', ' ')}
                        </Badge>
                        
                        {company.validation?.is_complete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                      {company.verified_at && (
                        <p className="text-sm text-green-600">
                          Verified: {new Date(company.verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {company.validation && !company.validation.is_complete && (
                    <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                      <AlertDescription className="text-sm">
                        Missing fields: {company.validation.missing_fields.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Company Details */}
        {selectedCompany && (
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{selectedCompany.company_name}</h2>
                  <Badge variant={
                    selectedCompany.status === 'verified' ? 'default' :
                    selectedCompany.status === 'pending_verification' ? 'secondary' :
                    selectedCompany.status === 'needs_correction' ? 'warning' : 'destructive'
                  }>
                    {selectedCompany.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company_address">Company Address</Label>
                      <Input
                        id="company_address"
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="business_field">Business Field</Label>
                      <Input
                        id="business_field"
                        name="business_field"
                        value={formData.business_field}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company_type">Company Type</Label>
                      <Select
                        value={formData.company_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, company_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
                          <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
                          <SelectItem value="ud">UD (Usaha Dagang)</SelectItem>
                          <SelectItem value="koperasi">Koperasi</SelectItem>
                          <SelectItem value="yayasan">Yayasan</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="akta_number">Akta Number</Label>
                      <Input
                        id="akta_number"
                        name="akta_number"
                        value={formData.akta_number}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="province_id">Province</Label>
                        <Select
                          value={formData.province_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, province_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces?.map(prov => (
                              <SelectItem key={prov.id} value={prov.id}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="kabupaten_id">Kabupaten/Kota</Label>
                        <Select
                          value={formData.kabupaten_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, kabupaten_id: value }))}
                          disabled={!formData.province_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.province_id ? "Select kabupaten" : "Select province first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {kabupatens?.map(kab => (
                              <SelectItem key={kab.id} value={kab.id}>
                                {kab.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kecamatan">Kecamatan</Label>
                        <Input
                          id="kecamatan"
                          name="kecamatan"
                          value={formData.kecamatan}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="kelurahan">Kelurahan</Label>
                        <Input
                          id="kelurahan"
                          name="kelurahan"
                          value={formData.kelurahan}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUpdateCompany} 
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? 'Updating...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{selectedCompany.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{selectedCompany.phone}</p>
                      </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Company Address</p>
                      <p>{selectedCompany.company_address || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Business Field</p>
                      <p>{selectedCompany.business_field || 'Not provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Company Type</p>
                        <p>{selectedCompany.company_type || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Akta Number</p>
                        <p>{selectedCompany.akta_number || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>
                        {selectedCompany.kecamatan}, {selectedCompany.kelurahan}, 
                        {selectedCompany.kabupaten_id ? ` Kab. ${selectedCompany.kabupaten_id}` : ''}, 
                        {selectedCompany.province_id ? ` Prov. ${selectedCompany.province_id}` : ''}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Postal Code</p>
                      <p>{selectedCompany.postal_code || 'Not provided'}</p>
                    </div>
                    
                    <Button 
                      onClick={() => setEditMode(true)}
                      className="w-full"
                    >
                      Edit Information
                    </Button>
                  </div>
                )}
                
                {selectedCompany.validation && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h4 className="font-semibold mb-2">Validation Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedCompany.validation.is_complete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>Information Complete: {selectedCompany.validation.is_complete ? 'Yes' : 'No'}</span>
                      </div>
                      
                      {selectedCompany.validation.missing_fields.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Missing Fields:</p>
                          <ul className="list-disc pl-5 text-sm">
                            {selectedCompany.validation.missing_fields.map(field => (
                              <li key={field}>{field}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {selectedCompany.validation.has_required_documents ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>Required Documents Uploaded: {selectedCompany.validation.has_required_documents ? 'Yes' : 'No'}</span>
                      </div>
                      
                      {selectedCompany.validation.missing_documents.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Missing Documents:</p>
                          <ul className="list-disc pl-5 text-sm">
                            {selectedCompany.validation.missing_documents.map(doc => (
                              <li key={doc}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyManagementPage;
```

#### Company Document Upload Component
```tsx
// src/components/CompanyDocumentUpload.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Eye, Trash2 } from 'lucide-react';

interface CompanyDocumentUploadProps {
  companyId: string;
}

interface DocumentType {
  value: string;
  label: string;
  required: boolean;
}

const CompanyDocumentUpload: React.FC<CompanyDocumentUploadProps> = ({ companyId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes: DocumentType[] = [
    { value: 'nib', label: 'NIB (Nomor Induk Berusaha)', required: true },
    { value: 'npwp', label: 'NPWP (Tax ID)', required: true },
    { value: 'akta', label: 'Company Deed (Akta Pendirian)', required: true },
    { value: 'ktp', label: 'KTP of Person in Charge', required: false },
    { value: 'assignment_letter', label: 'Assignment Letter', required: false }
  ];

  // Fetch existing documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, [companyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setUploadError('File size exceeds 10MB limit');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setUploadError('Please select both a file and document type');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('document_type', documentType);

      const response = await fetch(`/api/companies/${companyId}/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadSuccess(true);
      setSelectedFile(null);
      setDocumentType('');
      
      // Refresh documents list
      fetchDocuments();
      
      // Reset success message after delay
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/companies/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh documents list
        fetchDocuments();
      } else {
        throw new Error('Failed to remove document');
      }
    } catch (error) {
      setUploadError(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Upload New Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.required ? '(Required)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Select File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? 'Change File' : 'Choose File'}
                  </Button>
                  
                  {selectedFile && (
                    <div className="text-sm text-gray-500">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
              
              {isUploading && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              {uploadSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>Document uploaded successfully!</AlertDescription>
                </Alert>
              )}
              
              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !documentType || isUploading}
                className="w-full"
              >
                Upload Document
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Uploaded Documents</h3>
            
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{doc.document_type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyDocumentUpload;
```

#### Company Completion Wizard Component
```tsx
// src/components/CompanyCompletionWizard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react';

interface CompanyCompletionWizardProps {
  companyId: string;
  onComplete: () => void;
}

const CompanyCompletionWizard: React.FC<CompanyCompletionWizardProps> = ({ 
  companyId, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_address: '',
    business_field: '',
    company_type: 'pt',
    akta_number: '',
    province_id: '',
    kabupaten_id: '',
    kecamatan: '',
    kelurahan: '',
    postal_code: ''
  });
  const [documents, setDocuments] = useState({
    nib: null as File | null,
    npwp: null as File | null,
    akta: null as File | null,
    ktp: null as File | null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Enter company details' },
    { id: 2, title: 'Location', description: 'Enter company location' },
    { id: 3, title: 'Documents', description: 'Upload required documents' },
    { id: 4, title: 'Review', description: 'Review and submit' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (type: string, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create form data with company info
      const companyData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        companyData.append(key, value);
      });

      // Add documents to form data
      Object.entries(documents).forEach(([type, file]) => {
        if (file) {
          companyData.append(`${type}_document`, file);
        }
      });

      // Add company ID
      companyData.append('companyId', companyId);

      const response = await fetch(`/api/companies/${companyId}/complete-info`, {
        method: 'PUT',
        body: companyData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete company information');
      }

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {steps.map(step => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {step.id < steps.length && (
                  <div className={`w-16 h-1 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            {steps.map(step => (
              <div key={step.id} className="text-center">
                <div className={`text-sm ${currentStep === step.id ? 'font-semibold text-blue-500' : ''}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Progress value={(currentStep / steps.length) * 100} className="mb-6" />
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_address">Company Address</Label>
              <Input
                id="company_address"
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                placeholder="Enter company address"
              />
            </div>
            
            <div>
              <Label htmlFor="business_field">Business Field</Label>
              <Input
                id="business_field"
                name="business_field"
                value={formData.business_field}
                onChange={handleInputChange}
                placeholder="Enter business field"
              />
            </div>
            
            <div>
              <Label htmlFor="company_type">Company Type</Label>
              <Select
                value={formData.company_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
                  <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
                  <SelectItem value="ud">UD (Usaha Dagang)</SelectItem>
                  <SelectItem value="koperasi">Koperasi</SelectItem>
                  <SelectItem value="yayasan">Yayasan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="akta_number">Akta Number</Label>
              <Input
                id="akta_number"
                name="akta_number"
                value={formData.akta_number}
                onChange={handleInputChange}
                placeholder="Enter akta number"
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="province_id">Province</Label>
              <select
                id="province_id"
                name="province_id"
                value={formData.province_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Province</option>
                {/* Options would be populated from API */}
              </select>
            </div>
            
            <div>
              <Label htmlFor="kabupaten_id">Kabupaten/Kota</Label>
              <select
                id="kabupaten_id"
                name="kabupaten_id"
                value={formData.kabupaten_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={!formData.province_id}
              >
                <option value="">Select Kabupaten/Kota</option>
                {/* Options would be populated based on selected province */}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kecamatan">Kecamatan</Label>
                <Input
                  id="kecamatan"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleInputChange}
                  placeholder="Enter kecamatan"
                />
              </div>
              
              <div>
                <Label htmlFor="kelurahan">Kelurahan</Label>
                <Input
                  id="kelurahan"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleInputChange}
                  placeholder="Enter kelurahan"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        )}
        
        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <DocumentUploadSection 
              label="NIB (Nomor Induk Berusaha)" 
              required={true}
              onFileSelect={(file) => handleDocumentChange('nib', file)}
            />
            
            <DocumentUploadSection 
              label="NPWP (Tax ID)" 
              required={true}
              onFileSelect={(file) => handleDocumentChange('npwp', file)}
            />
            
            <DocumentUploadSection 
              label="Company Deed (Akta Pendirian)" 
              required={true}
              onFileSelect={(file) => handleDocumentChange('akta', file)}
            />
            
            <DocumentUploadSection 
              label="KTP of Person in Charge" 
              required={false}
              onFileSelect={(file) => handleDocumentChange('ktp', file)}
            />
          </div>
        )}
        
        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Information</h3>
            
            <div className="border rounded p-4 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Company Address:</span>
                <p>{formData.company_address}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Business Field:</span>
                <p>{formData.business_field}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Company Type:</span>
                <p>{formData.company_type}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Location:</span>
                <p>{formData.kecamatan}, {formData.kelurahan}, {formData.kabupaten_id}, {formData.province_id}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Documents:</span>
                <ul className="list-disc pl-5 mt-1">
                  {documents.nib && <li>NIB: {documents.nib.name}</li>}
                  {documents.npwp && <li>NPWP: {documents.npwp.name}</li>}
                  {documents.akta && <li>Akta: {documents.akta.name}</li>}
                  {documents.ktp && <li>KTP: {documents.ktp.name}</li>}
                </ul>
              </div>
            </div>
            
            <Alert>
              <AlertDescription>
                Please ensure all information is correct before submitting. You will not be able to make changes after submission.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Company Information'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Document Upload Section Component
const DocumentUploadSection: React.FC<{
  label: string;
  required: boolean;
  onFileSelect: (file: File) => void;
}> = ({ label, required, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size exceeds 10MB limit');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <Label className="flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {selectedFile ? (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Selected
          </span>
        ) : (
          <span className="text-sm text-gray-500">Required</span>
        )}
      </div>
      
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {selectedFile ? 'Change File' : 'Choose File'}
      </Button>
      
      {selectedFile && (
        <div className="mt-2 p-2 bg-gray-50 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{selectedFile.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      )}
    </div>
  );
};

export default CompanyCompletionWizard;
```

### 3. Integration with Existing System

The company management system integrates with the existing architecture by:
1. Using the existing `companies` table to store company information
2. Leveraging the existing `user_profiles` table to link users to companies
3. Building on the existing verification workflow with status tracking
4. Using the same role-based access control system
5. Following the same document storage patterns in Supabase storage
6. Utilizing the existing notification system through tickets

This implementation provides a complete company management system with validation and completion workflow that fits seamlessly into the existing architecture.