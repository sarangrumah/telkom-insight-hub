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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Edit,
  Save,
  X,
  Download,
  FileIcon,
  IdCard,
  CreditCard,
  FileCheck,
  UserCheck,
  Building,
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

interface EditableCompany {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  nib_number: string | null;
  npwp_number: string | null;
  akta_number: string | null;
  company_address: string;
  business_field: string;
  company_type: 'pt' | 'cv' | 'ud' | 'koperasi' | 'yayasan' | 'other' | null;
  website: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
  postal_code: string | null;
}

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState<EditableCompany | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentPdfTitle, setCurrentPdfTitle] = useState("");
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

      // Initialize editable company data
      setEditedCompany({
        id: company.id,
        company_name: company.company_name,
        email: company.email,
        phone: company.phone,
        nib_number: company.nib_number,
        npwp_number: company.npwp_number,
        akta_number: company.akta_number,
        company_address: company.company_address,
        business_field: company.business_field,
        company_type: company.company_type,
        website: company.website,
        kecamatan: company.kecamatan,
        kelurahan: company.kelurahan,
        postal_code: company.postal_code,
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

  const saveCompanyChanges = async () => {
    if (!editedCompany) return;

    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          company_name: editedCompany.company_name,
          email: editedCompany.email,
          phone: editedCompany.phone,
          nib_number: editedCompany.nib_number,
          npwp_number: editedCompany.npwp_number,
          akta_number: editedCompany.akta_number,
          company_address: editedCompany.company_address,
          business_field: editedCompany.business_field,
          company_type: editedCompany.company_type,
          website: editedCompany.website,
          kecamatan: editedCompany.kecamatan,
          kelurahan: editedCompany.kelurahan,
          postal_code: editedCompany.postal_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editedCompany.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company details updated successfully",
      });

      setEditMode(false);
      await loadCompanyDetails(editedCompany.id);
      await loadCompanies();
    } catch (error) {
      console.error('Error saving company changes:', error);
      toast({
        title: "Error",
        description: "Failed to save company changes",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
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

  const viewPdfDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setCurrentPdfUrl(url);
      setCurrentPdfTitle(fileName);
      setPdfViewerOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'nib':
        return <Building className="h-4 w-4" />;
      case 'npwp':
        return <CreditCard className="h-4 w-4" />;
      case 'akta':
        return <FileCheck className="h-4 w-4" />;
      case 'ktp':
        return <IdCard className="h-4 w-4" />;
      case 'assignment_letter':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
      <Dialog open={!!selectedCompany} onOpenChange={() => {
        setSelectedCompany(null);
        setEditMode(false);
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <div>
                  <DialogTitle>Company Details</DialogTitle>
                  <DialogDescription>
                    {editMode ? "Edit company information" : "Review company information and documents"}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!editMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveCompanyChanges}
                      disabled={saveLoading}
                    >
                      {saveLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[75vh]">
            {selectedCompany && editedCompany && (
              <div className="space-y-6 pr-4">
                <Tabs defaultValue="company" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="company">Company Details</TabsTrigger>
                    <TabsTrigger value="pics">Person in Charge</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="company" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company_name">Company Name</Label>
                            {editMode ? (
                              <Input
                                id="company_name"
                                value={editedCompany.company_name}
                                onChange={(e) => setEditedCompany({...editedCompany, company_name: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.company_name}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="business_field">Business Field</Label>
                            {editMode ? (
                              <Input
                                id="business_field"
                                value={editedCompany.business_field}
                                onChange={(e) => setEditedCompany({...editedCompany, business_field: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.business_field}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            {editMode ? (
                              <Input
                                id="email"
                                type="email"
                                value={editedCompany.email}
                                onChange={(e) => setEditedCompany({...editedCompany, email: e.target.value})}
                              />
                            ) : (
                              <div className="flex items-center p-2 border rounded">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="text-sm text-muted-foreground">{selectedCompany.company.email}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            {editMode ? (
                              <Input
                                id="phone"
                                value={editedCompany.phone}
                                onChange={(e) => setEditedCompany({...editedCompany, phone: e.target.value})}
                              />
                            ) : (
                              <div className="flex items-center p-2 border rounded">
                                <Phone className="h-4 w-4 mr-2" />
                                <span className="text-sm text-muted-foreground">{selectedCompany.company.phone}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="website">Website</Label>
                            {editMode ? (
                              <Input
                                id="website"
                                value={editedCompany.website || ''}
                                onChange={(e) => setEditedCompany({...editedCompany, website: e.target.value})}
                                placeholder="https://company-website.com"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.website || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="company_type">Company Type</Label>
                            {editMode ? (
                              <Select 
                                value={editedCompany.company_type || ''} 
                                onValueChange={(value: 'pt' | 'cv' | 'ud' | 'koperasi' | 'yayasan' | 'other') => setEditedCompany({...editedCompany, company_type: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
                                  <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
                                  <SelectItem value="ud">UD (Usaha Dagang)</SelectItem>
                                  <SelectItem value="koperasi">Koperasi</SelectItem>
                                  <SelectItem value="yayasan">Yayasan</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.company_type || 'N/A'}</p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-semibold">Legal Documents</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="nib_number">NIB Number</Label>
                              {editMode ? (
                                <Input
                                  id="nib_number"
                                  value={editedCompany.nib_number || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, nib_number: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.nib_number || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="npwp_number">NPWP Number</Label>
                              {editMode ? (
                                <Input
                                  id="npwp_number"
                                  value={editedCompany.npwp_number || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, npwp_number: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.npwp_number || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="akta_number">Akta Number</Label>
                              {editMode ? (
                                <Input
                                  id="akta_number"
                                  value={editedCompany.akta_number || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, akta_number: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.akta_number || 'N/A'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-semibold">Address Information</h3>
                          <div>
                            <Label htmlFor="company_address">Full Address</Label>
                            {editMode ? (
                              <Textarea
                                id="company_address"
                                value={editedCompany.company_address}
                                onChange={(e) => setEditedCompany({...editedCompany, company_address: e.target.value})}
                                rows={3}
                              />
                            ) : (
                              <div className="flex items-start p-2 border rounded">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{selectedCompany.company.company_address}</span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="kecamatan">Kecamatan</Label>
                              {editMode ? (
                                <Input
                                  id="kecamatan"
                                  value={editedCompany.kecamatan || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, kecamatan: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.kecamatan || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="kelurahan">Kelurahan</Label>
                              {editMode ? (
                                <Input
                                  id="kelurahan"
                                  value={editedCompany.kelurahan || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, kelurahan: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.kelurahan || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="postal_code">Postal Code</Label>
                              {editMode ? (
                                <Input
                                  id="postal_code"
                                  value={editedCompany.postal_code || ''}
                                  onChange={(e) => setEditedCompany({...editedCompany, postal_code: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 border rounded">{selectedCompany.company.postal_code || 'N/A'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-semibold">Status Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Current Status</Label>
                              <div className="p-2 border rounded">
                                {getStatusBadge(selectedCompany.company.status)}
                              </div>
                            </div>
                            <div>
                              <Label>Registration Date</Label>
                              <div className="flex items-center p-2 border rounded">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(selectedCompany.company.created_at), 'PPP')}
                                </span>
                              </div>
                            </div>
                            {selectedCompany.company.verified_at && (
                              <div>
                                <Label>Verification Date</Label>
                                <div className="flex items-center p-2 border rounded">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(selectedCompany.company.verified_at), 'PPP')}
                                  </span>
                                </div>
                              </div>
                            )}
                            {selectedCompany.company.verification_notes && (
                              <div className="col-span-2">
                                <Label>Verification Notes</Label>
                                <p className="text-sm text-muted-foreground p-2 border rounded bg-muted/50">
                                  {selectedCompany.company.verification_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Person in Charge (PIC)</span>
                          <Badge variant="secondary">{selectedCompany.pics.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCompany.pics.map((pic, index) => (
                          <div key={pic.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">PIC #{index + 1}</h4>
                              <Badge variant="outline">ID: {pic.id_number}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                                <p className="font-medium">{pic.full_name}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                                <p className="text-sm">{pic.position}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span className="text-sm">{pic.phone_number}</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">ID Number</Label>
                                <div className="flex items-center space-x-2">
                                  <IdCard className="h-4 w-4" />
                                  <span className="text-sm font-mono">{pic.id_number}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                              <div className="flex items-start space-x-2 mt-1">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{pic.address}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Documents</span>
                          <Badge variant="secondary">{selectedCompany.documents.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedCompany.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  {getDocumentIcon(doc.document_type)}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{doc.file_name || doc.document_name}</p>
                                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <span className={`w-2 h-2 rounded-full ${doc.category === 'company' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                      <span>{doc.category === 'company' ? 'Company' : 'PIC'}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="uppercase font-medium">{doc.document_type.replace('_', ' ')}</span>
                                    <span>•</span>
                                    <span>{((doc.file_size || 0) / 1024).toFixed(1)} KB</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewPdfDocument(doc.file_path, doc.file_name || doc.document_name)}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadDocument(doc.file_path, doc.file_name || doc.document_name)}
                                  className="flex items-center space-x-1"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {selectedCompany.company.status === 'pending_verification' && !editMode && (
                  <div className="flex space-x-2 pt-4 border-t">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfViewerOpen} onOpenChange={(open) => {
        setPdfViewerOpen(open);
        if (!open && currentPdfUrl) {
          URL.revokeObjectURL(currentPdfUrl);
          setCurrentPdfUrl("");
          setCurrentPdfTitle("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5" />
              <span>{currentPdfTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[75vh]">
            {currentPdfUrl && (
              <iframe
                src={currentPdfUrl}
                className="w-full h-full border rounded-lg"
                title={currentPdfTitle}
              />
            )}
          </div>
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