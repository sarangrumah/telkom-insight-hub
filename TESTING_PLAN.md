# Complete Workflow Testing Plan

## Overview
This document outlines the comprehensive testing plan for the registration and verification workflow, covering all aspects from user signup with document upload to certificate submission.

## Testing Scope

### 1. Registration Process Tests

#### 1.1 Profile Upload and Validation
- **Test Case**: User registers with profile picture and PDF documents
- **Preconditions**: 
  - User accesses registration page
  - Required fields are displayed
- **Steps**:
  1. Fill in registration form with required information
  2. Upload profile picture (JPG/PNG, <5MB)
  3. Upload required PDF documents (NIB, NPWP, Akta, KTP PIC, Assignment Letter)
  4. Submit registration form
- **Expected Results**:
  - Form validation passes for all required fields
  - File validation passes (correct formats and sizes)
  - Registration is submitted successfully
  - Company status is set to 'pending_verification'

#### 1.2 Document Upload Validation
- **Test Case**: Verify document upload constraints
- **Test Scenarios**:
  - Upload documents larger than 10MB (should fail)
  - Upload non-PDF files (should fail)
  - Upload valid PDF files (should succeed)
  - Upload documents with correct naming conventions
  - Upload documents without required fields (should fail)

#### 1.3 Registration with Missing Information
- **Test Case**: Registration fails with incomplete information
- **Test Scenarios**:
  - Missing required fields (should show validation errors)
  - Missing mandatory documents (should prevent submission)
  - Invalid email format (should show error)
  - Invalid phone number format (should show error)

### 2. Verification Workflow Tests

#### 2.1 Data Processor Verification Process
- **Test Case**: Data processor reviews pending company registrations
- **Preconditions**:
  - Data processor is logged in
  - Pending companies exist in the system
- **Steps**:
  1. Log in as data processor
  2. Navigate to pending companies dashboard
  3. Review company details and documents
  4. Request corrections if needed
  5. Approve for internal admin review if valid
- **Expected Results**:
  - Data processor can only see assigned/unassigned companies
  - Document review functionality works properly
  - Correction requests are recorded in system
  - Valid companies are passed to internal admin

#### 2.2 Internal Admin Verification Process
- **Test Case**: Internal admin approves/rejects company registrations
- **Preconditions**:
  - Internal admin is logged in
  - Companies are pending final verification
- **Steps**:
  1. Log in as internal admin
  2. Review pending companies
  3. Verify company information and documents
  4. Approve or reject company
  5. Add verification notes if applicable
- **Expected Results**:
  - Only internal admins/super admins can approve companies
  - Approval sets company status to 'verified'
  - Rejection sets company status to 'rejected' with notes
  - Notification is sent to user about decision

#### 2.3 Company Status Transitions
- **Test Case**: Verify proper status transitions during verification
- **Test Scenarios**:
  - Unregistered → Pending Verification → Verified
  - Pending Verification → Needs Correction → Pending Verification → Verified
  - Pending Verification → Rejected
  - Verified → Suspended (admin action)

### 3. Access Control Tests

#### 3.1 Verification-Based Access Control
- **Test Case**: Users have appropriate access based on verification status
- **Test Scenarios**:
  - Unverified users: Limited access, notification overlay
  - Pending verification users: Profile view only, limited features
  - Verified users: Full access to all features
  - Rejected users: No access to main features

#### 3.2 Role-Based Access Control
- **Test Case**: Different roles have appropriate permissions
- **Test Scenarios**:
  - Super admin: Full access to all features
  - Internal admin: Verification and management access
  - Data processor: Document review access
  - Company admin: Company-specific access
  - Regular user: Limited to own data access

### 4. Company Management Tests

#### 4.1 Company Data Completion
- **Test Case**: Verified users can complete company information
- **Preconditions**:
  - Company is verified
  - User is company admin
- **Steps**:
  1. Log in as verified company admin
  2. Navigate to company management
  3. Complete missing company information
  4. Save changes
- **Expected Results**:
  - Form accepts updates for verified companies
  - Data is saved correctly in database
  - Validation ensures required fields are complete

#### 4.2 Company Information Validation
- **Test Case**: Company information meets all requirements
- **Test Scenarios**:
  - Required fields validation
  - Geographic location validation (province/kabupaten)
  - Document completeness check
  - Business field validation

### 5. Certificate Submission Tests

#### 5.1 Certificate Upload Process
- **Test Case**: Verified users can submit certificate documents
- **Preconditions**:
  - Company is verified
  - User is company admin
- **Steps**:
  1. Log in as verified company admin
  2. Navigate to certificate submission
  3. Select certificate type
  4. Upload certificate document (PDF)
  5. Submit for verification
- **Expected Results**:
  - Only verified companies can submit certificates
  - Document upload validation passes
  - Certificate is stored and tracked in system
  - Status is set to 'pending_verification'

#### 5.2 Certificate Verification Process
- **Test Case**: Admin verifies submitted certificates
- **Preconditions**:
  - Certificate is submitted by verified company
  - Admin is logged in
- **Steps**:
  1. Log in as internal admin
  2. Navigate to certificate verification
  3. Review submitted certificate
  4. Approve or reject certificate
  5. Add verification notes
- **Expected Results**:
  - Certificate status updates appropriately
  - User is notified of verification decision
  - Valid certificates are approved
  - Invalid certificates are rejected with reasons

### 6. Notification System Tests

#### 6.1 Status Change Notifications
- **Test Case**: Users receive notifications about status changes
- **Test Scenarios**:
  - Registration submitted → Notification of pending status
  - Company approved → Notification of full access
  - Company rejected → Notification of rejection with reasons
  - Correction requested → Notification of required changes
  - Certificate approved/rejected → Notification of decision

#### 6.2 In-App Notifications
- **Test Case**: In-app notifications appear correctly
- **Test Scenarios**:
  - Verification status banner displays current status
  - Action-required notifications for corrections
  - Success notifications for approvals
  - Error notifications for failures

### 7. Integration Tests

#### 7.1 End-to-End Registration Flow
- **Test Case**: Complete registration from signup to verification
- **Steps**:
  1. User registers with profile and documents
  2. System sets status to pending verification
  3. Data processor reviews documents
  4. Internal admin approves company
  5. User receives verification notification
  6. User gains full access to system
- **Expected Results**:
  - All steps complete successfully
  - Data flows correctly between components
  - Status updates properly throughout process

#### 7.2 Document Management Integration
- **Test Case**: Document upload, storage, and retrieval
- **Test Scenarios**:
  - Document upload to Supabase storage
  - Document reference in database
  - Document download/view functionality
  - Document deletion for pending items
  - File size and type validation

#### 7.3 User Experience Flow
- **Test Case**: User experience from registration to certificate submission
- **Steps**:
  1. User registers with required documents
  2. User sees pending verification status
  3. User receives approval notification
  4. User completes company information
  5. User submits certificate documents
  6. User manages submitted certificates
- **Expected Results**:
  - Smooth user experience throughout process
  - Clear guidance at each step
  - Appropriate feedback and notifications

### 8. Security Tests

#### 8.1 Authentication and Authorization
- **Test Case**: Verify proper access controls
- **Test Scenarios**:
  - Unauthenticated users cannot access protected resources
  - Users cannot access other companies' data
  - Admins can only perform authorized actions
  - Document access follows security policies

#### 8.2 Data Protection
- **Test Case**: Verify sensitive data protection
- **Test Scenarios**:
  - Personal identification documents are protected
  - Company information is only accessible to authorized users
  - Verification notes are only accessible to admins
  - Audit trails are maintained for all actions

### 9. Performance Tests

#### 9.1 Database Performance
- **Test Case**: Verify database operations perform well
- **Test Scenarios**:
  - Multiple concurrent registrations
  - Bulk document uploads
  - High-volume verification requests
  - Complex queries for admin dashboards

#### 9.2 File Upload Performance
- **Test Case**: Verify file upload performance
- **Test Scenarios**:
  - Large file uploads (up to 10MB)
  - Multiple file simultaneous uploads
  - File processing speed
  - Storage space utilization

### 10. Error Handling Tests

#### 10.1 Form Validation Errors
- **Test Case**: Proper handling of form validation errors
- **Test Scenarios**:
  - Missing required fields
  - Invalid data formats
  - Duplicate company information
  - System error responses

#### 10.2 File Upload Errors
- **Test Case**: Proper handling of file upload errors
- **Test Scenarios**:
  - File size exceeded
  - Invalid file type
  - Network interruption during upload
  - Storage quota limitations

### 11. Edge Case Tests

#### 11.1 Multiple Registrations
- **Test Case**: Same user registering multiple companies
- **Test Scenarios**:
  - User can register multiple companies
  - Each company has separate verification process
  - User can manage all their companies

#### 11.2 Concurrent Verification
- **Test Case**: Multiple admins verifying companies simultaneously
- **Test Scenarios**:
  - No conflicts during concurrent reviews
  - Proper locking mechanisms
  - Consistent state updates

#### 11.3 Interruption Recovery
- **Test Case**: System recovery from interruptions
- **Test Scenarios**:
  - User session timeouts during registration
  - Network disconnections
  - Server restarts during verification process

### 12. Automated Test Implementation

#### 12.1 Backend API Tests
```javascript
// tests/registration-api.test.js
const request = require('supertest');
const app = require('../server/app');
const { createClient } = require('@supabase/supabase-js');

describe('Registration and Verification API', () => {
  let supabase;
  
  beforeAll(() => {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  });
  
  describe('POST /api/auth/register-with-documents', () => {
    test('should register user with documents successfully', async () => {
      const mockFormData = new FormData();
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('password', 'securePassword123');
      mockFormData.append('full_name', 'Test User');
      mockFormData.append('company_name', 'Test Company');
      mockFormData.append('nib_document', new File([], 'test-nib.pdf', { type: 'application/pdf' }));
      
      const response = await request(app)
        .post('/api/auth/register-with-documents')
        .send(mockFormData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.company_id).toBeDefined();
    });
    
    test('should reject registration without required documents', async () => {
      const response = await request(app)
        .post('/api/auth/register-with-documents')
        .send({
          email: 'test@example.com',
          password: 'securePassword123',
          full_name: 'Test User'
        })
        .expect(400);
        
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('GET /api/auth/verification-status', () => {
    test('should return verification status for authenticated user', async () => {
      const token = 'mock-auth-token';
      const response = await request(app)
        .get('/api/auth/verification-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.status).toBeDefined();
      expect(response.body.company).toBeDefined();
    });
  });
});

// tests/admin-verification-api.test.js
describe('Admin Verification API', () => {
  describe('GET /api/admin/pending-companies', () => {
    test('should return pending companies for admin', async () => {
      const adminToken = 'admin-auth-token';
      const response = await request(app)
        .get('/api/admin/pending-companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
        
      expect(Array.isArray(response.body.companies)).toBe(true);
    });
    
    test('should reject access for non-admin users', async () => {
      const userToken = 'regular-user-token';
      const response = await request(app)
        .get('/api/admin/pending-companies')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
        
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('POST /api/admin/companies/:id/approve', () => {
    test('should approve company when called by admin', async () => {
      const adminToken = 'admin-auth-token';
      const companyId = 'mock-company-id';
      
      const response = await request(app)
        .post(`/api/admin/companies/${companyId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Company approved' })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Company approved successfully');
    });
  });
});
```

#### 12.2 Frontend Component Tests
```tsx
// tests/RegistrationForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrationForm from '../src/components/RegistrationForm';

describe('RegistrationForm Component', () => {
  test('renders registration form with all required fields', () => {
    render(<RegistrationForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByText(/upload profile picture/i)).toBeInTheDocument();
    expect(screen.getByText(/upload documents/i)).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(<RegistrationForm />);
    
    fireEvent.click(screen.getByText(/next/i));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
  
  test('shows error for invalid file types', async () => {
    render(<RegistrationForm />);
    
    const fileInput = screen.getByLabelText(/choose file/i);
    const invalidFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(await screen.findByText(/only pdf files are allowed/i)).toBeInTheDocument();
  });
});

// tests/VerificationStatusNotification.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerificationStatusNotification from '../src/components/VerificationStatusNotification';

describe('VerificationStatusNotification Component', () => {
  test('shows pending verification status', () => {
    const mockVerificationData = {
      status: 'pending_verification',
      company_name: 'Test Company',
      notification_message: 'Your registration is under review'
    };
    
    render(<VerificationStatusNotification verificationData={mockVerificationData} />);
    
    expect(screen.getByText(/pending verification/i)).toBeInTheDocument();
    expect(screen.getByText(/your registration is under review/i)).toBeInTheDocument();
  });
  
  test('shows verified status', () => {
    const mockVerificationData = {
      status: 'verified',
      company_name: 'Test Company',
      notification_message: 'Your company has been verified'
    };
    
    render(<VerificationStatusNotification verificationData={mockVerificationData} />);
    
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
    expect(screen.getByText(/your company has been verified/i)).toBeInTheDocument();
  });
});
```

### 13. Manual Testing Checklist

#### 13.1 Registration Flow
- [ ] User can access registration form
- [ ] All required fields are present and functional
- [ ] Profile picture upload works correctly
- [ ] Document uploads work correctly
- [ ] Form validation prevents incomplete submissions
- [ ] Registration creates company record with pending status

#### 13.2 Verification Process
- [ ] Data processor can access pending companies
- [ ] Document review functionality works
- [ ] Correction requests are properly recorded
- [ ] Internal admin can approve/reject companies
- [ ] Status updates correctly throughout process
- [ ] Users receive appropriate notifications

#### 13.3 Access Control
- [ ] Unverified users have limited access
- [ ] Verified users have full access
- [ ] Admins have appropriate verification permissions
- [ ] Company admins can only access their company data

#### 13.4 Company Management
- [ ] Verified users can complete company information
- [ ] Geographic location selection works
- [ ] Company data updates correctly
- [ ] Validation ensures data completeness

#### 13.5 Certificate Submission
- [ ] Verified companies can submit certificates
- [ ] Document upload validation works
- [ ] Certificate verification process works
- [ ] Admin approval/rejection functionality works

This comprehensive testing plan ensures all aspects of the registration and verification workflow are properly validated, from initial user registration through document submission, verification by data processors and internal admins, company management, and certificate submission.