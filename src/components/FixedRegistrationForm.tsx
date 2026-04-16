import React, { useState } from 'react';
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
  Mail, 
  Phone, 
  MapPin, 
  BriefcaseIcon, 
  Globe, 
  DollarSign, 
  Building2, 
  Hash, 
  Map, 
  Home
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';

const FixedRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    company_name: '',
    company_type: '',
    business_field: '',
    company_address: '',
    province_id: '',
    kabupaten_id: '',
    business_activity: '',
    business_scale: '',
    business_established_year: '',
    pic_full_name: '',
    pic_id_number: '',
    pic_phone_number: '',
    pic_position: '',
  });
  
  const [documents, setDocuments] = useState({
    profile_picture: null as File | null,
    nib_document: null as File | null,
    npwp_document: null as File | null,
    akta_document: null as File | null,
    ktp_document: null as File | null,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Company Info', icon: Building },
    { id: 3, title: 'Business Details', icon: Briefcase },
    { id: 4, title: 'Person in Charge', icon: IdCard },
    { id: 5, title: 'Documents', icon: FileText },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: string, file: File | null) => {
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
        break;
        
      case 5: // Documents
        if (!documents.nib_document) {
          setError('NIB document is required');
          return false;
        }
        if (!documents.npwp_document) {
          setError('NPWP document is required');
          return false;
        }
        if (!documents.akta_document) {
          setError('Company deed document is required');
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
        if (value !== '') formDataToSend.append(key, value);
      });
      
      // Add documents
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
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
    onSuccess: () => {
      alert(`Registration successful! Please check your email (${formData.email}) for confirmation and next steps.`);
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        company_name: '',
        company_type: '',
        business_field: '',
        company_address: '',
        province_id: '',
        kabupaten_id: '',
        business_activity: '',
        business_scale: '',
        business_established_year: '',
        pic_full_name: '',
        pic_id_number: '',
        pic_phone_number: '',
        pic_position: '',
      });
      setDocuments({
        profile_picture: null,
        nib_document: null,
        npwp_document: null,
        akta_document: null,
        ktp_document: null,
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
    if (validateStep(currentStep) && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
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
      
      <Progress value={(currentStep / 6) * 100} className="mb-6" />
      
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
              </div>
              
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
            <div className="space-y-4">
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
              </div>
              
              <div>
                <Label htmlFor="company_type">Company Type *</Label>
                <select
                  id="company_type"
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select company type</option>
                  <option value="pt">PT (Perseroan Terbatas)</option>
                  <option value="cv">CV (Commanditaire Vennootschap)</option>
                  <option value="firma">Firma</option>
                  <option value="koperasi">Koperasi</option>
                  <option value="umkm">UMKM</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="business_field">Business Field *</Label>
                <select
                  id="business_field"
                  name="business_field"
                  value={formData.business_field}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select business field</option>
                  <option value="telecommunications">Telecommunications Services</option>
                  <option value="internet_service">Internet Service Provider</option>
                  <option value="data_center">Data Center Services</option>
                  <option value="network_infrastructure">Network Infrastructure</option>
                  <option value="equipment">Telecommunications Equipment</option>
                  <option value="software">Software Development</option>
                  <option value="consulting">IT Consulting</option>
                  <option value="cloud">Cloud Services</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="other">Other</option>
                </select>
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
                  <select
                    id="province_id"
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="jakarta">DKI Jakarta</option>
                    <option value="west_java">Jawa Barat</option>
                    <option value="central_java">Jawa Tengah</option>
                    <option value="east_java">Jawa Timur</option>
                    <option value="banten">Banten</option>
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
                    <option value="bandung">Bandung</option>
                    <option value="jakarta_pusat">Jakarta Pusat</option>
                    <option value="surabaya">Surabaya</option>
                    <option value="semarang">Semarang</option>
                  </select>
                </div>
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
            <div className="space-y-4">
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
                  <select
                    id="business_scale"
                    name="business_scale"
                    value={formData.business_scale}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select business scale</option>
                    <option value="micro">Micro (1-5 employees)</option>
                    <option value="small">Small (6-50 employees)</option>
                    <option value="medium">Medium (51-500 employees)</option>
                    <option value="large">Large (501+ employees)</option>
                  </select>
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
                    placeholder="Full name of Person in Charge"
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
              
              <div>
                <Label htmlFor="pic_position">Position *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pic_position"
                    name="pic_position"
                    value={formData.pic_position}
                    onChange={handleInputChange}
                    placeholder="Position of Person in Charge"
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
            <div className="space-y-4">
              <div>
                <Label>Profile Picture *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange('profile_picture', e.target.files[0]);
                    }
                  }}
                />
              </div>
              
              <div>
                <Label>NIB Document (Business Registration) *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange('nib_document', e.target.files[0]);
                    }
                  }}
                />
              </div>
              
              <div>
                <Label>NPWP Document (Tax ID) *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange('npwp_document', e.target.files[0]);
                    }
                  }}
                />
              </div>
              
              <div>
                <Label>Company Deed Document *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange('akta_document', e.target.files[0]);
                    }
                  }}
                />
              </div>
              
              <div>
                <Label>KTP of Person in Charge *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange('ktp_document', e.target.files[0]);
                    }
                  }}
                />
              </div>
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
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Personal Information</h4>
                <p>Email: {formData.email}</p>
                <p>Full Name: {formData.full_name}</p>
                <p>Phone: {formData.phone}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Company Information</h4>
                <p>Company Name: {formData.company_name}</p>
                <p>Type: {formData.company_type}</p>
                <p>Business Field: {formData.business_field}</p>
                <p>Address: {formData.company_address}</p>
                <p>Location: {formData.kabupaten_id}, {formData.province_id}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Business Details</h4>
                <p>Activity: {formData.business_activity}</p>
                <p>Scale: {formData.business_scale}</p>
                <p>Established: {formData.business_established_year}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Person in Charge</h4>
                <p>Full Name: {formData.pic_full_name}</p>
                <p>ID Number: {formData.pic_id_number}</p>
                <p>Phone: {formData.pic_phone_number}</p>
                <p>Position: {formData.pic_position}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Uploaded Documents</h4>
                <p>Profile Picture: {documents.profile_picture?.name || 'Not uploaded'}</p>
                <p>NIB Document: {documents.nib_document?.name || 'Not uploaded'}</p>
                <p>NPWP Document: {documents.npwp_document?.name || 'Not uploaded'}</p>
                <p>Company Deed: {documents.akta_document?.name || 'Not uploaded'}</p>
                <p>KTP of PIC: {documents.ktp_document?.name || 'Not uploaded'}</p>
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
        
        {currentStep < 6 ? (
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

export default FixedRegistrationForm;