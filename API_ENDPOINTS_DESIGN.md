# API Endpoints Design

## Registration Endpoints

### POST /api/auth/register-with-documents

Registers a new company with comprehensive business information and document uploads.

#### Request
- Method: POST
- Endpoint: `/api/auth/register-with-documents`
- Headers: 
  - Authorization: Bearer token (when applicable)
- Body: Multipart form data containing both form fields and file uploads

#### Form Fields (Body Parameters)
- **Personal Information:**
  - `email` (string, required): Valid email address
  - `password` (string, required): User password (min 6 chars)
  - `full_name` (string, required): User's full name
  - `phone` (string, required): Indonesian phone number format
  - `position` (string, optional): User's position in the company

- **Company Information:**
  - `company_name` (string, required): Legal company name
  - `company_type` (string, required): Company type (pt, cv, firma, koperasi, umkm)
  - `business_field` (string, required): Primary business field
  - `business_subfield` (string, optional): Specific business subfield
  - `company_address` (string, required): Complete company address
  - `province_id` (string, required): Province identifier
  - `kabupaten_id` (string, required): Kabupaten/Kota identifier
  - `kecamatan` (string, required): District identifier
  - `kelurahan` (string, required): Village identifier
  - `postal_code` (string, required): Postal code
  - `company_phone` (string, optional): Company phone number
  - `company_email` (string, optional): Company email
  - `company_website` (string, optional): Company website URL

- **Business Details:**
  - `business_activity` (string, required): Description of business activities
  - `business_scale` (string, required): Business scale classification
  - `business_established_year` (number, required): Year of establishment
  - `employee_count` (number, optional): Number of employees
  - `annual_revenue` (string, optional): Annual revenue amount
  - `business_license_type` (string, optional): Type of business license
  - `business_license_number` (string, optional): Business license number
  - `business_license_expiry` (string, optional): License expiry date
  - `npwp_number` (string, optional): Tax ID number
  - `nib_number` (string, optional): Business registration number
  - `akta_number` (string, optional): Company deed number
  - `akta_date` (string, optional): Company deed date

- **Person in Charge Information:**
  - `pic_full_name` (string, required): Person in charge full name
  - `pic_id_number` (string, required): ID card number (16 digits)
  - `pic_phone_number` (string, required): PIC phone number
  - `pic_position` (string, required): PIC position
  - `pic_address` (string, required): PIC address
  - `pic_province_id` (string, required): PIC province
  - `pic_kabupaten_id` (string, required): PIC kabupaten/kota
  - `pic_kecamatan` (string, required): PIC district
  - `pic_kelurahan` (string, required): PIC village
  - `pic_postal_code` (string, required): PIC postal code

- **Additional Information:**
  - `maksud_tujuan` (string, optional): Purpose of registration
  - `verification_notes` (string, optional): Additional verification notes

#### File Uploads (Multipart Form Data)
- `profile_picture` (file, required): Professional photo of main contact (image/*)
- `nib_document` (file, required): NIB (business registration) document (application/pdf)
- `npwp_document` (file, required): NPWP (tax ID) document (application/pdf)
- `akta_document` (file, required): Company deed document (application/pdf)
- `ktp_document` (file, required): KTP of person in charge (application/pdf)
- `assignment_letter` (file, optional): Assignment letter document (application/pdf)
- `business_license_document` (file, optional): Business license document (application/pdf)
- `company_stamp` (file, optional): Company stamp/surat kuasa (application/pdf)
- `company_certificate` (file, optional): Company certificate (application/pdf)

#### Response
- Success Response:
  - Status: 200 OK
  - Body: 
    ```json
    {
      "success": true,
      "message": "Registration successful. Please check your email for confirmation.",
      "company_id": "string",
      "user_id": "string",
      "timestamp": "ISO date string"
    }
    ```

- Error Responses:
  - 400 Bad Request: Missing required fields or validation errors
  - 409 Conflict: Email already registered
  - 500 Internal Server Error: Server-side errors

#### Security Features
- Input sanitization to prevent XSS attacks
- File type and size validation (max 10MB per file)
- PDF signature validation for document authenticity
- Rate limiting to prevent spam registrations
- IP address logging for audit trails
- User agent tracking for security monitoring

#### Data Processing
- Creates user account in Supabase authentication
- Stores company information in companies table
- Links user profile to company in user_profiles table
- Processes and stores document uploads in Supabase storage
- Associates documents with company in company_documents table
- Creates person in charge record in person_in_charge table
- Logs registration activity for audit purposes

### POST /api/auth/complete-registration

Completes registration for users who signed up via public registration form.

#### Request
- Method: POST
- Endpoint: `/api/auth/complete-registration`
- Headers:
  - Authorization: Bearer token (required)
- Body: JSON object with company and PIC information

#### Response
- Success Response:
  - Status: 200 OK
  - Body:
    ```json
    {
      "success": true,
      "message": "Company and PIC information completed successfully.",
      "company_id": "string",
      "user_id": "string"
    }