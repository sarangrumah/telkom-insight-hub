import React, { useState } from 'react';

const FinalValidRegistration: React.FC = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.email || !formData.full_name || !formData.company_name) {
      setError('Please fill in all required fields');
      return;
    }
    
    // In a real implementation, we would submit to the API
    alert('Registration submitted successfully!');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Enhanced Company Registration</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company Address *</label>
            <textarea
              name="company_address"
              value={formData.company_address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">NIB Number</label>
              <input
                type="text"
                name="nib_number"
                value={formData.nib_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">NPWP Number</label>
              <input
                type="text"
                name="npwp_number"
                value={formData.npwp_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Person in Charge Full Name *</label>
            <input
              type="text"
              name="pic_full_name"
              value={formData.pic_full_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PIC ID Number *</label>
              <input
                type="text"
                name="pic_id_number"
                value={formData.pic_id_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">PIC Phone Number *</label>
              <input
                type="tel"
                name="pic_phone_number"
                value={formData.pic_phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Purpose of Registration</label>
            <textarea
              name="maksud_tujuan"
              value={formData.maksud_tujuan}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Register Company
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinalValidRegistration;