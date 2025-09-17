import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCompanyTypeLabel } from "@/lib/validation";
import { LocationDisplay } from "@/components/LocationDisplay";
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
  FileIcon,
  IdCard,
  CreditCard,
  FileCheck,
  UserCheck,
  Building,
  Edit3,
  Plus,
  X,
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
  correction_notes?: any;
  correction_status?: string;
}

interface CompanyDetails {
  company: any;
  pics: any[];
  documents: any[];
}

interface CorrectionField {
  field: string;
  note: string;
}

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>("");
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctionFields, setCorrectionFields] = useState<CorrectionField[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_companies_for_management');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data perusahaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: string) => {
    try {
      setDetailsLoading(true);

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
      const { data: documents, error: documentsError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId);

      if (documentsError) throw documentsError;

      setCompanyDetails({
        company,
        pics: pics || [],
        documents: documents || []
      });
    } catch (error) {
      console.error('Error loading company details:', error);
      toast({
        title: "Error",
        description: "Gagal memuat detail perusahaan",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (company: Company) => {
    setSelectedCompany(company);
    setShowDialog(true);
    await loadCompanyDetails(company.company_id);
  };

  const handleApprove = async () => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase.rpc('approve_company', {
        _company_id: selectedCompany.company_id,
        _verified_by: (await supabase.auth.getUser()).data.user?.id,
        _notes: verificationNotes || null
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Perusahaan berhasil disetujui",
      });

      setShowDialog(false);
      setVerificationNotes("");
      loadCompanies();
    } catch (error: any) {
      console.error('Error approving company:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyetujui perusahaan",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase.rpc('reject_company', {
        _company_id: selectedCompany.company_id,
        _rejected_by: (await supabase.auth.getUser()).data.user?.id,
        _rejection_notes: verificationNotes
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Perusahaan berhasil ditolak",
      });

      setShowDialog(false);
      setVerificationNotes("");
      loadCompanies();
    } catch (error: any) {
      console.error('Error rejecting company:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menolak perusahaan",
        variant: "destructive",
      });
    }
  };

  const handleRequestCorrection = async () => {
    if (!selectedCompany || correctionFields.length === 0) return;

    try {
      const correctionNotes = correctionFields.reduce((acc, field) => {
        acc[field.field] = field.note;
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase.rpc('request_company_correction', {
        _company_id: selectedCompany.company_id,
        _requested_by: (await supabase.auth.getUser()).data.user?.id,
        _correction_notes: correctionNotes
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Permintaan koreksi berhasil dikirim",
      });

      setShowCorrectionDialog(false);
      setCorrectionFields([]);
      setShowDialog(false);
      loadCompanies();
    } catch (error: any) {
      console.error('Error requesting correction:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengirim permintaan koreksi",
        variant: "destructive",
      });
    }
  };

  const addCorrectionField = () => {
    setCorrectionFields([...correctionFields, { field: '', note: '' }]);
  };

  const updateCorrectionField = (index: number, field: string, note: string) => {
    const updated = [...correctionFields];
    updated[index] = { field, note };
    setCorrectionFields(updated);
  };

  const removeCorrectionField = (index: number) => {
    setCorrectionFields(correctionFields.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default">Terverifikasi</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'needs_correction':
        return <Badge variant="outline">Perlu Koreksi</Badge>;
      default:
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
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
        return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Manajemen Perusahaan
          </CardTitle>
          <CardDescription>
            Kelola verifikasi dan persetujuan perusahaan yang mendaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Dokumen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.company_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.company_name}</div>
                          <div className="text-sm text-muted-foreground">
                            NIB: {company.nib_number || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {company.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {company.document_count} dokumen, {company.pic_count} PIC
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(company.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(company.created_at), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(company)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detail Perusahaan</DialogTitle>
            <DialogDescription>
              Informasi lengkap dan dokumen perusahaan
            </DialogDescription>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : companyDetails ? (
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">Detail Perusahaan</TabsTrigger>
                <TabsTrigger value="pics">Penanggung Jawab</TabsTrigger>
                <TabsTrigger value="documents">Dokumen</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-6">
                <ScrollArea className="max-h-[60vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nama Perusahaan</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.company_name}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Jenis Perusahaan</Label>
                        <div className="mt-1 text-sm">
                          {companyDetails.company.company_type ? 
                            getCompanyTypeLabel(companyDetails.company.company_type) : 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.email}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Telepon</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.phone}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">NIB</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.nib_number || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">NPWP</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.npwp_number || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nomor Akta</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.akta_number || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Alamat</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.company_address}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Lokasi</Label>
                        <div className="mt-1 text-sm">
                          <LocationDisplay
                            provinceId={companyDetails.company.province_id}
                            kabupaténId={companyDetails.company.kabupaten_id}
                            kecamatan={companyDetails.company.kecamatan}
                            kelurahan={companyDetails.company.kelurahan}
                            showFull={true}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Kode Pos</Label>
                        <div className="mt-1 text-sm">{companyDetails.company.postal_code || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-1">{getStatusBadge(companyDetails.company.status)}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tanggal Daftar</Label>
                        <div className="mt-1 text-sm">
                          {format(new Date(companyDetails.company.created_at), "dd/MM/yyyy HH:mm")}
                        </div>
                      </div>
                      
                      {companyDetails.company.verified_at && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Tanggal Verifikasi</Label>
                          <div className="mt-1 text-sm">
                            {format(new Date(companyDetails.company.verified_at), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pics" className="space-y-4">
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-4">
                    {companyDetails.pics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada data penanggung jawab
                      </div>
                    ) : (
                      companyDetails.pics.map((pic, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Nama Lengkap</Label>
                                  <div className="text-sm">{pic.full_name}</div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Nomor KTP</Label>
                                  <div className="text-sm">{pic.id_number}</div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Telepon</Label>
                                  <div className="text-sm">{pic.phone_number}</div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Jabatan</Label>
                                  <div className="text-sm">{pic.position}</div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Alamat</Label>
                                  <div className="text-sm">{pic.address}</div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Lokasi</Label>
                                  <div className="text-sm">
                                    <LocationDisplay
                                      provinceId={pic.province_id}
                                      kabupaténId={pic.kabupaten_id}
                                      kecamatan={pic.kecamatan}
                                      kelurahan={pic.kelurahan}
                                      showFull={true}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Kode Pos</Label>
                                  <div className="text-sm">{pic.postal_code || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <ScrollArea className="max-h-[60vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {companyDetails.documents.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        Belum ada dokumen yang diupload
                      </div>
                    ) : (
                      companyDetails.documents.map((doc, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start space-x-3">
                            {getDocumentIcon(doc.document_type)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {doc.document_type === 'nib' && 'Dokumen NIB'}
                                {doc.document_type === 'npwp' && 'Dokumen NPWP'}
                                {doc.document_type === 'akta' && 'Dokumen Akta'}
                                {doc.document_type === 'ktp' && 'Dokumen KTP'}
                                {doc.document_type === 'assignment_letter' && 'Surat Penugasan'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {doc.file_name} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setCurrentPdfUrl(doc.file_path)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Lihat PDF
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : null}

          {/* PDF Viewer */}
          {currentPdfUrl && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Preview Dokumen</Label>
                <Button variant="outline" size="sm" onClick={() => setCurrentPdfUrl("")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted/50" style={{ height: '400px' }}>
                <iframe
                  src={currentPdfUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          {selectedCompany?.status === 'pending_verification' && (
            <div className="flex flex-col space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="notes">Catatan Verifikasi (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Masukkan catatan verifikasi..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCorrectionDialog(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Minta Koreksi
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Correction Dialog */}
      <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permintaan Koreksi</DialogTitle>
            <DialogDescription>
              Tentukan field yang perlu dikoreksi dan berikan catatan untuk setiap field
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {correctionFields.map((correction, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Select
                  value={correction.field}
                  onValueChange={(value) => updateCorrectionField(index, value, correction.note)}
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Pilih field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_name">Nama Perusahaan</SelectItem>
                    <SelectItem value="company_type">Jenis Perusahaan</SelectItem>
                    <SelectItem value="nib_number">Nomor NIB</SelectItem>
                    <SelectItem value="npwp_number">Nomor NPWP</SelectItem>
                    <SelectItem value="akta_number">Nomor Akta</SelectItem>
                    <SelectItem value="phone">Telepon</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="address">Alamat</SelectItem>
                    <SelectItem value="location">Lokasi</SelectItem>
                    <SelectItem value="documents">Dokumen</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Catatan koreksi..."
                  value={correction.note}
                  onChange={(e) => updateCorrectionField(index, correction.field, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeCorrectionField(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addCorrectionField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Field Koreksi
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCorrectionDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleRequestCorrection}
              disabled={correctionFields.length === 0}
            >
              Kirim Permintaan Koreksi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagement;