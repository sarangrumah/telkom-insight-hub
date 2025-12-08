import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, User, Phone, Building2, MapPin, Briefcase, IdCard, Hash, Map, Home, Globe, DollarSign } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SimpleRegistrationReplacement: React.FC = () => {
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
  
  const [documents, setDocuments] = useState({
    profile_picture: null as File | null,
    nib_document: null as File | null,
    npwp_document: null as File | null,
    akta_document: null as File | null,
    ktp_document: null as File | null,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div>
                    <Label htmlFor="business_field">Business Field *</Label>
                    <Select name="business_field" value={formData.business_field} onValueChange={(value) => handleInputChange({ target: { name: 'business_field', value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select business field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="internet_service_provider">Internet Service Provider</SelectItem>
                        <SelectItem value="data_center">Data Center</SelectItem>
                        <SelectItem value="network_infrastructure">Network Infrastructure</SelectItem>
                        <SelectItem value="equipment">Equipment Supplier</SelectItem>
                        <SelectItem value="software">Software Development</SelectItem>
                        <SelectItem value="consulting">IT Consulting</SelectItem>
                        <SelectItem value="cloud">Cloud Services</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
            
            {/* Person in Charge */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Person in Charge</h3>
              
              <div className="space-y-4">
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
              <Textarea
                id="maksud_tujuan"
                name="maksud_tujuan"
                value={formData.maksud_tujuan}
                onChange={handleInputChange}
                placeholder="Reason for registration"
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

export default SimpleRegistrationReplacement;