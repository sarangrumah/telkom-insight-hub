import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Mail, User, Phone, Building2, MapPin, Briefcase, IdCard, Globe } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SimpleEnhancedRegistrationForm: React.FC = () => {
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
    company_phone: '',
    company_email: '',
    company_website: '',
    
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
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const steps = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Company Information' },
    { id: 3, title: 'Person in Charge' },
    { id: 4, title: 'Documents' },
    { id: 5, title: 'Review & Submit' }
  ];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
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

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.email || !formData.full_name || !formData.password || !formData.phone) {
          setError('Please fill in all required personal information fields');
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
        break;
        
      case 2: // Company Information
        if (!formData.company_name || !formData.company_type || !formData.business_field || 
            !formData.company_address || !formData.province_id || !formData.kabupaten_id || 
            !formData.kecamatan || !formData.kelurahan || !formData.postal_code) {
          setError('Please fill in all required company information fields');
          return false;
        }
        break;
        
      case 3: // Person in Charge
        if (!formData.pic_full_name || !formData.pic_id_number || !formData.pic_phone_number || 
            !formData.pic_position || !formData.pic_address || !formData.pic_province_id || 
            !formData.pic_kabupaten_id || !formData.pic_kecamatan || !formData.pic_kelurahan || 
            !formData.pic_postal_code) {
          setError('Please fill in all required person in charge fields');
          return false;
        }
        break;
        
      case 4: // Documents
        if (!documents.nib_document || !documents.npwp_document || !documents.akta_document || 
            !documents.ktp_document) {
          setError('Required documents are missing: NIB, NPWP, Company Deed, and KTP of PIC must be uploaded');
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
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
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
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    if (!validateStep(5)) return;
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

  return (
    <div className="space-y-6">
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
                  <span className="text-sm">{step.id}</span>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
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
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
      )}
      
      {/* Step 2: Company Information */}
      {currentStep === 2 && (
        <div className="space-y-4">
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
              <Select name="company_type" value={formData.company_type} onValueChange={(value) => handleInputChange({ target: { name: 'company_type', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_field">Business Field *</Label>
              <Select name="business_field" value={formData.business_field} onValueChange={(value) => handleInputChange({ target: { name: 'business_field', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
              <Select name="province_id" value={formData.province_id} onValueChange={(value) => handleInputChange({ target: { name: 'province_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
              <Select name="kabupaten_id" value={formData.kabupaten_id} onValueChange={(value) => handleInputChange({ target: { name: 'kabupaten_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleInputChange}
                placeholder="Company phone number"
              />
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
              <Input
                id="npwp_number"
                name="npwp_number"
                value={formData.npwp_number}
                onChange={handleInputChange}
                placeholder="Tax ID number"
              />
            </div>
            
            <div>
              <Label htmlFor="nib_number">NIB Number</Label>
              <Input
                id="nib_number"
                name="nib_number"
                value={formData.nib_number}
                onChange={handleInputChange}
                placeholder="Business Registration Number"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Step 3: Person in Charge */}
      {currentStep === 3 && (
        <div className="space-y-4">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pic_position">Position *</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pic_province_id">Province *</Label>
              <Select name="pic_province_id" value={formData.pic_province_id} onValueChange={(value) => handleInputChange({ target: { name: 'pic_province_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
              <Select name="pic_kabupaten_id" value={formData.pic_kabupaten_id} onValueChange={(value) => handleInputChange({ target: { name: 'pic_kabupaten_id', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
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
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-1">
                Profile Picture <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">Required</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocuments(prev => ({ ...prev, profile_picture: e.target.files[0] }));
                }
              }}
              className="w-full"
            />
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-1">
                NIB Document <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">Required</span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocuments(prev => ({ ...prev, nib_document: e.target.files[0] }));
                }
              }}
              className="w-full"
            />
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-1">
                NPWP Document <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">Required</span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocuments(prev => ({ ...prev, npwp_document: e.target.files[0] }));
                }
              }}
              className="w-full"
            />
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-1">
                Company Deed <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">Required</span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocuments(prev => ({ ...prev, akta_document: e.target.files[0] }));
                }
              }}
              className="w-full"
            />
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-1">
                KTP of Person in Charge <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">Required</span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocuments(prev => ({ ...prev, ktp_document: e.target.files[0] }));
                }
              }}
              className="w-full"
            />
          </div>
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
                <p><span className="font-medium">Position:</span> {formData.position}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">Company Information</h4>
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

export default SimpleEnhancedRegistrationForm;