import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, User, Phone, Building2, MapPin, Briefcase, IdCard, Hash } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const MinimalEnhancedRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    company_name: '',
    company_address: '',
    npwp_number: '',
    nib_number: '',
    pic_full_name: '',
    pic_id_number: '',
    pic_phone_number: '',
    maksud_tujuan: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      const response = await fetch('/api/auth/register-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: () => {
      alert('Registration successful! Please check your email for confirmation.');
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.email || !formData.full_name || !formData.company_name || !formData.pic_full_name) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    registerMutation.mutate();
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enhanced Company Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
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
            </div>
            
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Information</h3>
              
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
                  <Label htmlFor="company_address">Company Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="company_address"
                      name="company_address"
                      value={formData.company_address}
                      onChange={handleInputChange}
                      placeholder="Complete company address"
                      className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="npwp_number">NPWP Number</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                </div>
              </div>
            
            {/* Person in Charge */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Person in Charge</h3>
              
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
              </div>
            </div>
            
            {/* Additional Information */}
            <div>
              <Label htmlFor="maksud_tujuan">Purpose of Registration</Label>
              <textarea
                id="maksud_tujuan"
                name="maksud_tujuan"
                value={formData.maksud_tujuan}
                onChange={handleInputChange}
                placeholder="Reason for registration"
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending ? 'Submitting...' : 'Register Company'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalEnhancedRegistration;