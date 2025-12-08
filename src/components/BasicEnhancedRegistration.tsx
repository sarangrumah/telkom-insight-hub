import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, User, Phone, Building2, MapPin, Briefcase, IdCard, Hash, Map, Home, Globe, DollarSign } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const BasicEnhancedRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    position: '',
    company_name: '',
    company_type: '',
    business_field: '',
    company_address: '',
    province_id: '',
    kabupaten_id: '',
    kecamatan: '',
    kelurahan: '',
    postal_code: '',
    company_phone: '',
    company_email: '',
    npwp_number: '',
    nib_number: '',
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
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/register-with-details', {
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
            
            {/* Personal Information Section */}
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
              </div>
            </div>
            
            {/* Company Information Section */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_type">Company Type *</Label>
                    <select
                      id="company_type"
                      name="company_type"
                      value={formData.company_type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select business field</option>
                      <option value="telecommunications">Telecommunications Services</option>
                      <option value="internet_service_provider">Internet Service Provider</option>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="province_id">Province *</Label>
                    <select
                      id="province_id"
                      name="province_id"
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                </div>
                
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
              </div>
            </div>
            
            {/* Person in Charge Section */}
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
                      <textarea
                        id="pic_address"
                        name="pic_address"
                        value={formData.pic_address}
                        onChange={handleInputChange}
                        placeholder="Complete address of PIC"
                        className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        rows={3}
                      />
                    </div>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pic_province_id">Province *</Label>
                    <select
                      id="pic_province_id"
                      name="pic_province_id"
                      value={formData.pic_province_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    <Label htmlFor="pic_kabupaten_id">Kabupaten/Kota *</Label>
                    <select
                      id="pic_kabupaten_id"
                      name="pic_kabupaten_id"
                      value={formData.pic_kabupaten_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Kabupaten/Kota</option>
                      <option value="bandung">Bandung</option>
                      <option value="jakarta_pusat">Jakarta Pusat</option>
                      <option value="surabaya">Surabaya</option>
                      <option value="semarang">Semarang</option>
                    </select>
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

export default BasicEnhancedRegistration;