# Access Control Implementation Based on Verification Status

## Overview
This document outlines the implementation of access control mechanisms that restrict user actions based on their verification status in the registration and certification workflow.

## Current System Capabilities
The existing system already has:
- Role-based access control with `app_role` enum
- Row Level Security (RLS) policies
- Permission system with modules and fields
- Verification status tracking in companies table
- User profiles with validation status

## Implementation Plan

### 1. Enhanced Database-Level Access Control

#### Update RLS Policies for Enhanced Verification-Based Access
```sql
-- Enhanced RLS policy for telekom_data based on user verification status
DROP POLICY IF EXISTS "Validated users can view full telekom data" ON public.telekom_data;

CREATE POLICY "Users with verified companies can access telekom data" ON public.telekom_data
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = telekom_data.company_id  -- Added company_id relationship
  )
  OR 
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('super_admin', 'internal_admin', 'pengolah_data')
  )
);

-- Enhanced RLS policy for company documents based on verification status
CREATE POLICY "Users can access company documents if company is verified or they are admin" ON public.company_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status IN ('verified', 'pending_verification', 'needs_correction')
      AND c.id = company_documents.company_id
  )
  OR 
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('super_admin', 'internal_admin', 'pengolah_data')
  )
);

-- RLS policy for certificate documents based on company verification status
CREATE POLICY "Users can access certificate documents if company is verified" ON public.certificate_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = certificate_documents.company_id
  )
  OR 
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('super_admin', 'internal_admin', 'pengolah_data')
  )
);

-- RLS policy for inserting certificate documents - only verified companies
CREATE POLICY "Only verified companies can submit certificates" ON public.certificate_documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = certificate_documents.company_id
      AND up.is_company_admin = true
  )
);

-- RLS policy for updating certificate documents - only during pending verification
CREATE POLICY "Users can update certificates only if status is pending" ON public.certificate_documents
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = certificate_documents.company_id
      AND up.is_company_admin = true
  )
  AND certificate_documents.verification_status = 'pending_verification'
);

-- RLS policy for deleting certificate documents - only during pending verification
CREATE POLICY "Users can delete certificates only if status is pending" ON public.certificate_documents
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = certificate_documents.company_id
      AND up.is_company_admin = true
  )
  AND certificate_documents.verification_status = 'pending_verification'
);

-- Update user_profiles RLS to include verification status
CREATE POLICY "Users can view profiles from verified companies" ON public.user_profiles
FOR SELECT USING (
  auth.uid() = user_id
  OR 
  EXISTS (
    SELECT 1
    FROM public.companies c
    JOIN public.user_profiles up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
      AND c.status = 'verified'
      AND c.id = user_profiles.company_id
  )
  OR 
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('super_admin', 'internal_admin', 'pengolah_data')
  )
);

-- Create function to check if user can submit data based on verification status
CREATE OR REPLACE FUNCTION public.user_can_submit_data(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_status TEXT;
  _user_role TEXT;
BEGIN
  -- Check if user is an admin
  SELECT role INTO _user_role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('super_admin', 'internal_admin', 'pengolah_data')
  LIMIT 1;
  
  IF _user_role IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- Check company verification status
  SELECT c.status INTO _company_status
  FROM public.companies c
  JOIN public.user_profiles up ON c.id = up.company_id
  WHERE up.user_id = _user_id
  LIMIT 1;
  
  RETURN _company_status = 'verified';
END;
$$;

-- Create function to check if user can access dashboard based on verification status
CREATE OR REPLACE FUNCTION public.user_can_access_dashboard(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_status TEXT;
  _user_role TEXT;
BEGIN
  -- Check if user is an admin
  SELECT role INTO _user_role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('super_admin', 'internal_admin', 'pengolah_data')
  LIMIT 1;
  
  IF _user_role IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- Check company verification status
  SELECT c.status INTO _company_status
  FROM public.companies c
  JOIN public.user_profiles up ON c.id = up.company_id
  WHERE up.user_id = _user_id
  LIMIT 1;
  
  RETURN _company_status IN ('verified', 'pending_verification');
END;
$$;

-- Create function to check if user can submit certificates based on verification status
CREATE OR REPLACE FUNCTION public.user_can_submit_certificates(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_status TEXT;
  _user_role TEXT;
BEGIN
  -- Check if user is an admin
  SELECT role INTO _user_role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('super_admin', 'internal_admin', 'pengolah_data')
  LIMIT 1;
  
  IF _user_role IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- Check company verification status
  SELECT c.status INTO _company_status
  FROM public.companies c
  JOIN public.user_profiles up ON c.id = up.company_id
  WHERE up.user_id = _user_id
  LIMIT 1;
  
  RETURN _company_status = 'verified';
END;
$$;
```

#### Enhanced Verification Status Function
```sql
-- Enhanced function to get user access permissions based on verification status
CREATE OR REPLACE FUNCTION public.get_user_access_permissions(_user_id UUID)
RETURNS TABLE(
  can_access_dashboard BOOLEAN,
  can_submit_data BOOLEAN,
  can_submit_certificates BOOLEAN,
  can_view_company_data BOOLEAN,
  can_manage_company BOOLEAN,
  access_level TEXT,
  verification_status TEXT,
  company_id UUID,
  company_name TEXT,
  restriction_reason TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_record RECORD;
BEGIN
  -- Get user's company information
  SELECT 
    c.id,
    c.company_name,
    c.status,
    up.is_company_admin
  INTO _company_record
  FROM public.companies c
  JOIN public.user_profiles up ON c.id = up.company_id
  WHERE up.user_id = _user_id
  LIMIT 1;
  
  -- If user is an admin, grant full access
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
      AND role IN ('super_admin', 'internal_admin', 'pengolah_data')
  ) THEN
    RETURN QUERY
    SELECT 
      true as can_access_dashboard,
      true as can_submit_data,
      true as can_submit_certificates,
      true as can_view_company_data,
      true as can_manage_company,
      'admin' as access_level,
      'verified' as verification_status,
      NULL as company_id,
      NULL as company_name,
      NULL as restriction_reason;
  END IF;
  
  -- If user doesn't have a company, return minimal access
  IF _company_record IS NULL THEN
    RETURN QUERY
    SELECT 
      false as can_access_dashboard,
      false as can_submit_data,
      false as can_submit_certificates,
      false as can_view_company_data,
      false as can_manage_company,
      'none' as access_level,
      'no_company' as verification_status,
      NULL as company_id,
      NULL as company_name,
      'User does not belong to any company' as restriction_reason;
  END IF;
  
  -- Return access permissions based on company verification status
  RETURN QUERY
  SELECT 
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') THEN true
      ELSE false
    END as can_access_dashboard,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'needs_correction') THEN true
      ELSE false
    END as can_submit_data,
    
    CASE 
      WHEN _company_record.status = 'verified' THEN true
      ELSE false
    END as can_submit_certificates,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') THEN true
      ELSE false
    END as can_view_company_data,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') AND _company_record.is_company_admin THEN true
      ELSE false
    END as can_manage_company,
    
    CASE 
      WHEN _company_record.status = 'verified' THEN 'full'
      WHEN _company_record.status = 'pending_verification' THEN 'limited'
      WHEN _company_record.status = 'needs_correction' THEN 'limited'
      WHEN _company_record.status = 'rejected' THEN 'none'
      ELSE 'none'
    END as access_level,
    
    _company_record.status as verification_status,
    _company_record.id as company_id,
    _company_record.company_name as company_name,
    
    CASE 
      WHEN _company_record.status = 'pending_verification' THEN 'Company under review, limited access granted'
      WHEN _company_record.status = 'needs_correction' THEN 'Company needs correction, please update information'
      WHEN _company_record.status = 'rejected' THEN 'Company registration rejected'
      ELSE NULL
    END as restriction_reason;
END;
$$;
```

### 2. Backend Implementation

#### Access Control Middleware
```javascript
// server/middleware/accessControl.js (enhanced version)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware to check if user's company is verified
const requireVerifiedCompany = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Check if user is an admin (they bypass verification requirements)
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'internal_admin', 'pengolah_data']);

    if (roleError) throw roleError;

    if (userRoles && userRoles.length > 0) {
      req.user = user;
      req.isAdmin = true;
      return next();
    }

    // Check company verification status
    const { data: userCompanies, error: companyError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !userCompanies) {
      return res.status(403).json({ 
        error: 'User does not belong to any company',
        access_level: 'none',
        message: 'You must be associated with a company to access this resource'
      });
    }

    const { data: company, error: companyStatusError } = await supabase
      .from('companies')
      .select('status')
      .eq('id', userCompanies.company_id)
      .single();

    if (companyStatusError) throw companyStatusError;

    if (!company || company.status !== 'verified') {
      return res.status(403).json({ 
        error: 'Company not verified',
        access_level: 'restricted',
        status: company?.status || 'unregistered',
        message: 'Your company must be verified to access this resource'
      });
    }

    req.user = user;
    req.companyId = userCompanies.company_id;
    req.isAdmin = false;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware to check user access level for specific actions
const checkAccessLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) throw authError;

      // Get user's access permissions
      const { data: accessData, error: accessError } = await supabase
        .rpc('get_user_access_permissions', { _user_id: user.id });

      if (accessError) throw accessError;

      if (!accessData || accessData.length === 0) {
        return res.status(403).json({ 
          error: 'No access permissions found',
          access_level: 'none',
          message: 'You do not have permissions to access this resource'
        });
      }

      const permissions = accessData[0];

      // Check if user has the required access level
      let hasAccess = false;
      let errorMessage = '';

      switch (requiredLevel) {
        case 'dashboard':
          hasAccess = permissions.can_access_dashboard;
          errorMessage = 'You need to have your company verified or under review to access the dashboard';
          break;
        case 'submit_data':
          hasAccess = permissions.can_submit_data;
          errorMessage = 'You need to have your company verified to submit data';
          break;
        case 'submit_certificates':
          hasAccess = permissions.can_submit_certificates;
          errorMessage = 'You need to have your company verified to submit certificates';
          break;
        case 'manage_company':
          hasAccess = permissions.can_manage_company;
          errorMessage = 'You need to be a company admin with verified status to manage company settings';
          break;
        case 'view_company_data':
          hasAccess = permissions.can_view_company_data;
          errorMessage = 'You need to have your company verified to view company data';
          break;
        default:
          hasAccess = false;
          errorMessage = 'Invalid access level requested';
      }

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient access level',
          required_level: requiredLevel,
          current_status: permissions.verification_status,
          access_level: permissions.access_level,
          message: errorMessage,
          restriction_reason: permissions.restriction_reason
        });
      }

      req.user = user;
      req.accessPermissions = permissions;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Middleware to check company access with verification status
const requireCompanyAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const companyId = req.params.companyId || req.body.companyId;

    // Check if user has access to the company
    const { data: userCompanies, error: accessError } = await supabase
      .from('user_profiles')
      .select('company_id, is_company_admin')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (accessError || !userCompanies) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Check company verification status
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('status')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Set access level based on company status and user role
    let accessLevel = 'none';
    let canAccess = false;

    if (['super_admin', 'internal_admin', 'pengolah_data'].includes(req.userRole)) {
      accessLevel = 'admin';
      canAccess = true;
    } else if (company.status === 'verified') {
      accessLevel = 'full';
      canAccess = true;
    } else if (company.status === 'pending_verification') {
      accessLevel = 'limited';
      // Allow access to view company info but restrict submissions
      canAccess = req.method === 'GET';
    } else if (company.status === 'needs_correction') {
      accessLevel = 'limited';
      // Allow access to correct company info
      canAccess = true;
    }

    if (!canAccess) {
      return res.status(403).json({
        error: 'Insufficient company access',
        company_status: company.status,
        access_level: accessLevel,
        message: 'Your company verification status does not allow this action'
      });
    }

    req.user = user;
    req.companyId = companyId;
    req.companyStatus = company.status;
    req.isCompanyAdmin = userCompanies.is_company_admin;
    req.accessLevel = accessLevel;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requireVerifiedCompany,
  checkAccessLevel,
  requireCompanyAccess
};
```

#### Update Existing API Routes with Access Control
```javascript
// server/routes/telekomData.js (example of applying access control)
const express = require('express');
const router = express.Router();
const { requireVerifiedCompany, checkAccessLevel, requireCompanyAccess } = require('../middleware/accessControl');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Apply access control to data submission routes
router.post('/submit', checkAccessLevel('submit_data'), async (req, res) => {
  try {
    // Only verified companies can submit data
    const { service_type, company_name, license_number, license_date, status, region, 
            latitude, longitude, file_url, sub_service_type, province_id, kabupaten_id } = req.body;

    const { data: newData, error } = await supabase
      .from('telekom_data')
      .insert([{
        service_type,
        company_name,
        license_number,
        license_date,
        status,
        region,
        latitude,
        longitude,
        file_url,
        sub_service_type,
        created_by: req.user.id,
        province_id,
        kabupaten_id
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: newData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply access control to data retrieval routes
router.get('/', checkAccessLevel('view_company_data'), async (req, res) => {
  try {
    // Only allow access to verified companies or admins
    let query = supabase.from('telekom_data').select('*');
    
    if (!req.accessPermissions.can_view_all_data) {
      // For non-admins, only show data from their company
      query = query.eq('created_by', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply access control to certificate submission routes
router.post('/certificates/submit', checkAccessLevel('submit_certificates'), async (req, res) => {
  // Implementation for certificate submission with access control
  // Only verified companies can submit certificates
});

module.exports = router;
```

### 3. Frontend Implementation

#### Access Control Hook
```tsx
// src/hooks/useAccessControl.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface AccessPermissions {
  can_access_dashboard: boolean;
  can_submit_data: boolean;
  can_submit_certificates: boolean;
  can_view_company_data: boolean;
  can_manage_company: boolean;
  access_level: string;
  verification_status: string;
  company_id?: string;
  company_name?: string;
  restriction_reason?: string;
}

export const useAccessControl = () => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<AccessPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = async () => {
    if (!isAuthenticated || !user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/access-permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      setError(err.message);
      console.error('Error checking access:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAccess();
    }
  }, [user]);

  const hasAccessTo = (feature: string): boolean => {
    if (!permissions) return false;
    
    switch (feature) {
      case 'dashboard':
        return permissions.can_access_dashboard;
      case 'submit_data':
        return permissions.can_submit_data;
      case 'submit_certificates':
        return permissions.can_submit_certificates;
      case 'manage_company':
        return permissions.can_manage_company;
      case 'view_company_data':
        return permissions.can_view_company_data;
      default:
        return false;
    }
  };

  return {
    permissions,
    loading,
    error,
    checkAccess,
    hasAccessTo,
    accessLevel: permissions?.access_level || 'none',
    verificationStatus: permissions?.verification_status || 'unregistered'
  };
};
```

#### Protected Route Component with Verification Status
```tsx
// src/components/ProtectedRoute.tsx (enhanced version)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAccess?: string;
  fallbackPath?: string;
  showNotification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredAccess,
  fallbackPath = '/login',
  showNotification = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    permissions, 
    loading, 
    hasAccessTo, 
    accessLevel, 
    verificationStatus 
  } = useAccessControl();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required access
  if (requiredAccess && permissions && !hasAccessTo(requiredAccess)) {
    // If user is trying to access certificate features but company isn't verified
    if (requiredAccess === 'submit_certificates' && verificationStatus !== 'verified') {
      return (
        <div className="container mx-auto py-10">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Your company is not verified. Certificate submission is only available for verified companies.</p>
                <p className="font-medium">Current status: {verificationStatus.replace('_', ' ')}</p>
                
                {verificationStatus === 'pending_verification' && (
                  <p>Please wait for verification by our admin team.</p>
                )}
                
                {verificationStatus === 'needs_correction' && (
                  <p>Please update your company information as requested.</p>
                )}
                
                {verificationStatus === 'rejected' && (
                  <p>Your company registration has been rejected. Please contact support.</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="max-w-2xl mx-auto mt-4 space-y-4">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { 
                  accessDenied: true,
                  verificationStatus,
                  accessLevel
                });
              }
              return child;
            })}
          </div>
        </div>
      );
    }
    
    // For other access restrictions
    return (
      <div className="container mx-auto py-10">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this feature with your current verification status.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

#### Verification Status Banner Component
```tsx
// src/components/VerificationStatusBanner.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

const VerificationStatusBanner: React.FC = () => {
  const { permissions, accessLevel, verificationStatus } = useAccessControl();

  if (!permissions) return null;

  // Determine banner style based on verification status
  let IconComponent;
  let variant: 'default' | 'destructive' | 'warning' = 'default';
  let title = '';
  let message = '';

  switch (verificationStatus) {
    case 'verified':
      IconComponent = CheckCircle;
      variant = 'default';
      title = 'Account Verified';
      message = 'Your company has been verified. You have full access to all features.';
      break;
    case 'pending_verification':
      IconComponent = Clock;
      variant = 'default';
      title = 'Account Under Review';
      message = 'Your company registration is currently under review. Access to some features may be limited.';
      break;
    case 'needs_correction':
      IconComponent = AlertTriangle;
      variant = 'warning';
      title = 'Action Required';
      message = 'Your company registration needs correction. Please update your information.';
      break;
    case 'rejected':
      IconComponent = XCircle;
      variant = 'destructive';
      title = 'Registration Rejected';
      message = 'Your company registration has been rejected. Please contact support.';
      break;
    default:
      return null; // Don't show banner for unregistered users
  }

  return (
    <Alert variant={variant} className="mb-4">
      <IconComponent className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-1">
          <p>{message}</p>
          <p className="text-sm mt-2">
            <span className="font-medium">Access Level:</span> {accessLevel.replace('_', ' ')}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default VerificationStatusBanner;
```

#### Update App Layout with Access Control
```tsx
// src/components/AppLayout.tsx (enhanced with access control)
import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, FileText, Users, Settings, FileBarChart, Shield, Upload } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessControl } from '@/hooks/useAccessControl';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { hasAccessTo, verificationStatus } = useAccessControl();

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {hasAccessTo('view_company_data') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/data')}>
                      <Link to="/data">
                        <FileBarChart className="mr-2 h-4 w-4" />
                        <span>Data Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {hasAccessTo('submit_certificates') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/certificates')}>
                      <Link to="/certificates">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Submit Certificates</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {hasAccessTo('manage_company') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/company')}>
                      <Link to="/company">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Company Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {verificationStatus === 'needs_correction' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/correction')}>
                      <Link to="/correction-required">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Correction Required</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {/* Admin-only menu items */}
                {(verificationStatus === 'admin' || verificationStatus === 'internal_admin') && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin/users')}>
                        <Link to="/admin/users">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>User Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin/companies')}>
                        <Link to="/admin/companies">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Company Verification</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
```

### 4. Role-Based Access Control Updates

#### Update existing permission system for verification status
```sql
-- Update permissions table to include verification-based access
-- This extends the existing permissions system to consider verification status

-- Create a view that combines role-based and verification-based permissions
CREATE OR REPLACE VIEW public.user_combined_permissions AS
SELECT 
  ur.user_id,
  ur.role,
  m.code as module_code,
  p.can_create,
  p.can_read,
  p.can_update,
  p.can_delete,
  p.field_access,
  CASE 
    WHEN m.code = 'certificate_submission' AND c.status != 'verified' THEN false
    WHEN m.code = 'data_submission' AND c.status NOT IN ('verified', 'needs_correction') THEN false
    WHEN m.code = 'company_management' AND up.is_company_admin = false THEN false
    ELSE true
  END as verification_permitted
FROM public.user_roles ur
JOIN public.permissions p ON ur.role = p.role
JOIN public.modules m ON p.module_id = m.id
LEFT JOIN public.user_profiles up ON ur.user_id = up.user_id
LEFT JOIN public.companies c ON up.company_id = c.id;
```

This access control implementation provides a comprehensive system that restricts user actions based on their company's verification status, while still allowing administrators to access all features regardless of verification status. The system integrates with the existing role-based permissions and adds an additional layer of verification-based access control.