import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface Company {
  company_id: string;
  company_name: string;
  email: string;
  phone: string;
  nib_number: string | null;
  npwp_number: string | null;
  akta_number: string | null;
  status: string;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  verifier_name: string | null;
  pic_count: number;
  document_count: number;
}

interface CompanyDetails {
  company: any;
  pics: any[];
  documents: any[];
}

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase.rpc('get_companies_for_management');
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: string) => {
    try {
      // Load company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;

      // Load PICs
      const { data: pics, error: picsError } = await supabase
        .from('person_in_charge')
        .select('*')
        .eq('company_id', companyId);

      if (picsError) throw picsError;

      // Load documents
      const { data: companyDocs, error: companyDocsError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId);

      if (companyDocsError) throw companyDocsError;

      // Load PIC documents
      const { data: picDocs, error: picDocsError } = await supabase
        .from('pic_documents')
        .select('*, person_in_charge(full_name)')
        .in('pic_id', pics.map(pic => pic.id));

      if (picDocsError) throw picDocsError;

      const allDocuments = [
        ...companyDocs.map(doc => ({ ...doc, category: 'company' })),
        ...picDocs.map(doc => ({ ...doc, category: 'pic' }))
      ];

      setSelectedCompany({
        company,
        pics,
        documents: allDocuments
      });
    } catch (error) {
      console.error('Error loading company details:', error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    }
  };

  const handleApproveReject = async () => {
    if (!selectedCompany) return;

    setActionLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      let result;
      if (actionType === 'approve') {
        result = await supabase.rpc('approve_company', {
          _company_id: selectedCompany.company.id,
          _verified_by: user.id,
          _notes: actionNotes || null
        });
      } else {
        result = await supabase.rpc('reject_company', {
          _company_id: selectedCompany.company.id,
          _rejected_by: user.id,
          _rejection_notes: actionNotes
        });
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Company ${actionType}d successfully`,
      });

      setActionDialogOpen(false);
      setActionNotes("");
      setSelectedCompany(null);
      await loadCompanies();
    } catch (error) {
      console.error('Error processing company:', error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} company`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_verification: { label: "Pending", variant: "secondary" as const },
      verified: { label: "Verified", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_verification;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">
            Review and approve company registrations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Companies</CardTitle>
          <CardDescription>
            Manage company verification status and review submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>PICs</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.company_id}>
                  <TableCell className="font-medium">
                    {company.company_name}
                  </TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{getStatusBadge(company.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      {company.document_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <User className="h-3 w-3 mr-1" />
                      {company.pic_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(company.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadCompanyDetails(company.company_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {company.status === 'pending_verification' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              loadCompanyDetails(company.company_id);
                              setTimeout(() => {
                                setActionType('approve');
                                setActionDialogOpen(true);
                              }, 500);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              loadCompanyDetails(company.company_id);
                              setTimeout(() => {
                                setActionType('reject');
                                setActionDialogOpen(true);
                              }, 500);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Details Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Company Details</span>
            </DialogTitle>
            <DialogDescription>
              Review company information and documents
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Company Name</Label>
                      <p className="text-sm text-muted-foreground">{selectedCompany.company.company_name}</p>
                    </div>
                    <div>
                      <Label className="font-medium">NIB Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedCompany.company.nib_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">NPWP Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedCompany.company.npwp_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Akta Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedCompany.company.akta_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedCompany.company.email}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedCompany.company.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      {selectedCompany.company.company_address}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PICs */}
              <Card>
                <CardHeader>
                  <CardTitle>Person in Charge (PIC)</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCompany.pics.map((pic) => (
                    <div key={pic.id} className="border rounded-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-medium">Full Name</Label>
                          <p className="text-sm text-muted-foreground">{pic.full_name}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Position</Label>
                          <p className="text-sm text-muted-foreground">{pic.position}</p>
                        </div>
                        <div>
                          <Label className="font-medium">ID Number</Label>
                          <p className="text-sm text-muted-foreground">{pic.id_number}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Phone</Label>
                          <p className="text-sm text-muted-foreground">{pic.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedCompany.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{doc.file_name || doc.document_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.category === 'company' ? 'Company Document' : 'PIC Document'} - {doc.document_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(doc.file_path, doc.file_name || doc.document_name)}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedCompany.company.status === 'pending_verification' && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setActionType('approve');
                      setActionDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Company
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setActionType('reject');
                      setActionDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Company
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Company' : 'Reject Company'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Add notes about the approval decision.' 
                : 'Please provide a reason for rejection.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                {actionType === 'reject' && <span className="text-destructive"> *</span>}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === 'approve' 
                    ? 'Optional notes about the approval...' 
                    : 'Please explain why this company is being rejected...'
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApproveReject}
                disabled={actionLoading || (actionType === 'reject' && !actionNotes.trim())}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagement;