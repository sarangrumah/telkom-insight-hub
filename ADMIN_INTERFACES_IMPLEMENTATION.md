# Admin Interfaces for User and Document Verification

## Overview
This document outlines the implementation of admin interfaces that allow data processor and internal admin roles to verify user registrations and documents as part of the registration and verification workflow.

## Current System Capabilities
The existing system already has:
- Role-based access control with `pengolah_data` and `internal_admin` roles
- Company verification status tracking
- Document management system
- User role management
- Ticket system for communications

## Implementation Plan

### 1. Backend Implementation

#### Admin Verification API Endpoints
```javascript
// server/routes/adminVerification.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware to check admin access
const requireAdminAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'internal_admin', 'pengolah_data'])
      .single();

    if (roleError || !userRoles) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = userRoles.role;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending companies for verification (for data processors and internal admins)
router.get('/pending-companies', requireAdminAccess, async (req, res) => {
  try {
    let query = supabase
      .from('companies')
      .select(`
        id,
        company_name,
        email,
        phone,
        company_address,
        business_field,
        status,
        created_at,
        updated_at,
        nib_number,
        npwp_number,
        company_type,
        akta_number,
        province_id,
        kabupaten_id,
        kecamatan,
        kelurahan,
        postal_code,
        correction_notes,
        correction_status,
        verified_at,
        verified_by,
        verification_notes,
        profiles!inner(full_name, phone),
        company_documents(count),
        person_in_charge(count)
      `)
      .in('status', ['pending_verification', 'needs_correction'])
      .order('created_at', { ascending: false });

    // For data processors, only show unassigned companies
    if (req.userRole === 'pengolah_data') {
      query = query.is('assigned_to', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format the response
    const companies = data.map(company => ({
      id: company.id,
      company_name: company.company_name,
      email: company.email,
      phone: company.phone,
      company_address: company.company_address,
      business_field: company.business_field,
      status: company.status,
      created_at: company.created_at,
      updated_at: company.updated_at,
      nib_number: company.nib_number,
      npwp_number: company.npwp_number,
      company_type: company.company_type,
      akta_number: company.akta_number,
      province_id: company.province_id,
      kabupaten_id: company.kabupaten_id,
      kecamatan: company.kecamatan,
      kelurahan: company.kelurahan,
      postal_code: company.postal_code,
      correction_notes: company.correction_notes,
      correction_status: company.correction_status,
      verified_at: company.verified_at,
      verified_by: company.verified_by,
      verification_notes: company.verification_notes,
      owner_name: company.profiles?.full_name,
      owner_phone: company.profiles?.phone,
      document_count: company.company_documents?.length || 0,
      pic_count: company.person_in_charge?.length || 0
    }));

    res.json({
      success: true,
      companies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company details for verification
router.get('/companies/:companyId', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        company_documents (
          id,
          document_type,
          file_path,
          file_name,
          file_size,
          mime_type,
          uploaded_by,
          created_at,
          profiles (full_name)
        ),
        person_in_charge (
          id,
          full_name,
          id_number,
          phone_number,
          position,
          address,
          province_id,
          kabupaten_id,
          kecamatan,
          kelurahan,
          postal_code,
          pic_documents (
            id,
            document_type,
            file_path,
            file_name,
            file_size,
            mime_type,
            uploaded_by,
            created_at
          )
        ),
        profiles (full_name, phone, email)
      `)
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign company to data processor for verification
router.post('/companies/:companyId/assign', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { assigned_to } = req.body;

  try {
    // Only internal admins can assign to data processors
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Only internal admins can assign companies' });
    }

    const { data, error } = await supabase
      .from('companies')
      .update({
        assigned_to: assigned_to,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company assigned successfully',
      company: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve company registration
router.post('/companies/:companyId/approve', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { notes } = req.body;

  try {
    // Only internal admins and super admins can approve
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions to approve companies' });
    }

    const { data, error } = await supabase
      .rpc('approve_company', {
        _company_id: companyId,
        _verified_by: req.userId,
        _notes: notes || null
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company approved successfully',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject company registration
router.post('/companies/:companyId/reject', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { rejection_notes } = req.body;

  try {
    // Only internal admins and super admins can reject
    if (req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions to reject companies' });
    }

    if (!rejection_notes) {
      return res.status(400).json({ error: 'Rejection notes are required' });
    }

    const { data, error } = await supabase
      .rpc('reject_company', {
        _company_id: companyId,
        _rejected_by: req.userId,
        _rejection_notes: rejection_notes
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Company rejected',
      company_id: companyId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request company correction
router.post('/companies/:companyId/request-correction', requireAdminAccess, async (req, res) => {
  const { companyId } = req.params;
  const { correction_notes } = req.body;

  try {
    // Both data processors and internal admins can request corrections
    if (req.userRole !== 'pengolah_data' && req.userRole !== 'internal_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions to request corrections' });
    }

    if (!correction_notes) {
      return res.status(400).json({ error: 'Correction notes are required' });
    }

    const { data, error } = await supabase
      .rpc('request_company_correction', {
        _company_id: companyId,
        _requested_by: req.userId,
        _correction_notes: correction_notes
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Correction requested successfully',
      company_id: companyId,
      status: 'needs_correction'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verification statistics
router.get('/verification-stats', requireAdminAccess, async (req, res) => {
  try {
    // Get overall verification statistics
    const { data: stats, error: statsError } = await supabase
      .from('companies')
      .select(`
        status,
        count(*) as count
      `)
      .group('status');

    if (statsError) throw statsError;

    // Get recent activities
    const { data: recentActivities, error: activityError } = await supabase
      .from('audit_logs')
      .select(`
        action,
        created_at,
        profiles (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) throw activityError;

    res.json({
      success: true,
      stats,
      recent_activities: recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Frontend Implementation

#### Admin Dashboard Component
```tsx
// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

interface Company {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  owner_name: string;
  document_count: number;
  pic_count: number;
  verification_notes?: string;
  correction_notes?: any;
}

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  // Fetch pending companies
  const { data: pendingCompanies, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch pending companies');
      const result = await response.json();
      return result.companies;
    }
  });

  // Fetch verification stats
  const { data: verificationStats } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/verification-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch verification stats');
      const result = await response.json();
      return result;
    }
  });

  // Mutation to approve company
  const approveCompanyMutation = useMutation({
    mutationFn: async ({ companyId, notes }: { companyId: string; notes?: string }) => {
      const response = await fetch(`/api/admin/companies/${companyId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve company');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      alert('Company approved successfully');
      setSelectedCompany(null);
    },
    onError: (error) => {
      alert(`Error approving company: ${error.message}`);
    }
  });

  // Mutation to reject company
  const rejectCompanyMutation = useMutation({
    mutationFn: async ({ companyId, rejectionNotes }: { companyId: string; rejectionNotes: string }) => {
      const response = await fetch(`/api/admin/companies/${companyId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rejection_notes: rejectionNotes })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject company');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      alert('Company rejected successfully');
      setSelectedCompany(null);
    },
    onError: (error) => {
      alert(`Error rejecting company: ${error.message}`);
    }
  });

  // Mutation to request correction
  const requestCorrectionMutation = useMutation({
    mutationFn: async ({ companyId, correctionNotes }: { companyId: string; correctionNotes: any }) => {
      const response = await fetch(`/api/admin/companies/${companyId}/request-correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ correction_notes: correctionNotes })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request correction');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      alert('Correction requested successfully');
      setSelectedCompany(null);
    },
    onError: (error) => {
      alert(`Error requesting correction: ${error.message}`);
    }
  });

  const handleApprove = (companyId: string) => {
    if (window.confirm('Are you sure you want to approve this company?')) {
      approveCompanyMutation.mutate({ companyId });
    }
  };

  const handleReject = (companyId: string) => {
    const rejectionNotes = prompt('Enter rejection notes:');
    if (rejectionNotes) {
      rejectCompanyMutation.mutate({ companyId, rejectionNotes });
    }
  };

  const handleRequestCorrection = (companyId: string) => {
    const correctionNotes = prompt('Enter correction notes:');
    if (correctionNotes) {
      requestCorrectionMutation.mutate({ 
        companyId, 
        correctionNotes: { general: correctionNotes } 
      });
    }
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="all">All Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Companies</p>
                    <p className="text-2xl font-bold">
                      {verificationStats?.stats?.reduce((sum, stat) => sum + parseInt(stat.count), 0) || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Verification</p>
                    <p className="text-2xl font-bold">
                      {verificationStats?.stats?.find(stat => stat.status === 'pending_verification')?.count || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold">
                      {verificationStats?.stats?.find(stat => stat.status === 'verified')?.count || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Needs Correction</p>
                    <p className="text-2xl font-bold">
                      {verificationStats?.stats?.find(stat => stat.status === 'needs_correction')?.count || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationStats?.recent_activities && verificationStats.recent_activities.length > 0 ? (
                <ul className="space-y-2">
                  {verificationStats.recent_activities.map(activity => (
                    <li key={activity.id} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <span className="font-medium">{activity.profiles?.full_name}</span> - {activity.action}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent activities</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Company Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div>Loading pending companies...</div>
              ) : pendingCompanies && pendingCompanies.length > 0 ? (
                <div className="space-y-4">
                  {pendingCompanies.map(company => (
                    <div key={company.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{company.company_name}</h3>
                          <Badge variant={
                            company.status === 'pending_verification' ? 'secondary' :
                            company.status === 'needs_correction' ? 'warning' : 'default'
                          }>
                            {company.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{company.email} | {company.phone}</p>
                        <p className="text-sm">Owner: {company.owner_name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{company.document_count} documents</Badge>
                          <Badge variant="outline">{company.pic_count} PIC</Badge>
                          <Badge variant="outline">
                            {new Date(company.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(company)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRequestCorrection(company.id)}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Request Correction
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleApprove(company.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleReject(company.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending companies for verification.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="pl-8 w-full p-2 border rounded"
                />
              </div>
              
              <div className="mt-4 space-y-4">
                {/* Implementation for all companies view would go here */}
                <p className="text-gray-500">All companies view implementation pending...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Company Details Modal */}
      {selectedCompany && (
        <CompanyDetailsModal 
          company={selectedCompany} 
          onClose={() => setSelectedCompany(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestCorrection={handleRequestCorrection}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
```

#### Company Details Modal Component
```tsx
// src/components/CompanyDetailsModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface CompanyDetailsModalProps {
  company: any;
  onClose: () => void;
  onApprove: (companyId: string) => void;
  onReject: (companyId: string) => void;
  onRequestCorrection: (companyId: string) => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  company,
  onClose,
  onApprove,
  onReject,
  onRequestCorrection
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'documents' | 'pic'>('company');

  const handleViewDocument = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Details - {company.company_name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'company' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('company')}
          >
            Company Info
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents ({company.company_documents?.length || 0})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'pic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('pic')}
          >
            Person in Charge ({company.person_in_charge?.length || 0})
          </button>
        </div>
        
        {activeTab === 'company' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p>{company.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{company.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{company.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Field</p>
                    <p>{company.business_field}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company Type</p>
                    <p>{company.company_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NIB Number</p>
                    <p>{company.nib_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NPWP Number</p>
                    <p>{company.npwp_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={
                      company.status === 'verified' ? 'default' :
                      company.status === 'pending_verification' ? 'secondary' :
                      company.status === 'needs_correction' ? 'warning' : 'destructive'
                    }>
                      {company.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Company Address</p>
                  <p>{company.company_address}</p>
                </div>
                
                {company.correction_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-semibold text-yellow-800">Correction Notes</h4>
                    <pre className="text-sm mt-2 whitespace-pre-wrap">
                      {typeof company.correction_notes === 'object' 
                        ? JSON.stringify(company.correction_notes, null, 2) 
                        : company.correction_notes}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {company.company_documents && company.company_documents.length > 0 ? (
                  <div className="space-y-3">
                    {company.company_documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400">Uploaded by: {doc.profiles?.full_name}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDocument(doc.file_path)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.file_path;
                              link.download = doc.file_name;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents uploaded.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'pic' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Person in Charge</CardTitle>
              </CardHeader>
              <CardContent>
                {company.person_in_charge && company.person_in_charge.length > 0 ? (
                  company.person_in_charge.map(pic => (
                    <div key={pic.id} className="border rounded p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p>{pic.full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ID Number</p>
                          <p>{pic.id_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Position</p>
                          <p>{pic.position}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p>{pic.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>{pic.address}</p>
                        </div>
                      </div>
                      
                      {pic.pic_documents && pic.pic_documents.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">PIC Documents</h4>
                          <div className="space-y-2">
                            {pic.pic_documents.map(doc => (
                              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="text-sm">{doc.file_name}</p>
                                  <p className="text-xs text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDocument(doc.file_path)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = doc.file_path;
                                      link.download = doc.file_name;
                                      link.click();
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No person in charge information.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onRequestCorrection(company.id)}
              className="flex items-center gap-1 text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <AlertTriangle className="w-4 h-4" />
              Request Correction
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onApprove(company.id)}
              className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onReject(company.id)}
              className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;
```

#### Data Processor Dashboard Component
```tsx
// src/components/DataProcessorDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Eye, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const DataProcessorDashboard: React.FC = () => {
  // Fetch companies assigned to this data processor
  const { data: assignedCompanies, isLoading } = useQuery({
    queryKey: ['assigned-companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch assigned companies');
      const result = await response.json();
      // Filter to only show unassigned or assigned to current user
      return result.companies.filter(company => 
        !company.assigned_to || company.assigned_to === localStorage.getItem('userId')
      );
    }
  });

  const handleViewCompany = (companyId: string) => {
    // Navigate to company details page
    window.location.href = `/admin/companies/${companyId}`;
  };

  const handleRequestCorrection = (companyId: string) => {
    // Implementation for requesting correction
    const correctionNotes = prompt('Enter correction notes:');
    if (correctionNotes) {
      // Make API call to request correction
      fetch(`/api/admin/companies/${companyId}/request-correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ correction_notes: { general: correctionNotes } })
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Data Processor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <FileText className="w-8 h-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {assignedCompanies?.length || 0}
              </p>
              <p className="text-gray-500">Assigned Companies</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {assignedCompanies?.filter(c => c.status === 'pending_verification').length || 0}
              </p>
              <p className="text-gray-500">Pending Verification</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {assignedCompanies?.filter(c => c.status === 'needs_correction').length || 0}
              </p>
              <p className="text-gray-500">Needs Correction</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Companies for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading assigned companies...</div>
          ) : assignedCompanies && assignedCompanies.length > 0 ? (
            <div className="space-y-4">
              {assignedCompanies.map(company => (
                <div key={company.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{company.company_name}</h3>
                      <Badge variant={
                        company.status === 'pending_verification' ? 'secondary' :
                        company.status === 'needs_correction' ? 'warning' : 'default'
                      }>
                        {company.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{company.email} | {company.phone}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{company.document_count} documents</Badge>
                      <Badge variant="outline">{company.pic_count} PIC</Badge>
                      <Badge variant="outline">
                        Created: {new Date(company.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewCompany(company.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleRequestCorrection(company.id)}
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Request Correction
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No companies assigned for review.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataProcessorDashboard;
```

#### Update Main App with Admin Routes
```tsx
// src/App.tsx (add admin routes)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';
import DataProcessorDashboard from '@/components/DataProcessorDashboard';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useAuth } from '@/hooks/useAuth';

const App: React.FC = () => {
  const { user, isAuthenticated, userRole } = useAuth();

  // Protected admin route component
  const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (!['super_admin', 'internal_admin', 'pengolah_data'].includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ... existing routes ... */}
          
          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/companies/:id" 
            element={
              <AdminRoute>
                <CompanyDetailsModal />
              </AdminRoute>
            } 
          />
          
          {/* Data processor routes */}
          <Route 
            path="/data-processor/dashboard" 
            element={
              <AdminRoute>
                <DataProcessorDashboard />
              </AdminRoute>
            } 
          />
          
          {/* ... existing routes ... */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

### 3. Integration with Existing System

#### Update navigation for admin roles
```tsx
// src/components/Sidebar.tsx (update with admin navigation)
import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, FileText, Users, Settings, FileBarChart, Shield, Upload, CheckSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessControl } from '@/hooks/useAccessControl';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { userRole } = useAccessControl();

  const isAdmin = ['super_admin', 'internal_admin'].includes(userRole);
  const isDataProcessor = userRole === 'pengolah_data';
  const isCompanyAdmin = userRole === 'pelaku_usaha';

  return (
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
              
              {(isAdmin || isDataProcessor) && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin/dashboard')}>
                      <Link to="/admin/dashboard">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin/companies')}>
                      <Link to="/admin/companies">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Company Verification</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin/users')}>
                      <Link to="/admin/users">
                        <Users className="mr-2 h-4 w-4" />
                        <span>User Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              {isDataProcessor && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/data-processor')}>
                    <Link to="/data-processor/dashboard">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      <span>My Assigned Reviews</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {isCompanyAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/company')}>
                      <Link to="/company">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Company Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/certificates')}>
                      <Link to="/certificates">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Submit Certificates</span>
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
  );
};

export default AdminSidebar;
```

This implementation provides comprehensive admin interfaces for both data processors and internal admins to verify user registrations and documents. The system includes:

1. Backend API endpoints with proper authorization checks
2. Admin dashboard with company statistics and pending verifications
3. Detailed company view modal with document inspection capabilities
4. Data processor dashboard for assigned reviews
5. Integration with the existing role-based access control system
6. Proper UI components for reviewing, approving, rejecting, and requesting corrections

The interfaces follow the existing design patterns in the application and integrate seamlessly with the verification workflow system already in place.