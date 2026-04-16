import React, { useState } from 'react';

const RegistrationFormFinal: React.FC = () => {
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

  const steps = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Company Information' },
    { id: 3, title: 'Person in Charge' },
    { id: 4, title: 'Upload Documents' },
    { id: 5, title: 'Review & Submit' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = () => {
    // Form submission logic would go here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Company Registration</h1>
        
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
                    {step.id}
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
        
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Create a strong password"
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
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
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
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Company legal name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Your Position in Company *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Your role in the company"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Purpose of Registration *</label>
              <input
                type="text"
                name="maksud_tujuan"
                value={formData.maksud_tujuan}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Reason for registration"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Company Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Complete company address"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Province *</label>
                <select
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
                <label className="block text-sm font-medium mb-1">Kabupaten/Kota *</label>
                <select
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
                <label className="block text-sm font-medium mb-1">Kecamatan *</label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Kecamatan"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kelurahan *</label>
                <input
                  type="text"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Kelurahan"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
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
              <label className="block text-sm font-medium mb-1">Person in Charge Full Name *</label>
              <input
                type="text"
                name="pic_full_name"
                value={formData.pic_full_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Full name of PIC"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ID Number (KTP) *</label>
              <input
                type="text"
                name="pic_id_number"
                value={formData.pic_id_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="16-digit ID number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                name="pic_phone_number"
                value={formData.pic_phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="+62..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Position *</label>
              <input
                type="text"
                name="pic_position"
                value={formData.pic_position}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Position of PIC"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                name="pic_address"
                value={formData.pic_address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Complete address of PIC"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Province *</label>
                <select
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
                <label className="block text-sm font-medium mb-1">Kabupaten/Kota *</label>
                <select
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
                <label className="block text-sm font-medium mb-1">Kecamatan *</label>
                <input
                  type="text"
                  name="pic_kecamatan"
                  value={formData.pic_kecamatan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Kecamatan"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kelurahan *</label>
                <input
                  type="text"
                  name="pic_kelurahan"
                  value={formData.pic_kelurahan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Kelurahan"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <input
                type="text"
                name="pic_postal_code"
                value={formData.pic_postal_code}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Postal code"
                required
              />
            </div>
          </div>
        )}
        
        {/* Step 4: Document Upload */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">NIB (Nomor Induk Berusaha) *</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">NPWP (Tax ID) *</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Company Deed (Akta Pendirian) *</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">KTP of Person in Charge *</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Assignment Letter</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full p-2 border rounded"
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
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm">
                By submitting this registration, you confirm that all information provided is accurate and complete. 
                You agree to comply with all applicable regulations and terms of service.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <button 
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentStep < steps.length ? (
            <button 
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationFormFinal;