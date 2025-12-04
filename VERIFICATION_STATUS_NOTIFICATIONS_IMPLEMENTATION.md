# User Verification Status Checks and Notifications Implementation

## Overview
This document outlines the implementation of user verification status checks and notifications system that will inform users about their registration status and enable appropriate access controls.

## Current System Capabilities
The existing system already has:
- Status tracking in the `companies` table with `pending_verification`, `verified`, `rejected`, `needs_correction` states
- Notification system via tickets and messages
- Profile validation status in the `profiles` table
- User role management

## Implementation Plan

### 1. Backend Implementation

#### Verification Status Check Function
```sql
-- Enhanced function to get detailed verification status with notifications
CREATE OR REPLACE FUNCTION public.get_user_verification_status(_user_id UUID)
RETURNS TABLE(
  status TEXT,
  company_id UUID,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  nib_number TEXT,
  npwp_number TEXT,
  company_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  verification_notes TEXT,
  correction_notes JSONB,
  correction_status TEXT,
  document_count BIGINT,
  pic_count BIGINT,
  is_validated BOOLEAN,
  full_name TEXT,
  notification_message TEXT,
  access_level TEXT,
  can_access_dashboard BOOLEAN,
  can_submit_data BOOLEAN,
  can_submit_certificates BOOLEAN,
  can_view_company_data BOOLEAN,
  next_steps TEXT[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.status::TEXT as status,
    c.id as company_id,
    c.company_name,
    c.email,
    c.phone,
    c.nib_number,
    c.npwp_number,
    c.status::TEXT as company_status,
    c.created_at,
    c.verified_at,
    c.verified_by,
    c.verification_notes,
    c.correction_notes,
    c.correction_status,
    COALESCE(doc_counts.doc_count, 0)::BIGINT as document_count,
    COALESCE(pic_counts.pic_count, 0)::BIGINT as pic_count,
    p.is_validated,
    p.full_name,
    CASE 
      WHEN c.status = 'pending_verification' THEN 'Your registration is under review. Please wait for verification.'
      WHEN c.status = 'verified' THEN 'Your company has been successfully verified. You now have full access to the platform.'
      WHEN c.status = 'rejected' THEN 'Your registration has been rejected. Please contact support for more information.'
      WHEN c.status = 'needs_correction' THEN 'Your registration needs correction. Please update the required information and resubmit.'
      ELSE 'Please complete your registration to proceed.'
    END as notification_message,
    CASE 
      WHEN c.status = 'verified' THEN 'full'
      WHEN c.status = 'pending_verification' THEN 'limited'
      WHEN c.status = 'needs_correction' THEN 'limited'
      WHEN c.status = 'rejected' THEN 'none'
      ELSE 'none'
    END as access_level,
    CASE 
      WHEN c.status = 'verified' THEN true
      WHEN c.status = 'pending_verification' THEN false
      WHEN c.status = 'needs_correction' THEN false
      ELSE false
    END as can_access_dashboard,
    CASE 
      WHEN c.status = 'verified' THEN true
      WHEN c.status = 'needs_correction' THEN true  -- Allow to submit corrections
      ELSE false
    END as can_submit_data,
    CASE 
      WHEN c.status = 'verified' THEN true
      ELSE false
    END as can_submit_certificates,
    CASE 
      WHEN c.status IN ('verified', 'pending_verification', 'needs_correction') THEN true
      ELSE false
    END as can_view_company_data,
    CASE 
      WHEN c.status = 'pending_verification' THEN ARRAY['Wait for verification by admin', 'Check email for updates']
      WHEN c.status = 'verified' THEN ARRAY['Access full platform features', 'Manage company data', 'Submit certificates']
      WHEN c.status = 'rejected' THEN ARRAY['Contact support for assistance', 'Consider re-registering with correct information']
      WHEN c.status = 'needs_correction' THEN ARRAY['Update required information', 'Resubmit for verification']
      ELSE ARRAY['Complete registration with required documents', 'Wait for verification']
    END as next_steps
  FROM public.companies c
  LEFT JOIN public.profiles p ON p.user_id = _user_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as doc_count
    FROM public.company_documents
    GROUP BY company_id
  ) doc_counts ON c.id = doc_counts.company_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as pic_count
    FROM public.person_in_charge
    GROUP BY company_id
  ) pic_counts ON c.id = pic_counts.company_id
  WHERE EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = _user_id AND up.company_id = c.id
  )
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$;
```

#### Notification System Implementation
```javascript
// server/services/notificationService.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

class NotificationService {
  static async sendVerificationNotification(userId, status, notes = null) {
    const subject = this.getNotificationSubject(status);
    const message = this.getNotificationMessage(status, notes);
    
    // Create a ticket for the notification
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        user_id: userId,
        title: subject,
        description: message,
        status: 'open',
        priority: 'medium',
        category: 'verification',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (ticketError) {
      console.error('Error creating verification notification:', ticketError);
      throw ticketError;
    }
    
    return ticket;
  }
  
  static getNotificationSubject(status) {
    switch (status) {
      case 'verified':
        return 'Company Verification Approved';
      case 'rejected':
        return 'Company Registration Rejected';
      case 'needs_correction':
        return 'Company Registration Needs Correction';
      case 'pending_verification':
        return 'Company Registration Submitted';
      default:
        return 'Company Verification Status Updated';
    }
  }
  
  static getNotificationMessage(status, notes) {
    switch (status) {
      case 'verified':
        return 'Your company registration has been approved. You now have full access to the platform.';
      case 'rejected':
        return `Your company registration has been rejected. ${notes || ''}`;
      case 'needs_correction':
        return `Your company registration needs correction. Please update the required information. ${notes || ''}`;
      case 'pending_verification':
        return 'Your company registration has been submitted and is under review.';
      default:
        return `Your company verification status has been updated to: ${status}.`;
    }
  }
  
  static async sendEmailNotification(email, status, notes = null) {
    // Implementation for sending email notifications
    // This would typically integrate with a mail service like SendGrid, Mailgun, etc.
    console.log(`Sending email notification to ${email} for status: ${status}`);
  }
  
  static async sendInAppNotification(userId, message, type = 'info') {
    // Create an in-app notification
    const { error } = await supabase
      .from('notifications') // Assuming we have a notifications table
      .insert([{
        user_id: userId,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error sending in-app notification:', error);
    }
  }
}

module.exports = NotificationService;
```

#### Enhanced Verification Status Endpoint
```javascript
// server/routes/auth.js (continuation)

// Enhanced verification status endpoint
router.get('/verification-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Call the database function to get verification status
    const { data: verificationData, error: dbError } = await supabase
      .rpc('get_user_verification_status', { _user_id: user.id });

    if (dbError) throw dbError;

    // Get user's role information
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) throw roleError;

    // Combine verification data with user roles
    const response = {
      success: true,
      ...verificationData[0], // Get the first (and likely only) result
      user_roles: userRoles.map(r => r.role)
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to update verification status
router.put('/request-correction/:companyId', requireRole(['internal_admin', 'pengolah_data']), async (req, res) => {
  const { companyId } = req.params;
  const { correction_notes } = req.body;

  try {
    // Update company status to needs correction
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        status: 'needs_correction',
        correction_notes: correction_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) throw updateError;

    // Notify the user about the correction request
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('email')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Find user associated with the company
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('company_id', companyId)
      .limit(1)
      .single();

    if (userError) throw userError;

    // Send notification to user
    await NotificationService.sendVerificationNotification(
      userData.user_id,
      'needs_correction',
      `Correction needed: ${JSON.stringify(correction_notes, null, 2)}`
    );

    res.json({
      success: true,
      message: 'Correction requested successfully',
      company_id: companyId,
      status: 'needs_correction'
    });
  } catch (error) {
    console.error('Error requesting correction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for users to submit corrections
router.put('/submit-corrections/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const { updated_data } = req.body;
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Verify user has access to this company
    const { data: userCompanies, error: companyAccessError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', companyId);

    if (companyAccessError || !userCompanies || userCompanies.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access to company' });
    }

    // Update company data with corrections
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        ...updated_data,
        status: 'pending_verification', // Reset to pending verification
        correction_status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) throw updateError;

    // Send notification to admins about submitted corrections
    await NotificationService.sendInAppNotification(
      null, // Broadcast to admins
      `Corrections submitted for company ${companyId} by user ${user.id}`,
      'warning'
    );

    res.json({
      success: true,
      message: 'Corrections submitted successfully',
      company_id: companyId,
      status: 'pending_verification'
    });
  } catch (error) {
    console.error('Error submitting corrections:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### Access Control Middleware
```javascript
// server/middleware/accessControl.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware to check user verification status
const requireVerifiedUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Get user's company verification status
    const { data: verificationData, error: dbError } = await supabase
      .rpc('get_user_verification_status', { _user_id: user.id });

    if (dbError) throw dbError;

    if (!verificationData || verificationData.length === 0) {
      return res.status(403).json({ error: 'User does not have a company registration' });
    }

    const status = verificationData[0].status;

    if (status !== 'verified') {
      return res.status(403).json({ 
        error: 'Access denied',
        status: status,
        message: 'Your account must be verified to access this resource'
      });
    }

    req.user = user;
    req.verificationStatus = status;
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

      // Get user's verification status and access permissions
      const { data: verificationData, error: dbError } = await supabase
        .rpc('get_user_verification_status', { _user_id: user.id });

      if (dbError) throw dbError;

      if (!verificationData || verificationData.length === 0) {
        return res.status(403).json({ error: 'User does not have a company registration' });
      }

      const accessData = verificationData[0];

      // Check if user has the required access level
      let hasAccess = false;
      switch (requiredLevel) {
        case 'dashboard':
          hasAccess = accessData.can_access_dashboard;
          break;
        case 'submit_data':
          hasAccess = accessData.can_submit_data;
          break;
        case 'submit_certificates':
          hasAccess = accessData.can_submit_certificates;
          break;
        case 'view_company_data':
          hasAccess = accessData.can_view_company_data;
          break;
        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient access level',
          required_level: requiredLevel,
          current_status: accessData.status,
          message: 'Your account verification status does not permit this action'
        });
      }

      req.user = user;
      req.accessData = accessData;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  requireVerifiedUser,
  checkAccessLevel
};
```

### 2. Frontend Implementation

#### Verification Status Hook
```tsx
// src/hooks/useVerificationStatus.ts
import { useState, useEffect } from 'react';

interface VerificationStatus {
  status: string;
  company_id: string;
  company_name: string;
  email: string;
  phone: string;
  nib_number?: string;
  npwp_number?: string;
  company_status: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  correction_notes?: any;
  correction_status?: string;
  document_count: number;
  pic_count: number;
  is_validated: boolean;
  full_name: string;
  notification_message: string;
  access_level: string;
  can_access_dashboard: boolean;
  can_submit_data: boolean;
  can_submit_certificates: boolean;
  can_view_company_data: boolean;
  next_steps: string[];
  user_roles: string[];
}

export const useVerificationStatus = () => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verification-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      setVerificationStatus(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (localStorage.getItem('token') || sessionStorage.getItem('token'))) {
      fetchVerificationStatus();
    }
  }, []);

  return { 
    verificationStatus, 
    loading, 
    error, 
    refetch: fetchVerificationStatus,
    isVerified: verificationStatus?.status === 'verified',
    isPending: verificationStatus?.status === 'pending_verification',
    needsCorrection: verificationStatus?.status === 'needs_correction',
    isRejected: verificationStatus?.status === 'rejected'
  };
};
```

#### Verification Status Component
```tsx
// src/components/VerificationStatusNotification.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

const VerificationStatusNotification: React.FC = () => {
  const { verificationStatus, loading, error, isVerified, isPending, needsCorrection, isRejected } = useVerificationStatus();

  if (loading) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Checking Verification Status</AlertTitle>
        <AlertDescription>
          Loading your account verification information...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Verification Error</AlertTitle>
        <AlertDescription>
          Could not load verification status: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!verificationStatus) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Verification Data</AlertTitle>
        <AlertDescription>
          No verification data found for your account. Please complete registration.
        </AlertDescription>
      </Alert>
    );
  }

  // Determine icon and variant based on status
  let IconComponent;
  let variant: 'default' | 'destructive' | 'warning' = 'default';

  if (isVerified) {
    IconComponent = CheckCircle;
    variant = 'default';
  } else if (isPending) {
    IconComponent = Clock;
    variant = 'default';
  } else if (needsCorrection) {
    IconComponent = AlertTriangle;
    variant = 'warning';
  } else if (isRejected) {
    IconComponent = XCircle;
    variant = 'destructive';
  } else {
    IconComponent = AlertCircle;
    variant = 'default';
  }

  return (
    <Alert variant={variant}>
      <IconComponent className="h-4 w-4" />
      <AlertTitle>
        {isVerified && 'Account Verified'}
        {isPending && 'Account Under Review'}
        {needsCorrection && 'Action Required'}
        {isRejected && 'Registration Rejected'}
        {!isVerified && !isPending && !needsCorrection && !isRejected && 'Account Status'}
      </AlertTitle>
      <AlertDescription>
        {verificationStatus.notification_message}
        
        {needsCorrection && verificationStatus.correction_notes && (
          <div className="mt-2">
            <h4 className="font-semibold text-sm">Correction Notes:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(verificationStatus.correction_notes, null, 2)}
            </pre>
          </div>
        )}
        
        {verificationStatus.next_steps && verificationStatus.next_steps.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold text-sm">Next Steps:</h4>
            <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
              {verificationStatus.next_steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default VerificationStatusNotification;
```

#### Protected Route with Status Check
```tsx
// src/components/ProtectedRoute.tsx (enhanced version)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStatus?: string[]; // e.g., ['verified'], ['pending_verification', 'verified']
  requiredAccess?: string[]; // e.g., ['can_submit_data', 'can_access_dashboard']
  fallbackPath?: string;
  verificationFallback?: string; // Path to redirect if verification is needed
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredStatus = ['verified'],
  requiredAccess = [],
  fallbackPath = '/login',
  verificationFallback = '/verification-status'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { 
    verificationStatus, 
    loading: verificationLoading, 
    isVerified, 
    isPending,
    needsCorrection
  } = useVerificationStatus();

  if (authLoading || verificationLoading) {
    return <div>Loading...</div>;
  }

  // Check authentication
  if (!user) {
    return <Navigate to={fallbackPath} />;
  }

  // Check verification status if required
  if (requiredStatus.length > 0) {
    const hasRequiredStatus = requiredStatus.some(status => 
      verificationStatus?.status === status
    );
    
    if (!hasRequiredStatus) {
      // If user needs correction, redirect to correction page
      if (needsCorrection) {
        return <Navigate to="/correction-required" />;
      }
      // If user is pending verification, allow limited access or redirect based on requirement
      if (isPending && requiredStatus.includes('verified')) {
        return <Navigate to={verificationFallback} />;
      }
      // For other cases, redirect to verification status page
      return <Navigate to={verificationFallback} />;
    }
  }

  // Check access permissions if required
  if (requiredAccess.length > 0) {
    const hasRequiredAccess = requiredAccess.every(access => 
      verificationStatus && verificationStatus[access as keyof typeof verificationStatus]
    );
    
    if (!hasRequiredAccess) {
      return <Navigate to={verificationFallback} />;
    }
  }

  return <>{children}</>;
};
```

#### Verification Status Page
```tsx
// src/pages/VerificationStatusPage.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import VerificationStatusNotification from '@/components/VerificationStatusNotification';
import { ArrowRight, Download, Upload, FileText } from 'lucide-react';

const VerificationStatusPage: React.FC = () => {
  const { 
    verificationStatus, 
    loading, 
    error, 
    refetch,
    isVerified,
    isPending,
    needsCorrection,
    isRejected
  } = useVerificationStatus();

  if (loading) {
    return <div className="container mx-auto py-10">Loading verification status...</div>;
  }

  if (error || !verificationStatus) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error loading verification status: {error || 'No verification data'}</p>
            <Button onClick={refetch} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <VerificationStatusNotification />
        
        <Card>
          <CardHeader>
            <CardTitle>Company Verification Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Company Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Company Name:</span> {verificationStatus.company_name}</p>
                  <p><span className="font-medium">Email:</span> {verificationStatus.email}</p>
                  <p><span className="font-medium">Phone:</span> {verificationStatus.phone}</p>
                  <p><span className="font-medium">NIB Number:</span> {verificationStatus.nib_number || 'Not provided'}</p>
                  <p><span className="font-medium">NPWP Number:</span> {verificationStatus.npwp_number || 'Not provided'}</p>
                </div>
              
              <div>
                <h3 className="font-semibold mb-2">Verification Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge 
                      variant={
                        verificationStatus.status === 'verified' ? 'default' :
                        verificationStatus.status === 'pending_verification' ? 'secondary' :
                        verificationStatus.status === 'needs_correction' ? 'warning' : 'destructive'
                      }
                    >
                      {verificationStatus.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p><span className="font-medium">Registered:</span> {new Date(verificationStatus.created_at).toLocaleDateString()}</p>
                  {verificationStatus.verified_at && (
                    <p><span className="font-medium">Verified:</span> {new Date(verificationStatus.verified_at).toLocaleDateString()}</p>
                  )}
                  <p><span className="font-medium">Documents:</span> {verificationStatus.document_count}</p>
                  <p><span className="font-medium">PIC Count:</span> {verificationStatus.pic_count}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Verification Progress</h3>
              <Progress 
                value={
                  verificationStatus.status === 'verified' ? 100 :
                  verificationStatus.status === 'pending_verification' ? 75 :
                  verificationStatus.status === 'needs_correction' ? 50 : 25
                } 
                className="w-full" 
              />
            </div>
          </CardContent>
        </Card>
        
        {(isPending || isVerified) && (
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>NIB Certificate</span>
                  </div>
                  <Badge variant={verificationStatus.document_count > 0 ? "default" : "secondary"}>
                    {verificationStatus.document_count > 0 ? "Uploaded" : "Pending"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>NPWP Certificate</span>
                  </div>
                  <Badge variant={verificationStatus.document_count > 1 ? "default" : "secondary"}>
                    {verificationStatus.document_count > 1 ? "Uploaded" : "Pending"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Company Deed</span>
                  </div>
                  <Badge variant={verificationStatus.document_count > 2 ? "default" : "secondary"}>
                    {verificationStatus.document_count > 2 ? "Uploaded" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {needsCorrection && (
          <Card>
            <CardHeader>
              <CardTitle>Correction Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Please review the following issues and update your information:</p>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(verificationStatus.correction_notes, null, 2)}
                </pre>
                <Button className="w-full md:w-auto">
                  Update Information <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={refetch}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusPage;
```

### 3. Notification System Integration

#### WebSocket Notifications (Optional Enhancement)
```tsx
// src/hooks/useWebSocketNotifications.ts
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useWebSocketNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', `user-${userId}`);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('verification-update', (data) => {
      setNotifications(prev => [...prev, data]);
      // Show notification to user
      alert(`Verification status updated: ${data.message}`);
    });

    socket.on('correction-request', (data) => {
      setNotifications(prev => [...prev, data]);
      // Show correction request notification
      alert(`Correction requested: ${data.message}`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  const sendNotification = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return {
    notifications,
    connected,
    sendNotification
  };
};
```

This implementation provides a comprehensive verification status check and notification system that integrates with the existing architecture while providing users with clear feedback about their registration status and access permissions.