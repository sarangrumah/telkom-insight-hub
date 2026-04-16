import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, User, Building, Eye, CheckCircle, AlertCircle, XCircle, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface DocumentUploadSectionProps {
  label: string;
  type: string;
  file: File | null;
  onFileChange: (type: string, file: File | null) => void;
  required?: boolean;
  accept?: string;
}

const DocumentUploadSection = React.forwardRef<HTMLInputElement, DocumentUploadSectionProps>(({
  label, 
  type, 
  file, 
  onFileChange, 
  required = false,
  accept = '.pdf'
}, ref) => {
  const [dragActive, setDragActive] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileChange(type, e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileChange(type, null);
  };

  const handleButtonClick = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.click();
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(type, e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <Label className="flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {file ? (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Uploaded
          </span>
        ) : (
          <span className="text-sm text-gray-500">{required ? 'Required' : 'Optional'}</span>
        )}
      </div>
      
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        ref={ref}
        className="hidden"
      />
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleButtonClick}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">PDF file (max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
});

const RegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: '',
    position: '',
    maksud_tujuan: '',
    address: '',
    province_id: '',
    kabupaten_id: '',
    kecamatan: '',
    kelurahan: '',
    postal_code: '',
    pic_full_name: '',
    pic_id_number: '',
    pic_phone_number: '',
    pic_position: '',
    pic_address: '',
    pic_province_id: '',
    pic_kabupaten_id: '',
    pic_kecamatan: '',
    pic_kelurahan: '',
    pic_postal_code: ''
  });
  const [documents, setDocuments] = useState({
    profile_picture: null as File | null,
    nib_document: null as File | null,
    npwp_document: null as File | null,
    akta_document: null as File | null,
    ktp_document: null as File | null,
    assignment_letter: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRefs = {
    profile_picture: useRef<HTMLInputElement>(null),
    nib_document: useRef<HTMLInputElement>(null),
    npwp_document: useRef<HTMLInputElement>(null),
    akta_document: useRef<HTMLInputElement>(null),
    ktp_document: useRef<HTMLInputElement>(null),
    assignment_letter: useRef<HTMLInputElement>(null)
  };

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Company Information', icon: Building },
    { id: 3, title: 'Person in Charge', icon: User },
    { id: 4, title: 'Documents', icon: FileText },
    { id: 5, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: string, file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size exceeds 10MB limit');
        return;
      }

      if (type !== 'profile_picture' && file.type !== 'application/pdf') {
        alert('Only PDF files are allowed for documents');
        return;
      }

      if (type === 'profile_picture' && !file.type.startsWith('image/')) {
        alert('Profile picture must be an image file');
        return;
      }
    }

    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      
      // Add documents
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file);
        }
      });

      const response = await fetch('/api/auth/register-with-documents', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      alert('Registration successful! Please check your email for confirmation.');
      // Reset form
      setFormData({
        email: '',
        password: '',
        full_name: '',
        company_name: '',
        phone: '',
        position: '',
        maksud_tujuan: '',
        address: '',
        province_id: '',
        kabupaten_id: '',
        kecamatan: '',
        kelurahan: '',
        postal_code: '',
        pic_full_name: '',
        pic_id_number: '',
        pic_phone_number: '',
        pic_position: '',
        pic_address: '',
        pic_province_id: '',
        pic_kabupaten_id: '',
        pic_kecamatan: '',
        pic_kelurahan: '',
        pic_postal_code: ''
      });
      setDocuments({
        profile_picture: null,
        nib_document: null,
        npwp_document: null,
        akta_document: null,
        ktp_document: null,
        assignment_letter: null
      });
      setCurrentStep(1);
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    registerMutation.mutate();
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

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex justify-between">
              {steps.map(step => (
                <div key={step.id} className="text-center">
                  <div className={`text-sm ${currentStep === step.id ? 'font-semibold text-blue-500' : ''}`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Progress value={(currentStep / steps.length) * 100} className="mb-6" />
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+62..."
                  required
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Company Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company legal name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Your Position in Company *</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Your role in the company"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maksud_tujuan">Purpose of Registration *</Label>
                <Input
                  id="maksud_tujuan"
                  name="maksud_tujuan"
                  value={formData.maksud_tujuan}
                  onChange={handleInputChange}
                  placeholder="Reason for registration"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Company Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete company address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province_id">Province *</Label>
                  <select
                    id="province_id"
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Province</option>
                    {/* Options would be populated from API */}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="kabupaten_id">Kabupaten/Kota *</Label>
                  <select
                    id="kabupaten_id"
                    name="kabupaten_id"
                    value={formData.kabupaten_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Kabupaten/Kota</option>
                    {/* Options would be populated based on selected province */}
                  </select>
                </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kecamatan">Kecamatan *</Label>
                  <Input
                    id="kecamatan"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    placeholder="Kecamatan"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="kelurahan">Kelurahan *</Label>
                  <Input
                    id="kelurahan"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    placeholder="Kelurahan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Person in Charge */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pic_full_name">Person in Charge Full Name *</Label>
                <Input
                  id="pic_full_name"
                  name="pic_full_name"
                  value={formData.pic_full_name}
                  onChange={handleInputChange}
                  placeholder="Full name of PIC"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pic_id_number">ID Number (KTP) *</Label>
                <Input
                  id="pic_id_number"
                  name="pic_id_number"
                  value={formData.pic_id_number}
                  onChange={handleInputChange}
                  placeholder="16-digit ID number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pic_phone_number">Phone Number *</Label>
                <Input
                  id="pic_phone_number"
                  name="pic_phone_number"
                  value={formData.pic_phone_number}
                  onChange={handleInputChange}
                  placeholder="+62..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pic_position">Position *</Label>
                <Input
                  id="pic_position"
                  name="pic_position"
                  value={formData.pic_position}
                  onChange={handleInputChange}
                  placeholder="Position of PIC"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pic_address">Address *</Label>
                <Input
                  id="pic_address"
                  name="pic_address"
                  value={formData.pic_address}
                  onChange={handleInputChange}
                  placeholder="Complete address of PIC"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_province_id">Province *</Label>
                  <select
                    id="pic_province_id"
                    name="pic_province_id"
                    value={formData.pic_province_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Province</option>
                    {/* Options would be populated from API */}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="pic_kabupaten_id">Kabupaten/Kota *</Label>
                  <select
                    id="pic_kabupaten_id"
                    name="pic_kabupaten_id"
                    value={formData.pic_kabupaten_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Kabupaten/Kota</option>
                    {/* Options would be populated based on selected province */}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_kecamatan">Kecamatan *</Label>
                  <Input
                    id="pic_kecamatan"
                    name="pic_kecamatan"
                    value={formData.pic_kecamatan}
                    onChange={handleInputChange}
                    placeholder="Kecamatan"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pic_kelurahan">Kelurahan *</Label>
                  <Input
                    id="pic_kelurahan"
                    name="pic_kelurahan"
                    value={formData.pic_kelurahan}
                    onChange={handleInputChange}
                    placeholder="Kelurahan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pic_postal_code">Postal Code *</Label>
                <Input
                  id="pic_postal_code"
                  name="pic_postal_code"
                  value={formData.pic_postal_code}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Step 4: Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <DocumentUploadSection 
                label="Profile Picture"
                type="profile_picture"
                file={documents.profile_picture}
                onFileChange={handleFileChange}
                required={true}
                accept="image/*"
                ref={fileInputRefs.profile_picture}
              />
              
              <DocumentUploadSection 
                label="NIB (Nomor Induk Berusaha)"
                type="nib_document"
                file={documents.nib_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                ref={fileInputRefs.nib_document}
              />
              
              <DocumentUploadSection 
                label="NPWP (Tax ID)"
                type="npwp_document"
                file={documents.npwp_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                ref={fileInputRefs.npwp_document}
              />
              
              <DocumentUploadSection 
                label="Company Deed (Akta Pendirian)"
                type="akta_document"
                file={documents.akta_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                ref={fileInputRefs.akta_document}
              />
              
              <DocumentUploadSection 
                label="KTP of Person in Charge"
                type="ktp_document"
                file={documents.ktp_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                ref={fileInputRefs.ktp_document}
              />
              
              <DocumentUploadSection 
                label="Assignment Letter"
                type="assignment_letter"
                file={documents.assignment_letter}
                onFileChange={handleFileChange}
                required={false}
                accept=".pdf"
                ref={fileInputRefs.assignment_letter}
              />
            </div>
          )}
          
          {/* Step 5: Review and Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Review Your Information</h3>
              
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Full Name:</span> {formData.full_name}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Company Information</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Company Name:</span> {formData.company_name}</p>
                    <p><span className="font-medium">Position:</span> {formData.position}</p>
                    <p><span className="font-medium">Purpose:</span> {formData.maksud_tujuan}</p>
                    <p><span className="font-medium">Address:</span> {formData.address}</p>
                    <p><span className="font-medium">Location:</span> {formData.kecamatan}, {formData.kelurahan}, {formData.kabupaten_id}, {formData.province_id}</p>
                    <p><span className="font-medium">Postal Code:</span> {formData.postal_code}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Person in Charge</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Full Name:</span> {formData.pic_full_name}</p>
                    <p><span className="font-medium">ID Number:</span> {formData.pic_id_number}</p>
                    <p><span className="font-medium">Phone:</span> {formData.pic_phone_number}</p>
                    <p><span className="font-medium">Position:</span> {formData.pic_position}</p>
                    <p><span className="font-medium">Address:</span> {formData.pic_address}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Uploaded Documents</h4>
                  <ul className="ml-4 space-y-1 text-sm">
                    {documents.profile_picture && <li>✓ Profile Picture: {documents.profile_picture.name}</li>}
                    {documents.nib_document && <li>✓ NIB Document: {documents.nib_document.name}</li>}
                    {documents.npwp_document && <li>✓ NPWP Document: {documents.npwp_document.name}</li>}
                    {documents.akta_document && <li>✓ Company Deed: {documents.akta_document.name}</li>}
                    {documents.ktp_document && <li>✓ KTP of PIC: {documents.ktp_document.name}</li>}
                    {documents.assignment_letter && <li>✓ Assignment Letter: {documents.assignment_letter.name}</li>}
                  </ul>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  By submitting this registration, you confirm that all information provided is accurate and complete. 
                  You agree to comply with all applicable regulations and terms of service.
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
                disabled={isSubmitting || registerMutation.isPending}
              >
                {isSubmitting || registerMutation.isPending ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;