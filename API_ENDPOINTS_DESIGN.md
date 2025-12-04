# API Endpoints Design for Registration and Verification Workflow

## Overview
This document outlines the API endpoints needed to support the registration process with document upload and the subsequent verification workflow.

## Authentication and Authorization
All endpoints requiring user authentication will use Supabase's built-in authentication system with JWT tokens.

## Registration Endpoints

### 1. Register with Documents
```
POST /api/auth/register-with-documents
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "company_name": "PT ABC Company",
  "phone": "+6281234567890",
  "position": "CEO",
  "maksud_tujuan": "Business registration",
  "address": "Jalan Sudirman No. 123",
  "province_id": "uuid-of-province",
  "kabupaten_id": "uuid-of-kabupaten",
  "kecamatan": "Kecamatan Example",
  "kelurahan": "Kelurahan Example",
  "postal_code": "12345",
  "documents": [
    {
      "type": "nib",
      "file_path": "https://storage-url/nib-document.pdf",
      "file_name": "nib-document.pdf",
      "file_size": 123456,
      "mime_type": "application/pdf"
    },
    {
      "type": "npwp",
      "file_path": "https://storage-url/npwp-document.pdf",
      "file_name": "npwp-document.pdf",
      "file_size": 234567,
      "mime_type": "application/pdf"
    },
    {
      "type": "akta",
      "file_path": "https://storage-url/akta-document.pdf",
      "file_name": "akta-document.pdf",
      "file_size": 345678,
      "mime_type": "application/pdf"
    }
  ],
  "pic_details": {
    "full_name": "Jane Doe",
    "id_number": "1234567890123456",
    "phone_number": "+6281234567891",
    "position": "Director",
    "address": "Jalan Gatot Subroto No. 456",
    "province_id": "uuid-of-province",
    "kabupaten_id": "uuid-of-kabupaten",
    "kecamatan": "Kecamatan Example",
    "kelurahan": "Kelurahan Example",
    "postal_code": "12345"
  },
  "pic_documents": [
    {
      "type": "ktp",
      "file_path": "https://storage-url/ktp-document.pdf",
      "file_name": "ktp-document.pdf",
      "file_size": 456789,
      "mime_type": "application/pdf"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for confirmation.",
  "company_id": "uuid-of-created-company",
  "user_id": "uuid-of-created-user"
}
```

### 2. Upload Temporary Document
```
POST /api/documents/upload-temp
```

#### Request Headers
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

#### Request Body (FormData)
- `file`: File to upload
- `document_type`: Type of document (nib, npwp, akta, ktp, assignment_letter)

#### Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "file_path": "https://storage-url/temp/document.pdf",
  "file_name": "document.pdf",
  "file_size": 123456,
  "mime_type": "application/pdf"
}
```

## Verification Status Endpoints

### 3. Get Verification Status
```
GET /api/auth/verification-status
```

#### Response
```json
{
  "success": true,
  "status": "pending_verification", // pending_verification, verified, rejected, needs_correction
  "company": {
    "id": "uuid-of-company",
    "company_name": "PT ABC Company",
    "nib_number": "123456789012345",
    "npwp_number": "12.345.678.9-012.345",
    "status": "pending_verification",
    "correction_notes": null,
    "correction_status": null
  },
  "user": {
    "id": "uuid-of-user",
    "full_name": "John Doe",
    "email": "user@example.com",
    "phone": "+6281234567890",
    "is_validated": false
  },
  "documents": [
    {
      "id": "uuid-of-document",
      "document_type": "nib",
      "file_name": "nib-document.pdf",
      "uploaded_at": "2025-08-05T10:42:53.114851+00:00"
    }
  ],
  "notification_message": "Your registration is under review. Please wait for verification."
}
```

### 4. Check Access Permission
```
GET /api/auth/access-permission
```

#### Response
```json
{
  "success": true,
  "can_access_dashboard": false,
  "can_submit_data": false,
  "can_submit_certificates": false,
  "can_view_company_data": false,
  "access_level": "limited", // none, limited, full
  "status": "pending_verification",
  "next_steps": [
    "Wait for verification by data processor",
    "Check email for updates"
  ]
}
```

## Company Management Endpoints

### 5. Complete Company Data
```
PUT /api/companies/{company_id}/complete-data
```

#### Request Body
```json
{
  "company_address": "Complete company address",
  "business_field": "Telecommunications",
  "company_type": "pt", // pt, cv, ud, koperasi, yayasan, other
  "akta_number": "AKTA-2025-001",
  "kecamatan": "Kecamatan Example",
  "kelurahan": "Kelurahan Example",
  "postal_code": "12345"
}
```

#### Response
```json
{
  "success": true,
  "message": "Company data completed successfully",
  "company_id": "uuid-of-company"
}
```

### 6. Submit Corrections
```
PUT /api/companies/{company_id}/submit-corrections
```

#### Request Body
```json
{
  "updated_data": {
    "company_name": "PT Updated Company Name",
    "nib_number": "Updated NIB number",
    "correction_notes": {
      "company_name": "Updated company name as requested",
      "nib_number": "Updated NIB number with correct format"
    }
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Corrections submitted successfully",
  "company_id": "uuid-of-company",
  "status": "pending_verification"
}
```

## Certificate Submission Endpoints

### 7. Submit Certificate Document
```
POST /api/certificates/submit
```

#### Request Body
```json
{
  "company_id": "uuid-of-company",
  "document_type": "certificate_type",
  "file_path": "https://storage-url/certificate.pdf",
  "file_name": "certificate.pdf",
  "file_size": 123456,
  "mime_type": "application/pdf"
}
```

#### Response
```json
{
  "success": true,
  "message": "Certificate submitted successfully",
  "certificate_id": "uuid-of-certificate"
}
```

### 8. Get Available Companies for User
```
GET /api/companies/user-companies
```

#### Response
```json
{
  "success": true,
  "companies": [
    {
      "id": "uuid-of-company",
      "company_name": "PT ABC Company",
      "status": "verified",
      "created_at": "2025-08-05T10:42:53.114851+00:00"
    }
  ]
}
```

## Admin Verification Endpoints

### 9. Get Pending Registrations (Data Processor/Internal Admin)
```
GET /api/admin/pending-registrations
```

#### Response
```json
{
  "success": true,
  "registrations": [
    {
      "id": "uuid-of-company",
      "company_name": "PT ABC Company",
      "email": "user@example.com",
      "phone": "+6281234567890",
      "status": "pending_verification",
      "created_at": "2025-08-05T10:42:53.114851+00:00",
      "document_count": 3,
      "pic_count": 1
    }
  ]
}
```

### 10. Approve Company (Internal Admin)
```
POST /api/admin/companies/{company_id}/approve
```

#### Request Body
```json
{
  "notes": "All documents verified and approved"
}
```

#### Response
```json
{
  "success": true,
  "message": "Company approved successfully",
  "company_id": "uuid-of-company"
}
```

### 11. Reject Company (Internal Admin)
```
POST /api/admin/companies/{company_id}/reject
```

#### Request Body
```json
{
  "rejection_notes": "Documents do not meet requirements, please resubmit with corrected information"
}
```

#### Response
```json
{
  "success": true,
  "message": "Company rejected",
  "company_id": "uuid-of-company"
}
```

### 12. Request Company Correction (Internal Admin)
```
POST /api/admin/companies/{company_id}/request-correction
```

#### Request Body
```json
{
  "correction_notes": {
    "nib_number": "NIB number format is incorrect",
    "npwp_number": "NPWP number does not match company name"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Correction requested",
  "company_id": "uuid-of-company",
  "status": "needs_correction"
}
```

## Implementation Notes

### Security Considerations
1. All endpoints should validate JWT tokens
2. Document upload endpoints should validate file types and sizes
3. Company data endpoints should verify user ownership
4. Admin endpoints should validate user roles

### Validation Rules
1. Required documents: NIB, NPWP, Akta
2. File size limits: 10MB per document
3. File types: PDF only for documents, JPG/PNG for profile pictures
4. Company name and NIB number must be unique

### Error Handling
1. Standardized error response format
2. Appropriate HTTP status codes
3. Detailed error messages for client-side handling

### Rate Limiting
1. Registration attempts: 5 per hour per IP
2. Document uploads: 10 per minute per user
3. Status checks: 60 per minute per user