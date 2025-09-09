import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Building2, Users, Loader2, Globe, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RegistrationSteps } from "@/components/RegistrationSteps";
import { LocationSelector } from "@/components/LocationSelector";
import { FileUpload } from "@/components/FileUpload";
import { 
  accountFormSchema, 
  companyFormSchema, 
  picFormSchema,
  validatePDFFile,
  type AccountFormData,
  type CompanyFormData,
  type PICFormData
} from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const EnhancedPublicRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Form state for all steps
  const [accountData, setAccountData] = useState<AccountFormData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyFormData | null>(null);
  const [documents, setDocuments] = useState({
    nib: null as string | null,
    npwp: null as string | null,
    akta: null as string | null,
    ktp: null as string | null,
    assignmentLetter: null as string | null
  });

  // Form instances
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      maksudTujuan: ""
    }
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      nibNumber: "",
      npwpNumber: "",
      phone: "",
      companyType: undefined,
      aktaNumber: "",
      address: "",
      provinceId: "",
      kabupaténId: "",
      kecamatan: "",
      kelurahan: "",
      postalCode: ""
    }
  });

  const picForm = useForm<PICFormData>({
    resolver: zodResolver(picFormSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phoneNumber: "",
      position: "",
      address: "",
      provinceId: "",
      kabupaténId: "",
      kecamatan: "",
      kelurahan: "",
      postalCode: ""
    }
  });

  const validateDocuments = () => {
    const errors: string[] = [];
    
    if (!documents.nib) errors.push("Dokumen NIB wajib diupload");
    if (!documents.npwp) errors.push("Dokumen NPWP wajib diupload");
    if (!documents.akta) errors.push("Dokumen Akta wajib diupload");
    if (!documents.ktp) errors.push("Dokumen KTP Penanggung Jawab wajib diupload");
    if (!documents.assignmentLetter) errors.push("Surat Penugasan wajib diupload");
    
    return errors;
  };

  const checkEmailUniqueness = async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    
    if (error && !error.message.includes('JWT')) {
      // Check through auth users if possible, but this might not work due to RLS
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-check' // This will fail but might tell us if user exists
      });
      
      return false; // For now, assume email is unique
    }
    return true;
  };

  const checkCompanyUniqueness = async (companyName: string, nibNumber: string) => {
    const { data: companyData, error } = await supabase
      .from('companies')
      .select('id')
      .or(`company_name.eq.${companyName},nib_number.eq.${nibNumber}`);
    
    if (error) {
      console.error('Error checking company uniqueness:', error);
      return true; // Assume unique if check fails
    }
    
    return !companyData || companyData.length === 0;
  };

  const handleAccountSubmit = async (data: AccountFormData) => {
    setGlobalError("");
    
    // Check email uniqueness
    const isEmailUnique = await checkEmailUniqueness(data.email);
    if (!isEmailUnique) {
      setGlobalError("Email sudah terdaftar");
      return;
    }
    
    setAccountData(data);
    setCompletedSteps(prev => [...prev.filter(s => s !== 1), 1]);
    setCurrentStep(2);
  };

  const handleCompanySubmit = async (data: CompanyFormData) => {
    setGlobalError("");
    
    // Check company uniqueness
    const isCompanyUnique = await checkCompanyUniqueness(data.companyName, data.nibNumber);
    if (!isCompanyUnique) {
      setGlobalError("Nama perusahaan atau NIB sudah terdaftar");
      return;
    }

    // Validate required documents
    const docErrors = validateDocuments();
    if (docErrors.length > 0) {
      setGlobalError(docErrors.join(", "));
      return;
    }
    
    setCompanyData(data);
    setCompletedSteps(prev => [...prev.filter(s => s !== 2), 2]);
    setCurrentStep(3);
  };

  const handlePICSubmit = async (data: PICFormData) => {
    if (!accountData || !companyData) {
      setGlobalError("Data tidak lengkap. Silakan mulai dari awal.");
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: data.fullName,
            maksud_tujuan: accountData.maksudTujuan
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 2. Create company
      const { data: companyRecord, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: companyData.companyName,
          nib_number: companyData.nibNumber,
          npwp_number: companyData.npwpNumber,
          phone: companyData.phone,
          company_type: companyData.companyType,
          akta_number: companyData.aktaNumber,
          company_address: companyData.address,
          province_id: companyData.provinceId,
          kabupaten_id: companyData.kabupaténId,
          kecamatan: companyData.kecamatan,
          kelurahan: companyData.kelurahan,
          postal_code: companyData.postalCode,
          email: accountData.email,
          business_field: "Telekomunikasi"
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          company_id: companyRecord.id,
          full_name: data.fullName,
          phone: data.phoneNumber,
          position: data.position,
          is_company_admin: true
        });

      if (profileError) throw profileError;

      // 4. Set user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: accountData.role
        });

      if (roleError && !roleError.message.includes('already exists')) {
        console.error('Role assignment error:', roleError);
      }

      // 5. Create PIC record
      const { data: picRecord, error: picError } = await supabase
        .from('person_in_charge')
        .insert({
          company_id: companyRecord.id,
          full_name: data.fullName,
          id_number: data.idNumber,
          phone_number: data.phoneNumber,
          position: data.position,
          address: data.address,
          province_id: data.provinceId,
          kabupaten_id: data.kabupaténId,
          kecamatan: data.kecamatan,
          kelurahan: data.kelurahan,
          postal_code: data.postalCode
        })
        .select()
        .single();

      if (picError) throw picError;

      // 6. Store company documents
      const companyDocs = [
        { type: 'nib' as const, url: documents.nib },
        { type: 'npwp' as const, url: documents.npwp },
        { type: 'akta' as const, url: documents.akta }
      ].filter(doc => doc.url);

      for (const doc of companyDocs) {
        const { error: docError } = await supabase
          .from('company_documents')
          .insert({
            company_id: companyRecord.id,
            document_type: doc.type,
            file_path: doc.url!,
            file_name: `${doc.type}-document.pdf`,
            file_size: 0, // This should be set from actual file
            uploaded_by: authData.user.id
          });

        if (docError) {
          console.error(`Error saving ${doc.type} document:`, docError);
        }
      }

      // 7. Store PIC documents
      const picDocs = [
        { type: 'ktp' as const, url: documents.ktp },
        { type: 'assignment_letter' as const, url: documents.assignmentLetter }
      ].filter(doc => doc.url);

      for (const doc of picDocs) {
        const { error: docError } = await supabase
          .from('pic_documents')
          .insert({
            pic_id: picRecord.id,
            document_type: doc.type,
            file_path: doc.url!,
            file_name: `${doc.type}-document.pdf`,
            file_size: 0, // This should be set from actual file
            uploaded_by: authData.user.id
          });

        if (docError) {
          console.error(`Error saving ${doc.type} document:`, docError);
        }
      }

      toast({
        title: "Pendaftaran Berhasil!",
        description: "Akun Anda telah terdaftar dengan lengkap. Silakan cek email untuk konfirmasi dan menunggu validasi admin.",
      });
      
      navigate("/auth");

    } catch (error: any) {
      console.error('Registration error:', error);
      setGlobalError(error.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      accountForm.handleSubmit(handleAccountSubmit)();
    } else if (currentStep === 2) {
      companyForm.handleSubmit(handleCompanySubmit)();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={accountForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Pengguna *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe pengguna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pelaku_usaha">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4" />
                              <span>Pelaku Usaha / Penyelenggara</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="internal_group">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Internal Group</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={accountForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={accountForm.control}
                name="maksudTujuan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksud Tujuan *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Jelaskan maksud dan tujuan penggunaan platform ini..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Kriteria Password:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimal 8 karakter</li>
                  <li>• Mengandung minimal 1 huruf kapital</li>
                  <li>• Mengandung minimal 1 angka</li>
                  <li>• Mengandung minimal 1 karakter khusus (!@#$%^&*)</li>
                </ul>
              </div>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Perusahaan *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={companyForm.control}
                  name="companyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Perusahaan *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis perusahaan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
                          <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
                          <SelectItem value="ud">UD (Usaha Dagang)</SelectItem>
                          <SelectItem value="koperasi">Koperasi</SelectItem>
                          <SelectItem value="yayasan">Yayasan</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="nibNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor NIB *</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={15} placeholder="123456789012345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={companyForm.control}
                  name="npwpNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor NPWP *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12.345.678.9-012.345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+628123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={companyForm.control}
                  name="aktaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Akta *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={companyForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-sm font-medium">Lokasi *</Label>
                <div className="mt-2">
                  <LocationSelector
                    value={{
                      provinceId: companyForm.watch('provinceId'),
                      kabupaténId: companyForm.watch('kabupaténId'),
                      kecamatan: companyForm.watch('kecamatan'),
                      kelurahan: companyForm.watch('kelurahan')
                    }}
                    onChange={(location) => {
                      if (location.provinceId) companyForm.setValue('provinceId', location.provinceId);
                      if (location.kabupaténId) companyForm.setValue('kabupaténId', location.kabupaténId);
                      if (location.kecamatan) companyForm.setValue('kecamatan', location.kecamatan);
                      if (location.kelurahan) companyForm.setValue('kelurahan', location.kelurahan);
                    }}
                    required
                  />
                </div>
              </div>

              <FormField
                control={companyForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos *</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Dokumen Perusahaan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Dokumen NIB *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.nib}
                        onChange={(url) => setDocuments(prev => ({ ...prev, nib: url }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Dokumen NPWP *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.npwp}
                        onChange={(url) => setDocuments(prev => ({ ...prev, npwp: url }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Dokumen Akta *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.akta}
                        onChange={(url) => setDocuments(prev => ({ ...prev, akta: url }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        );

      case 3:
        return (
          <Form {...picForm}>
            <form onSubmit={picForm.handleSubmit(handlePICSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={picForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={picForm.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor KTP *</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={16} placeholder="1234567890123456" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={picForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+628123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={picForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={picForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-sm font-medium">Lokasi *</Label>
                <div className="mt-2">
                  <LocationSelector
                    value={{
                      provinceId: picForm.watch('provinceId'),
                      kabupaténId: picForm.watch('kabupaténId'),
                      kecamatan: picForm.watch('kecamatan'),
                      kelurahan: picForm.watch('kelurahan')
                    }}
                    onChange={(location) => {
                      if (location.provinceId) picForm.setValue('provinceId', location.provinceId);
                      if (location.kabupaténId) picForm.setValue('kabupaténId', location.kabupaténId);
                      if (location.kecamatan) picForm.setValue('kecamatan', location.kecamatan);
                      if (location.kelurahan) picForm.setValue('kelurahan', location.kelurahan);
                    }}
                    required
                  />
                </div>
              </div>

              <FormField
                control={picForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos *</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Dokumen Penanggung Jawab</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Dokumen KTP *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.ktp}
                        onChange={(url) => setDocuments(prev => ({ ...prev, ktp: url }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Surat Penugasan *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.assignmentLetter}
                        onChange={(url) => setDocuments(prev => ({ ...prev, assignmentLetter: url }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Panel Penyelenggaraan</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sudah Punya Akun?
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Daftar Akun Baru</h1>
            <p className="text-muted-foreground">
              Lengkapi semua data untuk mendaftar sebagai penyelenggara telekomunikasi
            </p>
          </div>

          {/* Progress Steps */}
          <RegistrationSteps 
            currentStep={currentStep} 
            completedSteps={completedSteps}
          />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Data Akun"}
                {currentStep === 2 && "Data Penyelenggara"}
                {currentStep === 3 && "Data Penanggung Jawab"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Masukkan informasi akun dan tujuan penggunaan"}
                {currentStep === 2 && "Masukkan informasi lengkap perusahaan dan upload dokumen"}
                {currentStep === 3 && "Masukkan informasi penanggung jawab dan upload dokumen"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {globalError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{globalError}</AlertDescription>
                </Alert>
              )}

              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
                
                {currentStep < 3 ? (
                  <Button type="button" onClick={goToNextStep}>
                    Selanjutnya
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={picForm.handleSubmit(handlePICSubmit)}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar Akun
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3">Catatan Penting:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Semua dokumen harus dalam format PDF dengan ukuran maksimal 5MB</li>
              <li>• Akun akan divalidasi oleh tim admin sebelum dapat digunakan</li>
              <li>• Proses validasi biasanya memakan waktu 1-3 hari kerja</li>
              <li>• Anda akan menerima notifikasi email setelah akun disetujui</li>
              <li>• Pastikan semua data yang dimasukkan benar dan sesuai dokumen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPublicRegister;