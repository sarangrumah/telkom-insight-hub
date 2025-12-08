import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { User, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const CompanyProfileCompletionForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Company Information', icon: Building },
    { id: 2, title: 'Person in Charge', icon: User },
    { id: 3, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const completeRegistrationMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('app.jwt.token');
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete registration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      alert('Registration completed successfully! Your company information has been submitted for verification.');
      // Redirect to dashboard
      navigate('/dashboard');
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
    completeRegistrationMutation.mutate();
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
          <CardTitle>Complete Your Registration</CardTitle>
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
          
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
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
          
          {/* Step 2: Person in Charge */}
          {currentStep === 2 && (
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
          
          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Review Your Information</h3>
              
              <div className="border rounded-lg p-4 space-y-4">
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
              </div>
              
              <Alert>
                <AlertDescription>
                  By submitting this information, you confirm that all information provided is accurate and complete.
                  You agree to comply with all applicable regulations and terms of service.
                  Your registration will be submitted for verification.
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
                disabled={isSubmitting || completeRegistrationMutation.isPending}
              >
                {isSubmitting || completeRegistrationMutation.isPending ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfileCompletionForm;