# Registration and Verification Workflow Implementation Plan

## Overview
This document outlines the implementation plan for a multi-stage registration and verification workflow that includes profile uploads, document verification, and access controls based on verification status.

## Current System Analysis
The existing system already has:
- User management with role-based access control
- Company management with status tracking
- Document storage and management
- Profile and PIC (Person in Charge) management
- Verification workflows with approval/rejection capabilities
- Notification systems via tickets
- Regional data support (provinces, kabupaten, kecamatan, kelurahan)

## Required Modifications and Enhancements

### 1. Registration Form Customization

#### Profile Upload Requirements
- **Profile Picture**: Single image file (JPG/PNG) with size limit of 5MB
- **Required fields during registration**:
  - Full name
  - Phone number
  - Company name
  - Position in company

#### Document Upload Requirements
- **PDF Document Types**:
  - NIB (Nomor Induk Berusaha) Certificate
  - NPWP (Tax ID) Certificate
  - Company Deed (Akta Pendirian)
  - Identity Card (KTP) of Person in Charge
  - Assignment Letter for Person in Charge

#### Registration Form Fields
The registration form should collect:
- Basic user information (name, email, phone)
- Company details (name, address, business field)
- Province/Kabupaten/Kecamatan/Kelurahan selection
- Document uploads with validation
- Agreement to terms and conditions

### 2. API Endpoints for Registration with Document Upload

#### New Endpoints Required
```
POST /api/auth/register-with-documents
- Handles user registration with document uploads
- Validates required documents
- Creates company record with pending status
- Initiates verification workflow

GET /api/auth/verification-status
- Returns current verification status
- Provides notification messages based on status

POST /api/documents/upload-temp
- Allows document upload during registration
- Stores temporarily until verification complete
```

### 3. User Validation Workflow

#### Verification Process
1. **Initial Registration**: User submits profile and documents
2. **Pending Verification**: System sets status to `pending_verification`
3. **Data Processor Review**: Documents reviewed by data processor role
4. **Internal Admin Review**: Final verification by internal admin
5. **Status Updates**: Notifications sent at each stage

#### Roles Involved
- **Data Processor** (`pengolah_data`): Reviews initial documents
- **Internal Admin** (`internal_admin`): Performs final verification
- **Super Admin** (`super_admin`): Oversight and special approvals

### 4. Frontend Components for Registration

#### Registration Form Component
- Multi-step form with validation
- File upload interface with progress indicators
- Real-time validation feedback
- Document preview functionality

#### Verification Status Dashboard
- Shows current verification status
- Lists required documents
- Provides timeline of verification process
- Shows notification messages

### 5. Verification Status Checks and Notifications

#### Status-Based Access Control
- **Unverified Users**: Limited access, notification overlay
- **Pending Verification**: Access to profile view only
- **Verified Users**: Full access to system features

#### Notification System
- In-app notifications showing verification status
- Email notifications for verification updates
- Dashboard alerts for pending actions

### 6. Company Management System

#### Data Completion Workflow
- Pre-populated company information from registration
- Ability to edit/add missing company details
- Validation of required fields before completion

#### Company Status Lifecycle
- `pending_verification` → `verified`/`rejected`/`needs_correction`
- `needs_correction` → `pending_verification` (after user updates)
- `verified` → `suspended` (administrative action)

### 7. Certificate Document Submission

#### Certificate Management
- Separate submission process after verification
- Different document types for certificates
- Linking to company records
- Approval workflow for certificates

### 8. Access Control Implementation

#### Permission Matrix
| Status | Access Level | Restrictions |
|--------|--------------|--------------|
| Guest | FAQ only | No data access |
| Pending Verification | Profile view only | No data submission |
| Needs Correction | Limited access | Must complete corrections |
| Verified | Full access | Normal operations |
| Suspended | No access | Blocked completely |

#### Route Protection
- Middleware to check verification status
- Redirect to verification status page if not verified
- Display appropriate notifications based on status

### 9. Admin Interfaces for Verification

#### Data Processor Interface
- View pending registrations
- Review submitted documents
- Approve/reject with notes
- Flag for internal admin review

#### Internal Admin Interface
- Final verification approval
- Company data validation
- Issue verification certificates
- Manage user roles post-verification

### 10. Technical Implementation Details

#### Database Changes (if needed)
The existing schema already supports the required functionality, but we may need to:
- Add specific document validation rules
- Enhance status tracking with more granular states
- Improve indexing for verification-related queries

#### Backend Logic
- Custom Supabase functions for verification workflow
- RLS policies to enforce access controls
- Triggers for status updates and notifications

#### Frontend Logic
- React components for registration workflow
- State management for verification status
- File upload handling with validation
- Notification system integration

## Implementation Phases

### Phase 1: Registration Enhancement
- Customize registration form fields
- Implement document upload validation
- Create temporary document storage
- Set up initial company creation

### Phase 2: Verification Workflow
- Implement verification status checks
- Create admin interfaces for document review
- Develop notification system
- Add access control middleware

### Phase 3: Data Completion & Certificate Submission
- Complete company management features
- Implement certificate submission workflow
- Finalize access controls based on completion status
- Testing and optimization

## Security Considerations
- Ensure document uploads are properly validated and sanitized
- Implement rate limiting for registration attempts
- Secure document storage with appropriate permissions
- Validate file types and sizes before upload
- Implement proper session management during verification

## Testing Strategy
- Unit tests for verification workflow
- Integration tests for document upload and validation
- End-to-end tests for complete registration process
- Security tests for access control mechanisms
- Performance tests for document storage and retrieval

This plan leverages the existing robust architecture while implementing the specific requirements for the multi-stage registration and verification workflow.