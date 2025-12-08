import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Mail, User, Phone, Building2, MapPin, Briefcase, IdCard, Globe, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEmailAvailability } from '@/hooks/useEmailAvailability';

const NewPublicRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register: registerUser, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    phone: '',
    position: '',
    businessField: '',
    companyAddress: '',
    provinceId: '',
    kabupatenId: '',
    kecamatan: '',
    kelurahan: '',
    postalCode: '',
    npwpNumber: '',
    nibNumber: '',
    picFullName: '',
    picIdNumber: '',
    picPhoneNumber: '',
    picPosition: '',
    picAddress: '',
    maksudTujuan: '',
  });

  const steps = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Company Information' },
    { id: 3, title: 'Person in Charge' },
    { id: 4, title: 'Purpose & Review' }
  ];

  // Centralized email availability (debounced) hook
  const {
    checking: checkingEmail,
    available: emailAvailable,
    error: emailAvailabilityError,
  } = useEmailAvailability(formData.email);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.email || !formData.fullName || !formData.password || !formData.phone) {
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
        if (!formData.companyName || !formData.businessField || !formData.companyAddress || 
            !formData.provinceId || !formData.kabupatenId || !formData.kecamatan || 
            !formData.kelurahan || !formData.postalCode) {
          setError('Please fill in all required company information fields');
          return false;
        }
        break;
        
      case 3: // Person in Charge
        if (!formData.picFullName || !formData.picIdNumber || !formData.picPhoneNumber || 
            !formData.picPosition || !formData.picAddress) {
          setError('Please fill in all required person in charge fields');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    setError('');

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.companyName,
        formData.phone,
        formData.maksudTujuan, // maksud_tujuan
        'pelaku_usaha', // assign role
        'public'
      );
      
      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created. Please check your email for confirmation.',
      });
      
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setError(error.message || 'An error occurred during registration');
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Panel Penyelenggaraan
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Already Have an Account?
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Company Registration</h1>
            <p className="text-muted-foreground">
              Join the telecommunications services visualization platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enhanced Registration</CardTitle>
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
                        onChange={e => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                    {checkingEmail && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Checking availability...
                      </p>
                    )}
                    {!checkingEmail && emailAvailable === true && !emailAvailabilityError && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Email available
                      </p>
                    )}
                    {!checkingEmail && emailAvailable === false && !emailAvailabilityError && (
                      <p className="text-xs text-destructive mt-1">
                        Email already registered
                      </p>
                    )}
                    {emailAvailabilityError && (
                      <p className="text-xs text-amber-600 mt-1">
                        Cannot check email: {emailAvailabilityError}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={e => handleInputChange('fullName', e.target.value)}
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
                        onChange={e => handleInputChange('password', e.target.value)}
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
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
                        onChange={e => handleInputChange('position', e.target.value)}
                        placeholder="Your role in the company"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Company Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={e => handleInputChange('companyName', e.target.value)}
                        placeholder="Company legal name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="businessField">Business Field *</Label>
                    <Input
                      id="businessField"
                      name="businessField"
                      value={formData.businessField}
                      onChange={e => handleInputChange('businessField', e.target.value)}
                      placeholder="Main business field"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companyAddress">Company Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="companyAddress"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={e => handleInputChange('companyAddress', e.target.value)}
                        placeholder="Complete company address"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provinceId">Province *</Label>
                      <Input
                        id="provinceId"
                        name="provinceId"
                        value={formData.provinceId}
                        onChange={e => handleInputChange('provinceId', e.target.value)}
                        placeholder="Province"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="kabupatenId">Kabupaten/Kota *</Label>
                      <Input
                        id="kabupatenId"
                        name="kabupatenId"
                        value={formData.kabupatenId}
                        onChange={e => handleInputChange('kabupatenId', e.target.value)}
                        placeholder="Kabupaten/Kota"
                        required
                      />
                    </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="kecamatan">Kecamatan *</Label>
                      <Input
                        id="kecamatan"
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={e => handleInputChange('kecamatan', e.target.value)}
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
                        onChange={e => handleInputChange('kelurahan', e.target.value)}
                        placeholder="Kelurahan"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={e => handleInputChange('postalCode', e.target.value)}
                        placeholder="Postal code"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nibNumber">NIB Number</Label>
                      <Input
                        id="nibNumber"
                        name="nibNumber"
                        value={formData.nibNumber}
                        onChange={e => handleInputChange('nibNumber', e.target.value)}
                        placeholder="Business Registration Number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="npwpNumber">NPWP Number</Label>
                    <Input
                      id="npwpNumber"
                      name="npwpNumber"
                      value={formData.npwpNumber}
                      onChange={e => handleInputChange('npwpNumber', e.target.value)}
                      placeholder="Tax ID number"
                    />
                  </div>
                </div>
              )}
              
              {/* Step 3: Person in Charge */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="picFullName">Person in Charge Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="picFullName"
                        name="picFullName"
                        value={formData.picFullName}
                        onChange={e => handleInputChange('picFullName', e.target.value)}
                        placeholder="Full name of person in charge"
                        className="pl-10"
                        required
                      />
                    </div>
                  
                  <div>
                    <Label htmlFor="picIdNumber">ID Number (KTP) *</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="picIdNumber"
                        name="picIdNumber"
                        value={formData.picIdNumber}
                        onChange={e => handleInputChange('picIdNumber', e.target.value)}
                        placeholder="16-digit ID number"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="picPhoneNumber">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="picPhoneNumber"
                        name="picPhoneNumber"
                        value={formData.picPhoneNumber}
                        onChange={e => handleInputChange('picPhoneNumber', e.target.value)}
                        placeholder="+62..."
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="picPosition">Position *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="picPosition"
                        name="picPosition"
                        value={formData.picPosition}
                        onChange={e => handleInputChange('picPosition', e.target.value)}
                        placeholder="Position of person in charge"
                        className="pl-10"
                        required
                      />
                    </div>
                  
                  <div>
                    <Label htmlFor="picAddress">Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="picAddress"
                        name="picAddress"
                        value={formData.picAddress}
                        onChange={e => handleInputChange('picAddress', e.target.value)}
                        placeholder="Complete address of person in charge"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Purpose & Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maksudTujuan">Purpose of Registration</Label>
                    <Input
                      id="maksudTujuan"
                      name="maksudTujuan"
                      value={formData.maksudTujuan}
                      onChange={e => handleInputChange('maksudTujuan', e.target.value)}
                      placeholder="Reason for registration"
                    />
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Review Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Full Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Company:</span> {formData.companyName}</p>
                      <p><span className="font-medium">Business Field:</span> {formData.businessField}</p>
                      <p><span className="font-medium">Address:</span> {formData.companyAddress}</p>
                      <p><span className="font-medium">PIC:</span> {formData.picFullName}</p>
                    </div>
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
                
                <Button 
                  onClick={handleNext} 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : currentStep === steps.length ? 'Submit Registration' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewPublicRegister;