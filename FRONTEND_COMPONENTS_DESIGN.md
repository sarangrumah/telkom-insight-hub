# Frontend Components Design for Registration and Verification Workflow

## Overview
This document outlines the React frontend components needed to implement the registration process with document upload and verification workflow.

## Component Structure

### 1. Registration Page Components

#### RegistrationForm Component
```tsx
// src/components/RegistrationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegistrationFormProps {
  onComplete: (userId: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete }) => {
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form schemas would be defined using zod
  // Step 1: Basic Information
  const basicInfoSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    company_name: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required')
  });

  // Step 2: Company Details
  const companyDetailsSchema = z.object({
    address: z.string().min(1, 'Address is required'),
    province_id: z.string().min(1, 'Province is required'),
    kabupaten_id: z.string().min(1, 'Kabupaten is required'),
    kecamatan: z.string().min(1, 'Kecamatan is required'),
    kelurahan: z.string().min(1, 'Kelurahan is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    business_field: z.string().min(1, 'Business field is required')
  });

  // Step 3: Document Upload
  const documentUploadSchema = z.object({
    nib_document: z.instanceof(File),
    npwp_document: z.instanceof(File),
    akta_document: z.instanceof(File),
    ktp_document: z.instanceof(File)
  });

  // Step 4: Person in Charge
  const picSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    id_number: z.string().min(16, 'ID number must be 16 digits'),
    phone_number: z.string().min(10, 'Phone number is required'),
    position: z.string().min(1, 'Position is required'),
    address: z.string().min(1, 'Address is required')
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(
      currentStep === 1 ? basicInfoSchema :
      currentStep === 2 ? companyDetailsSchema :
      currentStep === 3 ? documentUploadSchema :
      picSchema
    )
  });

  // Handle form submission for each step
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      if (currentStep < 4) {
        // Move to next step
        setCurrentStep(prev => prev + 1);
      } else {
        // Final submission with all collected data
        const formData = new FormData();
        
        // Add basic info
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });
        
        // Submit to API
        const response = await fetch('/api/auth/register-with-documents', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          onComplete(result.user_id);
        } else {
          throw new Error('Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Registration Process</CardTitle>
          <Progress value={(currentStep / 4) * 100} className="w-full" />
          <p className="text-sm text-gray-500">
            Step {currentStep} of 4
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...register('email')} />
                  {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input type="password" id="password" {...register('password')} />
                  {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register('full_name')} />
                  {errors.full_name && <span className="text-red-500">{errors.full_name.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                  {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input id="company_name" {...register('company_name')} />
                  {errors.company_name && <span className="text-red-500">{errors.company_name.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="position">Position in Company</Label>
                  <Input id="position" {...register('position')} />
                  {errors.position && <span className="text-red-500">{errors.position.message}</span>}
                </div>
              </div>
            )}
            
            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Company Address</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && <span className="text-red-500">{errors.address.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="province_id">Province</Label>
                  <select id="province_id" {...register('province_id')}>
                    <option value="">Select Province</option>
                    {/* Options populated from API */}
                  </select>
                  {errors.province_id && <span className="text-red-500">{errors.province_id.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="kabupaten_id">Kabupaten/Kota</Label>
                  <select id="kabupaten_id" {...register('kabupaten_id')}>
                    <option value="">Select Kabupaten/Kota</option>
                    {/* Options populated based on selected province */}
                  </select>
                  {errors.kabupaten_id && <span className="text-red-500">{errors.kabupaten_id.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="kecamatan">Kecamatan</Label>
                  <Input id="kecamatan" {...register('kecamatan')} />
                  {errors.kecamatan && <span className="text-red-500">{errors.kecamatan.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="kelurahan">Kelurahan</Label>
                  <Input id="kelurahan" {...register('kelurahan')} />
                  {errors.kelurahan && <span className="text-red-500">{errors.kelurahan.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" {...register('postal_code')} />
                  {errors.postal_code && <span className="text-red-500">{errors.postal_code.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="business_field">Business Field</Label>
                  <Input id="business_field" {...register('business_field')} />
                  {errors.business_field && <span className="text-red-500">{errors.business_field.message}</span>}
                </div>
              </div>
            )}
            
            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <DocumentUploadSection
                  label="NIB (Nomor Induk Berusaha)"
                  documentType="nib"
                  register={register}
                  error={errors.nib_document}
                  onUploadProgress={setUploadProgress}
                />
                
                <DocumentUploadSection
                  label="NPWP (Tax ID)"
                  documentType="npwp"
                  register={register}
                  error={errors.npwp_document}
                  onUploadProgress={setUploadProgress}
                />
                
                <DocumentUploadSection
                  label="Company Deed (Akta Pendirian)"
                  documentType="akta"
                  register={register}
                  error={errors.akta_document}
                  onUploadProgress={setUploadProgress}
                />
                
                <DocumentUploadSection
                  label="Identity Card (KTP PIC)"
                  documentType="ktp"
                  register={register}
                  error={errors.ktp_document}
                  onUploadProgress={setUploadProgress}
                />
                
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            )}
            
            {/* Step 4: Person in Charge */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pic_full_name">Full Name</Label>
                  <Input id="pic_full_name" {...register('full_name')} />
                  {errors.full_name && <span className="text-red-500">{errors.full_name.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="id_number">ID Number (KTP)</Label>
                  <Input id="id_number" {...register('id_number')} />
                  {errors.id_number && <span className="text-red-500">{errors.id_number.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="pic_phone_number">Phone Number</Label>
                  <Input id="pic_phone_number" {...register('phone_number')} />
                  {errors.phone_number && <span className="text-red-500">{errors.phone_number.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="pic_position">Position</Label>
                  <Input id="pic_position" {...register('position')} />
                  {errors.position && <span className="text-red-500">{errors.position.message}</span>}
                </div>
                
                <div>
                  <Label htmlFor="pic_address">Address</Label>
                  <Input id="pic_address" {...register('address')} />
                  {errors.address && <span className="text-red-500">{errors.address.message}</span>}
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : currentStep === 4 ? 'Submit Registration' : 'Next'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
```

#### DocumentUploadSection Component
```tsx
// src/components/DocumentUploadSection.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';

interface DocumentUploadSectionProps {
  label: string;
  documentType: string;
  register: any;
  error?: any;
  onUploadProgress: (progress: number) => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  label,
  documentType,
  register,
  error,
  onUploadProgress
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size exceeds 10MB limit');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    // Upload to temporary storage
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const response = await fetch('/api/documents/upload-temp', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Set the file path in the form
        register(documentType).onChange({ target: { value: result.file_path } });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="border rounded-lg p-4">
      <Label>{label}</Label>
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
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {fileName ? 'Change File' : 'Choose File'}
        </Button>
        
        {fileName && (
          <div className="text-sm text-gray-500">
            {fileName} ({formatFileSize(fileSize)})
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
      
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};
```

### 2. Verification Status Components

#### VerificationStatus Component
```tsx
// src/components/VerificationStatus.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface VerificationStatusProps {
  userId: string;
}

interface VerificationData {
  status: 'pending_verification' | 'verified' | 'rejected' | 'needs_correction';
  company: {
    id: string;
    company_name: string;
    nib_number?: string;
    npwp_number?: string;
    status: string;
    correction_notes?: any;
    correction_status?: string;
  };
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    is_validated: boolean;
  };
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string;
    uploaded_at: string;
  }>;
  notification_message: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ userId }) => {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/auth/verification-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerificationData(data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'needs_correction':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'default';
      case 'verified':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'needs_correction':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!verificationData) {
    return (
      <Alert>
        <AlertDescription>No verification data found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getStatusIcon(verificationData.status)}
            <CardTitle>Verification Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Company Information</h3>
              <div className="space-y-2">
                <p><strong>Company Name:</strong> {verificationData.company.company_name}</p>
                <p><strong>NIB Number:</strong> {verificationData.company.nib_number || 'Not provided'}</p>
                <p><strong>NPWP Number:</strong> {verificationData.company.npwp_number || 'Not provided'}</p>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <Badge variant={getStatusBadgeVariant(verificationData.status)}>
                    {verificationData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">User Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {verificationData.user.full_name}</p>
                <p><strong>Email:</strong> {verificationData.user.email}</p>
                <p><strong>Phone:</strong> {verificationData.user.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Submitted Documents</h3>
            <ul className="list-disc pl-5 space-y-1">
              {verificationData.documents.map(doc => (
                <li key={doc.id}>
                  {doc.document_type.toUpperCase()}: {doc.file_name}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6">
            <Alert>
              <AlertDescription>{verificationData.notification_message}</AlertDescription>
            </Alert>
          </div>
          
          {verificationData.status === 'needs_correction' && verificationData.company.correction_notes && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Correction Notes</h4>
              <pre className="bg-gray-100 p-3 rounded-md text-sm">
                {JSON.stringify(verificationData.company.correction_notes, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 3. Data Completion Components

#### CompanyCompletionForm Component
```tsx
// src/components/CompanyCompletionForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompanyCompletionFormProps {
  companyId: string;
}

const CompanyCompletionForm: React.FC<CompanyCompletionFormProps> = ({ companyId }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyCompletionSchema = z.object({
    company_address: z.string().min(1, 'Company address is required'),
    business_field: z.string().min(1, 'Business field is required'),
    company_type: z.enum(['pt', 'cv', 'ud', 'koperasi', 'yayasan', 'other']),
    akta_number: z.string().min(1, 'Akta number is required'),
    kecamatan: z.string().min(1, 'Kecamatan is required'),
    kelurahan: z.string().min(1, 'Kelurahan is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    province_id: z.string().min(1, 'Province is required'),
    kabupaten_id: z.string().min(1, 'Kabupaten is required')
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(companyCompletionSchema)
  });

  useEffect(() => {
    // Fetch existing company data to pre-populate form
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Set form values with existing data
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null) {
            setValue(key as keyof typeof data, value);
          }
        });
      }
    } catch (err) {
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/complete-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error('Failed to complete company data');
      }
    } catch (err) {
      setError('Failed to submit company data');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4">
              <AlertDescription>Company data completed successfully!</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="company_address">Company Address</Label>
              <Input id="company_address" {...register('company_address')} />
              {errors.company_address && <span className="text-red-500">{errors.company_address.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="business_field">Business Field</Label>
              <Input id="business_field" {...register('business_field')} />
              {errors.business_field && <span className="text-red-500">{errors.business_field.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="company_type">Company Type</Label>
              <select id="company_type" {...register('company_type')}>
                <option value="pt">PT (Perseroan Terbatas)</option>
                <option value="cv">CV (Commanditaire Vennootschap)</option>
                <option value="ud">UD (Usaha Dagang)</option>
                <option value="koperasi">Koperasi</option>
                <option value="yayasan">Yayasan</option>
                <option value="other">Other</option>
              </select>
              {errors.company_type && <span className="text-red-500">{errors.company_type.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="akta_number">Akta Number</Label>
              <Input id="akta_number" {...register('akta_number')} />
              {errors.akta_number && <span className="text-red-500">{errors.akta_number.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="province_id">Province</Label>
              <select id="province_id" {...register('province_id')}>
                <option value="">Select Province</option>
                {/* Options populated from API */}
              </select>
              {errors.province_id && <span className="text-red-500">{errors.province_id.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="kabupaten_id">Kabupaten/Kota</Label>
              <select id="kabupaten_id" {...register('kabupaten_id')}>
                <option value="">Select Kabupaten/Kota</option>
                {/* Options populated based on selected province */}
              </select>
              {errors.kabupaten_id && <span className="text-red-500">{errors.kabupaten_id.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Input id="kecamatan" {...register('kecamatan')} />
              {errors.kecamatan && <span className="text-red-500">{errors.kecamatan.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="kelurahan">Kelurahan</Label>
              <Input id="kelurahan" {...register('kelurahan')} />
              {errors.kelurahan && <span className="text-red-500">{errors.kelurahan.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" {...register('postal_code')} />
              {errors.postal_code && <span className="text-red-500">{errors.postal_code.message}</span>}
            </div>
            
            <Button type="submit">Complete Company Data</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 4. Certificate Submission Components

#### CertificateSubmissionForm Component
```tsx
// src/components/CertificateSubmissionForm.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload } from 'lucide-react';

interface CertificateSubmissionFormProps {
  companyId: string;
}

const CertificateSubmissionForm: React.FC<CertificateSubmissionFormProps> = ({ companyId }) => {
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size exceeds 10MB limit');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType || !selectedFile) {
      setError('Please select document type and file');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('document_type', documentType);
      formData.append('file', selectedFile);

      const response = await fetch('/api/certificates/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(true);
        setSelectedFile(null);
        setFileName(null);
        setDocumentType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error('Failed to submit certificate');
      }
    } catch (err) {
      setError('Failed to submit certificate document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit Certificate Document</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4">
              <AlertDescription>Certificate submitted successfully!</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="document_type">Certificate Type</Label>
              <select
                id="document_type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Certificate Type</option>
                <option value="iso_certificate">ISO Certificate</option>
                <option value="quality_certificate">Quality Certificate</option>
                <option value="safety_certificate">Safety Certificate</option>
                <option value="compliance_certificate">Compliance Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="certificate_file">Certificate Document</Label>
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {fileName ? 'Change File' : 'Choose File'}
                </Button>
                
                {fileName && (
                  <div className="text-sm text-gray-500">
                    {fileName}
                  </div>
                )}
              </div>
            
            <Button type="submit" disabled={isSubmitting || !documentType || !selectedFile}>
              {isSubmitting ? 'Submitting...' : 'Submit Certificate'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 5. Access Control Components

#### ProtectedRoute Component
```tsx
// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStatus?: string[]; // e.g., ['verified'], ['pending_verification', 'verified']
  fallbackPath?: string;
}

interface AccessPermission {
  can_access_dashboard: boolean;
  can_submit_data: boolean;
  can_submit_certificates: boolean;
  can_view_company_data: boolean;
  access_level: string;
  status: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredStatus = ['verified'],
  fallbackPath = '/verification-status'
}) => {
  const { user, isAuthenticated } = useAuth();
  const [accessPermission, setAccessPermission] = useState<AccessPermission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccessPermission();
    }
  }, [isAuthenticated]);

  const fetchAccessPermission = async () => {
    try {
      const response = await fetch('/api/auth/access-permission', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccessPermission(data);
      }
    } catch (error) {
      console.error('Error fetching access permission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!accessPermission) {
    return <Navigate to="/verification-status" />;
  }

  // Check if user has required status
  if (!requiredStatus.includes(accessPermission.status)) {
    return <Navigate to={fallbackPath} />;
  }

  return <>{children}</>;
};
```

#### AccessNotification Component
```tsx
// src/components/AccessNotification.tsx
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

const AccessNotification: React.FC = () => {
  const [accessPermission, setAccessPermission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessPermission();
  }, []);

  const fetchAccessPermission = async () => {
    try {
      const response = await fetch('/api/auth/access-permission', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccessPermission(data);
      }
    } catch (error) {
      console.error('Error fetching access permission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !accessPermission) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return {
          icon: <Info className="h-4 w-4" />,
          variant: 'default',
          title: 'Account Under Review',
          message: 'Your registration is currently being reviewed by our team. You have limited access until verification is complete.'
        };
      case 'needs_correction':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'destructive',
          title: 'Action Required',
          message: 'Your registration needs corrections. Please update your information and resubmit for review.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-4 w-4" />,
          variant: 'destructive',
          title: 'Registration Rejected',
          message: 'Your registration has been rejected. Please contact support for more information.'
        };
      case 'verified':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'default',
          title: 'Account Verified',
          message: 'Your account has been verified. You now have full access to the platform.'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig(accessPermission.status);
  if (!config) return null;

  return (
    <Alert variant={config.variant}>
      {config.icon}
      <div>
        <h5 className="font-medium">{config.title}</h5>
        <p className="text-sm">{config.message}</p>
        {accessPermission.next_steps && accessPermission.next_steps.length > 0 && (
          <div className="mt-2">
            <h6 className="font-medium text-sm">Next Steps:</h6>
            <ul className="list-disc pl-5 text-sm mt-1">
              {accessPermission.next_steps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AccessNotification;
```

### 6. Admin Verification Components

#### AdminVerificationDashboard Component
```tsx
// src/components/AdminVerificationDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const AdminVerificationDashboard: React.FC = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState<CompanyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/pending-registrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes: 'Approved by admin' })
      });
      
      if (response.ok) {
        // Refresh the list
        fetchPendingRegistrations();
      }
    } catch (error) {
      console.error('Error approving company:', error);
    }
  };

  const handleReject = async (companyId: string) => {
    // Implementation for rejection
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Pending Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRegistrations.length === 0 ? (
            <p>No pending registrations to review</p>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map(registration => (
                <div key={registration.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{registration.company_name}</h3>
                    <p className="text-sm text-gray-500">{registration.email} | {registration.phone}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{registration.document_count} documents</Badge>
                      <Badge variant="secondary">{registration.pic_count} PIC</Badge>
                      <Badge variant="outline">{new Date(registration.created_at).toLocaleDateString()}</Badge>
                    </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleApprove(registration.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(registration.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Request Correction
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

## Implementation Notes

### Shared Components
These components should be placed in the `src/components/ui/` directory and follow the shadcn/ui component patterns.

### Form Validation
All forms should use:
- react-hook-form for form state management
- zod for schema validation
- Custom error messages for better UX

### File Upload Handling
- All document uploads should be validated for type (PDF) and size (10MB max)
- Temporary storage should be used during registration process
- Proper cleanup of temporary files when registration is completed or cancelled

### State Management
- Use React Context or Zustand for global state management
- Store verification status and user permissions in global state
- Cache API responses to reduce unnecessary requests

### Error Handling
- Consistent error handling across all components
- User-friendly error messages
- Proper loading states during API requests