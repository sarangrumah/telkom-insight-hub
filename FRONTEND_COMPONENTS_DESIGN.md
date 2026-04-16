# Frontend Components Design

## Enhanced Registration Form Component

### Overview
The Enhanced Registration Form component provides a comprehensive multi-step registration process for companies to register with the telecommunications panel. This replaces the simple registration flow with a complex, data-rich registration experience.

### Key Features
- Multi-step registration process (6 steps)
- Comprehensive data collection for business registration
- Advanced document upload with validation
- Real-time password strength indicator
- Detailed company and business information capture
- Person in charge information collection
- Document validation and security measures

### Component Structure

#### Step 1: Personal Information
- Email and password fields with strength indicator
- Full name and contact information
- Position in company

#### Step 2: Company Information
- Company name and type selection
- Business field specification
- Complete company address with location hierarchy (province, kabupaten, kecamatan, kelurahan)
- Contact information and business identifiers (NPWP, NIB, etc.)

#### Step 3: Business Details
- Business activity description
- Business scale classification
- Establishment year and employee count
- Revenue information
- Business license details

#### Step 4: Person in Charge
- Complete information for the person responsible for the company
- Address and contact details with location hierarchy
- Identity verification information

#### Step 5: Document Upload
- Multiple document types with specific validation
- Profile picture upload
- Business registration documents (NIB, NPWP, Company Deed, KTP)
- Optional supporting documents

#### Step 6: Review and Submission
- Complete information summary
- Purpose of registration field
- Terms and conditions confirmation

### Technical Implementation
- Built with React and TypeScript
- Uses Radix UI components for accessibility
- Implements form validation at each step
- Responsive design with mobile support
- Integration with Supabase for authentication and storage
- File upload with progress tracking and validation

### Security Measures
- Input sanitization and validation
- File type and size restrictions
- XSS prevention through input sanitization
- Secure file uploads to Supabase storage
- Password strength requirements

### Data Collection Fields
The form collects comprehensive business information including:
- Personal information (email, name, contact details)
- Company details (name, type, address, business field)
- Business information (activity, scale, establishment year, revenue)
- Person in charge details (full information with address)
- Multiple document types for verification
- Additional notes and purpose of registration

### Validation Rules
- Required field validation at each step
- Email format validation
- Phone number format validation (Indonesian format)
- Password strength requirements (minimum 6 characters with complexity)
- Document format and size validation (PDF only for documents, images allowed for profile pictures)
- Year validation (establishment year must be reasonable)
- Employee count validation (non-negative integers)

### User Experience Features
- Progress indicator showing current step
- Step-by-step navigation with validation
- Real-time feedback and error messages
- Password strength meter
- Drag and drop file upload
- Document preview and management
- Summary review before submission