import { useState, useEffect } from "react";
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

  const validateRegistrationData = async (email: string, companyName?: string, nibNumber?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-registration-data', {
        body: { email, companyName, nibNumber }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error('Gagal memvalidasi data. Silakan coba lagi.');
    }
  };


  const handleAccountSubmit = async (data: AccountFormData) => {
    setLoading(true);
    setGlobalError("");
    
    try {
      // Validate email uniqueness
      const validation = await validateRegistrationData(data.email);
      if (!validation.valid) {
        setGlobalError(validation.errors.join(", "));
        return;
      }
      
      setAccountData(data);
      setCompletedSteps(prev => [...prev.filter(s => s !== 1), 1]);
      setCurrentStep(2);
    } catch (error: any) {
      setGlobalError(error.message || "Terjadi kesalahan saat memvalidasi data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (data: CompanyFormData) => {
    setLoading(true);
    setGlobalError("");
    
    try {
      // Validate company uniqueness
      const validation = await validateRegistrationData("", data.companyName, data.nibNumber);
      if (!validation.valid) {
        setGlobalError(validation.errors.join(", "));
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
    } catch (error: any) {
      setGlobalError(error.message || "Terjadi kesalahan saat memvalidasi data");
    } finally {
      setLoading(false);
    }
  };

  const handlePICSubmit = async (data: PICFormData) => {
    if (!accountData || !companyData) {
      setGlobalError("Data tidak lengkap. Silakan mulai dari awal.");
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      // Complete registration using edge function
      const { data: result, error } = await supabase.functions.invoke('complete-registration', {
        body: {
          accountData,
          companyData,
          picData: data,
          documents
        }
      });

      if (error) throw error;

      if (result.success) {
        toast({
          title: "Pendaftaran Berhasil!",
          description: result.message,
        });
        
        navigate("/auth");
      } else {
        throw new Error(result.error);
      }

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
                        <Input 
                          type="email" 
                          autoComplete="username"
                          {...field} 
                        />
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe pengguna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[100]">
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
                        <Input 
                          type="password" 
                          autoComplete="new-password"
                          {...field} 
                        />
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
                        <Input 
                          type="password" 
                          autoComplete="new-password"
                          {...field} 
                        />
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
                        <Input 
                          autoComplete="off"
                          placeholder="Masukkan nama perusahaan"
                          {...field} 
                        />
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis perusahaan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[100]">
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
                        <Input 
                          autoComplete="nope"
                          type="text"
                          maxLength={15} 
                          placeholder="123456789012345"
                          {...field} 
                        />
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
                        <Input 
                          autoComplete="nope"
                          {...field} 
                          placeholder="12.345.678.9-012.345" 
                        />
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
                        allowPublicUpload={true}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Dokumen NPWP *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.npwp}
                        onChange={(url) => setDocuments(prev => ({ ...prev, npwp: url }))}
                        allowPublicUpload={true}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Dokumen Akta *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.akta}
                        onChange={(url) => setDocuments(prev => ({ ...prev, akta: url }))}
                        allowPublicUpload={true}
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
                        allowPublicUpload={true}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Surat Penugasan *</Label>
                    <div className="mt-2">
                      <FileUpload
                        value={documents.assignmentLetter}
                        onChange={(url) => setDocuments(prev => ({ ...prev, assignmentLetter: url }))}
                        allowPublicUpload={true}
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