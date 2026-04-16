import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Building, 
  Briefcase, 
  IdCard, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Mail, 
  Phone, 
  MapPin, 
  BriefcaseIcon, 
  Globe, 
  DollarSign, 
  Building2, 
  Hash, 
  Map, 
  Home,
  Eye,
  EyeOff
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DocumentUploadSectionProps {
  label: string;
  type: string;
  file: File | null;
  onFileChange: (type: string, file: File | null) => void;
  required?: boolean;
  accept?: string;
  description?: string;
}

const DocumentUploadSection = React.forwardRef<HTMLInputElement, DocumentUploadSectionProps>(({
  label, 
  type, 
  file, 
  onFileChange, 
  required = false,
  accept = '.pdf',
  description
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
    <div className="border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <Label className="flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {file ? (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg> Uploaded
          </span>
        ) : (
          <span className="text-sm text-gray-500">{required ? 'Required' : 'Optional'}</span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}
      
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
                <p className="font-medium truncate max-w-xs">{file.name}</p>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
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

DocumentUploadSection.displayName = 'DocumentUploadSection';

const CleanRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    position: '',
    
    // Company Information
    company_name: '',
    company_type: '',
    business_field: '',
    business_subfield: '',
    company_address: '',
    province_id: '',
    kabupaten_id: '',
    kecamatan: '',
    kelurahan: '',
    postal_code: '',
    npwp_number: '',
    nib_number: '',
    akta_number: '',
    akta_date: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    
    // Business Details
    business_activity: '',
    business_scale: '',
    business_established_year: '',
    employee_count: '',
    annual_revenue: '',
    business_license_type: '',
    business_license_number: '',
    business_license_expiry: '',
    
    // Person in Charge Information
    pic_full_name: '',
    pic_id_number: '',
    pic_phone_number: '',
    pic_position: '',
    pic_address: '',
    pic_province_id: '',
    pic_kabupaten_id: '',
    pic_kecamatan: '',
    pic_kelurahan: '',
    pic_postal_code: '',
    
    // Additional Information
    maksud_tujuan: '',
    verification_notes: '',
  });
  
  const [documents, setDocuments] = useState({
    profile_picture: null as File | null,
    nib_document: null as File | null,
    npwp_document: null as File | null,
    akta_document: null as File | null,
    ktp_document: null as File | null,
    assignment_letter: null as File | null,
    business_license_document: null as File | null,
    company_stamp: null as File | null,
    company_certificate: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fileInputRefs = {
    profile_picture: useRef<HTMLInputElement>(null),
    nib_document: useRef<HTMLInputElement>(null),
    npwp_document: useRef<HTMLInputElement>(null),
    akta_document: useRef<HTMLInputElement>(null),
    ktp_document: useRef<HTMLInputElement>(null),
    assignment_letter: useRef<HTMLInputElement>(null),
    business_license_document: useRef<HTMLInputElement>(null),
    company_stamp: useRef<HTMLInputElement>(null),
    company_certificate: useRef<HTMLInputElement>(null),
  };

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Company Information', icon: Building },
    { id: 3, title: 'Business Details', icon: Briefcase },
    { id: 4, title: 'Person in Charge', icon: IdCard },
    { id: 5, title: 'Documents', icon: FileText },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleFileChange = (type: string, file: File | null) => {
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size exceeds 10MB limit');
        return;
      }

      // Check file type based on document type
      if (type !== 'profile_picture' && file.type !== 'application/pdf') {
        alert('Only PDF files are allowed for documents');
        return;
      }

      if (type === 'profile_picture' && !file.type.startsWith('image/')) {
        alert('Profile picture must be an image file');
        return;
      }
      
      // Additional security check: verify file extension matches content type
      const fileName = file.name.toLowerCase();
      if (type !== 'profile_picture') {
        // For PDF documents, ensure the extension is .pdf
        if (!fileName.endsWith('.pdf')) {
          alert('Document files must have a .pdf extension');
          return;
        }
      } else {
        // For profile picture, ensure it's a valid image type
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validImageExtensions.some(ext => fileName.endsWith(ext));
        if (!hasValidExtension) {
          alert('Profile picture must be a valid image file (jpg, jpeg, png, gif, webp)');
          return;
        }
      }
    }

    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 1: // Personal Information
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.full_name) {
          setError('Full name is required');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (!formData.phone) {
          setError('Phone number is required');
          return false;
        }
        break;
        
      case 2: // Company Information
        if (!formData.company_name) {
          setError('Company name is required');
          return false;
        }
        if (!formData.company_type) {
          setError('Company type is required');
          return false;
        }
        if (!formData.business_field) {
          setError('Business field is required');
          return false;
        }
        if (!formData.company_address) {
          setError('Company address is required');
          return false;
        }
        if (!formData.province_id) {
          setError('Province is required');
          return false;
        }
        if (!formData.kabupaten_id) {
          setError('Kabupaten/Kota is required');
          return false;
        }
        if (!formData.kecamatan) {
          setError('Kecamatan is required');
          return false;
        }
        if (!formData.kelurahan) {
          setError('Kelurahan is required');
          return false;
        }
        if (!formData.postal_code) {
          setError('Postal code is required');
          return false;
        }
        break;
        
      case 3: // Business Details
        if (!formData.business_activity) {
          setError('Business activity description is required');
          return false;
        }
        if (!formData.business_scale) {
          setError('Business scale is required');
          return false;
        }
        if (!formData.business_established_year) {
          setError('Year established is required');
          return false;
        }
        // Validate year is reasonable
        const currentYear = new Date().getFullYear();
        const year = parseInt(formData.business_established_year);
        if (isNaN(year) || year < 1900 || year > currentYear) {
          setError(`Year established must be between 1900 and ${currentYear}`);
          return false;
        }
        break;
        
      case 4: // Person in Charge
        if (!formData.pic_full_name) {
          setError('Person in charge full name is required');
          return false;
        }
        if (!formData.pic_id_number) {
          setError('ID number (KTP) is required');
          return false;
        }
        // Validate ID number format (16 digits for Indonesian KTP)
        if (!/^\d{16}$/.test(formData.pic_id_number)) {
          setError('ID number must be 16 digits');
          return false;
        }
        if (!formData.pic_phone_number) {
          setError('Person in charge phone number is required');
          return false;
        }
        if (!formData.pic_position) {
          setError('Person in charge position is required');
          return false;
        }
        if (!formData.pic_address) {
          setError('Person in charge address is required');
          return false;
        }
        if (!formData.pic_province_id) {
          setError('Person in charge province is required');
          return false;
        }
        if (!formData.pic_kabupaten_id) {
          setError('Person in charge kabupaten/kota is required');
          return false;
        }
        if (!formData.pic_kecamatan) {
          setError('Person in charge kecamatan is required');
          return false;
        }
        if (!formData.pic_kelurahan) {
          setError('Person in charge kelurahan is required');
          return false;
        }
        if (!formData.pic_postal_code) {
          setError('Person in charge postal code is required');
          return false;
        }
        break;
        
      case 5: // Documents
        if (!documents.nib_document) {
          setError('NIB (Business Registration) document is required');
          return false;
        }
        if (!documents.npwp_document) {
          setError('NPWP (Tax ID) document is required');
          return false;
        }
        if (!documents.akta_document) {
          setError('Company Deed document is required');
          return false;
        }
        if (!documents.ktp_document) {
          setError('KTP of Person in Charge document is required');
          return false;
        }
        break;
        
      case 6: // Review & Submit - ensure all required fields are still filled
        // Re-validate all previous steps to ensure nothing was changed or left blank during review
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        const emailRegexSubmit = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegexSubmit.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.full_name) {
          setError('Full name is required');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (!formData.phone) {
          setError('Phone number is required');
          return false;
        }
        if (!formData.company_name) {
          setError('Company name is required');
          return false;
        }
        if (!formData.company_type) {
          setError('Company type is required');
          return false;
        }
        if (!formData.business_field) {
          setError('Business field is required');
          return false;
        }
        if (!formData.company_address) {
          setError('Company address is required');
          return false;
        }
        if (!formData.province_id) {
          setError('Province is required');
          return false;
        }
        if (!formData.kabupaten_id) {
          setError('Kabupaten/Kota is required');
          return false;
        }
        if (!formData.kecamatan) {
          setError('Kecamatan is required');
          return false;
        }
        if (!formData.kelurahan) {
          setError('Kelurahan is required');
          return false;
        }
        if (!formData.postal_code) {
          setError('Postal code is required');
          return false;
        }
        if (!formData.business_activity) {
          setError('Business activity description is required');
          return false;
        }
        if (!formData.business_scale) {
          setError('Business scale is required');
          return false;
        }
        if (!formData.business_established_year) {
          setError('Year established is required');
          return false;
        }
        const yearSubmit = parseInt(formData.business_established_year);
        if (isNaN(yearSubmit) || yearSubmit < 1900 || yearSubmit > currentYear) {
          setError(`Year established must be between 1900 and ${currentYear}`);
          return false;
        }
        if (!formData.pic_full_name) {
          setError('Person in charge full name is required');
          return false;
        }
        if (!formData.pic_id_number) {
          setError('ID number (KTP) is required');
          return false;
        }
        if (!/^\d{16}$/.test(formData.pic_id_number)) {
          setError('ID number must be 16 digits');
          return false;
        }
        if (!formData.pic_phone_number) {
          setError('Person in charge phone number is required');
          return false;
        }
        if (!formData.pic_position) {
          setError('Person in charge position is required');
          return false;
        }
        if (!formData.pic_address) {
          setError('Person in charge address is required');
          return false;
        }
        if (!formData.pic_province_id) {
          setError('Person in charge province is required');
          return false;
        }
        if (!formData.pic_kabupaten_id) {
          setError('Person in charge kabupaten/kota is required');
          return false;
        }
        if (!formData.pic_kecamatan) {
          setError('Person in charge kecamatan is required');
          return false;
        }
        if (!formData.pic_kelurahan) {
          setError('Person in charge kelurahan is required');
          return false;
        }
        if (!formData.pic_postal_code) {
          setError('Person in charge postal code is required');
          return false;
        }
        if (!documents.nib_document) {
          setError('NIB (Business Registration) document is required');
          return false;
        }
        if (!documents.npwp_document) {
          setError('NPWP (Tax ID) document is required');
          return false;
        }
        if (!documents.akta_document) {
          setError('Company Deed document is required');
          return false;
        }
        if (!documents.ktp_document) {
          setError('KTP of Person in Charge document is required');
          return false;
        }
        break;
    }
    return true;
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) formDataToSend.append(key, value);
      });
      
      // Add documents
      Object.entries(documents).forEach(([key, file]) => {
        if (file && file !== null) {
          formDataToSend.append(key, file);
        }
      });

      const response = await fetch('/api/auth/register-with-details', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // More user-friendly success message with email reminder
      alert(`Registration successful! Please check your email (${formData.email}) for confirmation and next steps.`);
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        position: '',
        company_name: '',
        company_type: '',
        business_field: '',
        business_subfield: '',
        company_address: '',
        province_id: '',
        kabupaten_id: '',
        kecamatan: '',
        kelurahan: '',
        postal_code: '',
        npwp_number: '',
        nib_number: '',
        akta_number: '',
        akta_date: '',
        company_phone: '',
        company_email: '',
        company_website: '',
        business_activity: '',
        business_scale: '',
        business_established_year: '',
        employee_count: '',
        annual_revenue: '',
        business_license_type: '',
        business_license_number: '',
        business_license_expiry: '',
        pic_full_name: '',
        pic_id_number: '',
        pic_phone_number: '',
        pic_position: '',
        pic_address: '',
        pic_province_id: '',
        pic_kabupaten_id: '',
        pic_kecamatan: '',
        pic_kelurahan: '',
        pic_postal_code: '',
        maksud_tujuan: '',
        verification_notes: '',
      });
      setDocuments({
        profile_picture: null,
        nib_document: null,
        npwp_document: null,
        akta_document: null,
        ktp_document: null,
        assignment_letter: null,
        business_license_document: null,
        company_stamp: null,
        company_certificate: null
      });
      setCurrentStep(1);
    },
    onError: (error) => {
      setError(error.message || 'Registration failed. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    if (!validateStep(6)) return;
    setIsSubmitting(true);
    registerMutation.mutate();
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getBusinessFields = () => {
    return [
      'Telecommunications Services',
      'Internet Service Provider',
      'Data Center Services',
      'Network Infrastructure',
      'Telecommunications Equipment',
      'Software Development',
      'IT Consulting',
      'Cloud Services',
      'Cybersecurity',
      'Other'
    ];
  };

  const getBusinessScales = () => {
    return [
      'Micro (1-5 employees)',
      'Small (6-50 employees)',
      'Medium (51-500 employees)',
      'Large (501+ employees)'
    ];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          {steps.map(step => (
            <div key={step.id} className="text-center flex-1 px-2">
              <div className={`text-sm ${currentStep === step.id ? 'font-semibold text-blue-500' : 'text-gray-500'}`}>
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
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength < 2 ? 'bg-red-500' : 
                            passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {passwordStrength < 2 ? 'Weak' : 
                         passwordStrength < 4 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  </div>
                
                <div className="relative">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+62..."
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="position">Your Position in Company</Label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Your role in the company"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Company Information */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="Company legal name"
                      className="pl-10"
                      required
                    />
                  </div>
                
                <div>
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select name="company_type" value={formData.company_type} onValueChange={(value) => handleInputChange({ target: { name: 'company_type', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
                      <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
                      <SelectItem value="firma">Firma</SelectItem>
                      <SelectItem value="koperasi">Koperasi</SelectItem>
                      <SelectItem value="umkm">UMKM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_field">Business Field *</Label>
                  <Select name="business_field" value={formData.business_field} onValueChange={(value) => handleInputChange({ target: { name: 'business_field', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select business field" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBusinessFields().map(field => (
                        <SelectItem key={field} value={field.toLowerCase().replace(/\s+/g, '_')}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="business_subfield">Business Subfield</Label>
                  <Input
                    id="business_subfield"
                    name="business_subfield"
                    value={formData.business_subfield}
                    onChange={handleInputChange}
                    placeholder="Specific business subfield"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company_address">Company Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="company_address"
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleInputChange}
                    placeholder="Complete company address"
                    className="pl-10"
                    required
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province_id">Province *</Label>
                  <Select name="province_id" value={formData.province_id} onValueChange={(value) => handleInputChange({ target: { name: 'province_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                      <SelectItem value="west_java">Jawa Barat</SelectItem>
                      <SelectItem value="central_java">Jawa Tengah</SelectItem>
                      <SelectItem value="east_java">Jawa Timur</SelectItem>
                      <SelectItem value="banten">Banten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="kabupaten_id">Kabupaten/Kota *</Label>
                  <Select name="kabupaten_id" value={formData.kabupaten_id} onValueChange={(value) => handleInputChange({ target: { name: 'kabupaten_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Kabupaten/Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bandung">Bandung</SelectItem>
                      <SelectItem value="jakarta_pusat">Jakarta Pusat</SelectItem>
                      <SelectItem value="surabaya">Surabaya</SelectItem>
                      <SelectItem value="semarang">Semarang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kecamatan">Kecamatan *</Label>
                  <div className="relative">
                    <Map className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="kecamatan"
                      name="kecamatan"
                      value={formData.kecamatan}
                      onChange={handleInputChange}
                      placeholder="Kecamatan"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="kelurahan">Kelurahan *</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="kelurahan"
                      name="kelurahan"
                      value={formData.kelurahan}
                      onChange={handleInputChange}
                      placeholder="Kelurahan"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_phone">Company Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_phone"
                      name="company_phone"
                      value={formData.company_phone}
                      onChange={handleInputChange}
                      placeholder="Company phone number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_email">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={handleInputChange}
                      placeholder="Company email"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_website">Company Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_website"
                      name="company_website"
                      type="url"
                      value={formData.company_website}
                      onChange={handleInputChange}
                      placeholder="Company website URL"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="npwp_number">NPWP Number</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="npwp_number"
                      name="npwp_number"
                      value={formData.npwp_number}
                      onChange={handleInputChange}
                      placeholder="Tax ID number"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nib_number">NIB Number</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nib_number"
                      name="nib_number"
                      value={formData.nib_number}
                      onChange={handleInputChange}
                      placeholder="Business Registration Number"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="akta_number">Company Deed Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="akta_number"
                      name="akta_number"
                      value={formData.akta_number}
                      onChange={handleInputChange}
                      placeholder="Company deed number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="akta_date">Company Deed Date</Label>
                <Input
                  id="akta_date"
                  name="akta_date"
                  type="date"
                  value={formData.akta_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Business Details */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="business_activity">Business Activity Description *</Label>
                <Textarea
                  id="business_activity"
                  name="business_activity"
                  value={formData.business_activity}
                  onChange={handleInputChange}
                  placeholder="Describe your company's main business activities"
                  required
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_scale">Business Scale *</Label>
                  <Select name="business_scale" value={formData.business_scale} onValueChange={(value) => handleInputChange({ target: { name: 'business_scale', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select business scale" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBusinessScales().map(scale => (
                        <SelectItem key={scale} value={scale.toLowerCase().replace(/\s+/g, '_')}>{scale}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="business_established_year">Year Established *</Label>
                  <Input
                    id="business_established_year"
                    name="business_established_year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.business_established_year}
                    onChange={handleInputChange}
                    placeholder="Year company was established"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_count">Number of Employees</Label>
                  <Input
                    id="employee_count"
                    name="employee_count"
                    type="number"
                    min="1"
                    value={formData.employee_count}
                    onChange={handleInputChange}
                    placeholder="Number of employees"
                  />
                </div>
                
                <div>
                  <Label htmlFor="annual_revenue">Annual Revenue (IDR)</Label>
                  <Input
                    id="annual_revenue"
                    name="annual_revenue"
                    type="text"
                    value={formData.annual_revenue}
                    onChange={handleInputChange}
                    placeholder="Annual revenue in IDR"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="business_license_type">Business License Type</Label>
                  <Input
                    id="business_license_type"
                    name="business_license_type"
                    value={formData.business_license_type}
                    onChange={handleInputChange}
                    placeholder="Type of business license"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business_license_number">Business License Number</Label>
                  <Input
                    id="business_license_number"
                    name="business_license_number"
                    value={formData.business_license_number}
                    onChange={handleInputChange}
                    placeholder="Business license number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business_license_expiry">License Expiry Date</Label>
                  <Input
                    id="business_license_expiry"
                    name="business_license_expiry"
                    type="date"
                    value={formData.business_license_expiry}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Person in Charge */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Person in Charge Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_full_name">Person in Charge Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_full_name"
                      name="pic_full_name"
                      value={formData.pic_full_name}
                      onChange={handleInputChange}
                      placeholder="Full name of PIC"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pic_id_number">ID Number (KTP) *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_id_number"
                      name="pic_id_number"
                      value={formData.pic_id_number}
                      onChange={handleInputChange}
                      placeholder="16-digit ID number"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_phone_number">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_phone_number"
                      name="pic_phone_number"
                      value={formData.pic_phone_number}
                      onChange={handleInputChange}
                      placeholder="+62..."
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pic_position">Position *</Label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_position"
                      name="pic_position"
                      value={formData.pic_position}
                      onChange={handleInputChange}
                      placeholder="Position of PIC"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="pic_address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="pic_address"
                    name="pic_address"
                    value={formData.pic_address}
                    onChange={handleInputChange}
                    placeholder="Complete address of PIC"
                    className="pl-10"
                    required
                    rows={3}
                  />
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_province_id">Province *</Label>
                  <Select name="pic_province_id" value={formData.pic_province_id} onValueChange={(value) => handleInputChange({ target: { name: 'pic_province_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                      <SelectItem value="west_java">Jawa Barat</SelectItem>
                      <SelectItem value="central_java">Jawa Tengah</SelectItem>
                      <SelectItem value="east_java">Jawa Timur</SelectItem>
                      <SelectItem value="banten">Banten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pic_kabupaten_id">Kabupaten/Kota *</Label>
                  <Select name="pic_kabupaten_id" value={formData.pic_kabupaten_id} onValueChange={(value) => handleInputChange({ target: { name: 'pic_kabupaten_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Kabupaten/Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bandung">Bandung</SelectItem>
                      <SelectItem value="jakarta_pusat">Jakarta Pusat</SelectItem>
                      <SelectItem value="surabaya">Surabaya</SelectItem>
                      <SelectItem value="semarang">Semarang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic_kecamatan">Kecamatan *</Label>
                  <div className="relative">
                    <Map className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_kecamatan"
                      name="pic_kecamatan"
                      value={formData.pic_kecamatan}
                      onChange={handleInputChange}
                      placeholder="Kecamatan"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pic_kelurahan">Kelurahan *</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pic_kelurahan"
                      name="pic_kelurahan"
                      value={formData.pic_kelurahan}
                      onChange={handleInputChange}
                      placeholder="Kelurahan"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              
              <div>
                <Label htmlFor="pic_postal_code">Postal Code *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pic_postal_code"
                    name="pic_postal_code"
                    value={formData.pic_postal_code}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Document Upload */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <DocumentUploadSection 
                label="Profile Picture"
                type="profile_picture"
                file={documents.profile_picture}
                onFileChange={handleFileChange}
                required={true}
                accept="image/*"
                description="Professional photo of the main contact person"
                ref={fileInputRefs.profile_picture}
              />
              
              <DocumentUploadSection 
                label="NIB (Nomor Induk Berusaha)"
                type="nib_document"
                file={documents.nib_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                description="Business registration certificate"
                ref={fileInputRefs.nib_document}
              />
              
              <DocumentUploadSection 
                label="NPWP (Tax ID)"
                type="npwp_document"
                file={documents.npwp_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                description="Company tax identification document"
                ref={fileInputRefs.npwp_document}
              />
              
              <DocumentUploadSection 
                label="Company Deed (Akta Pendirian)"
                type="akta_document"
                file={documents.akta_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                description="Official company founding document"
                ref={fileInputRefs.akta_document}
              />
              
              <DocumentUploadSection 
                label="KTP of Person in Charge"
                type="ktp_document"
                file={documents.ktp_document}
                onFileChange={handleFileChange}
                required={true}
                accept=".pdf"
                description="Identity card of the person in charge"
                ref={fileInputRefs.ktp_document}
              />
              
              <DocumentUploadSection 
                label="Assignment Letter"
                type="assignment_letter"
                file={documents.assignment_letter}
                onFileChange={handleFileChange}
                required={false}
                accept=".pdf"
                description="Official letter assigning the person in charge"
                ref={fileInputRefs.assignment_letter}
              />
              
              <DocumentUploadSection 
                label="Business License Document"
                type="business_license_document"
                file={documents.business_license_document}
                onFileChange={handleFileChange}
                required={false}
                accept=".pdf"
                description="Additional business license documentation"
                ref={fileInputRefs.business_license_document}
              />
              
              <DocumentUploadSection 
                label="Company Stamp/Surat Kuasa"
                type="company_stamp"
                file={documents.company_stamp}
                onFileChange={handleFileChange}
                required={false}
                accept=".pdf"
                description="Company official stamp or power of attorney"
                ref={fileInputRefs.company_stamp}
              />
              
              <DocumentUploadSection 
                label="Company Certificate"
                type="company_certificate"
                file={documents.company_certificate}
                onFileChange={handleFileChange}
                required={false}
                accept=".pdf"
                description="Additional company certificates"
                ref={fileInputRefs.company_certificate}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 6: Review and Submit */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded-lg p-4 space-y-4 bg-muted">
                <div>
                  <h4 className="font-medium text-lg">Personal Information</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Full Name:</span> {formData.full_name}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium">Position:</span> {formData.position}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg">Company Information</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Company Name:</span> {formData.company_name}</p>
                    <p><span className="font-medium">Type:</span> {formData.company_type}</p>
                    <p><span className="font-medium">Business Field:</span> {formData.business_field}</p>
                    <p><span className="font-medium">Address:</span> {formData.company_address}</p>
                    <p><span className="font-medium">Location:</span> {formData.kecamatan}, {formData.kelurahan}, {formData.kabupaten_id}, {formData.province_id}</p>
                    <p><span className="font-medium">Postal Code:</span> {formData.postal_code}</p>
                    <p><span className="font-medium">Phone:</span> {formData.company_phone}</p>
                    <p><span className="font-medium">Email:</span> {formData.company_email}</p>
                    <p><span className="font-medium">Website:</span> {formData.company_website}</p>
                    <p><span className="font-medium">NPWP:</span> {formData.npwp_number}</p>
                    <p><span className="font-medium">NIB:</span> {formData.nib_number}</p>
                    <p><span className="font-medium">Deed Number:</span> {formData.akta_number}</p>
                    <p><span className="font-medium">Deed Date:</span> {formData.akta_date}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg">Business Details</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Activity:</span> {formData.business_activity}</p>
                    <p><span className="font-medium">Scale:</span> {formData.business_scale}</p>
                    <p><span className="font-medium">Established:</span> {formData.business_established_year}</p>
                    <p><span className="font-medium">Employees:</span> {formData.employee_count}</p>
                    <p><span className="font-medium">Revenue:</span> {formData.annual_revenue}</p>
                    <p><span className="font-medium">License Type:</span> {formData.business_license_type}</p>
                    <p><span className="font-medium">License Number:</span> {formData.business_license_number}</p>
                    <p><span className="font-medium">License Expiry:</span> {formData.business_license_expiry}</p>
                  </div>
                
                <div>
                  <h4 className="font-medium text-lg">Person in Charge</h4>
                  <div className="ml-4 space-y-1 text-sm">
                    <p><span className="font-medium">Full Name:</span> {formData.pic_full_name}</p>
                    <p><span className="font-medium">ID Number:</span> {formData.pic_id_number}</p>
                    <p><span className="font-medium">Phone:</span> {formData.pic_phone_number}</p>
                    <p><span className="font-medium">Position:</span> {formData.pic_position}</p>
                    <p><span className="font-medium">Address:</span> {formData.pic_address}</p>
                  </div>
                
                <div>
                  <h4 className="font-medium text-lg">Uploaded Documents</h4>
                  <ul className="ml-4 space-y-1 text-sm">
                    {documents.profile_picture && <li>✓ Profile Picture: {documents.profile_picture.name}</li>}
                    {documents.nib_document && <li>✓ NIB Document: {documents.nib_document.name}</li>}
                    {documents.npwp_document && <li>✓ NPWP Document: {documents.npwp_document.name}</li>}
                    {documents.akta_document && <li>✓ Company Deed: {documents.akta_document.name}</li>}
                    {documents.ktp_document && <li>✓ KTP of PIC: {documents.ktp_document.name}</li>}
                    {documents.assignment_letter && <li>✓ Assignment Letter: {documents.assignment_letter.name}</li>}
                    {documents.business_license_document && <li>✓ Business License: {documents.business_license_document.name}</li>}
                    {documents.company_stamp && <li>✓ Company Stamp: {documents.company_stamp.name}</li>}
                    {documents.company_certificate && <li>✓ Company Certificate: {documents.company_certificate.name}</li>}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maksud_tujuan">Purpose of Registration</Label>
                <Textarea
                  id="maksud_tujuan"
                  name="maksud_tujuan"
                  value={formData.maksud_tujuan}
                  onChange={handleInputChange}
                  placeholder="Reason for registration"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification_notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="verification_notes"
                  name="verification_notes"
                  value={formData.verification_notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information for verification"
                  rows={2}
                />
              </div>
              
              <Alert>
                <AlertDescription>
                  By submitting this registration, you confirm that all information provided is accurate and complete. 
                  You agree to comply with all applicable regulations and terms of service.
                  Your registration will be reviewed by our team and you will be notified of the status.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default CleanRegistrationForm;