import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Building2, Users, Loader2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PublicRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    phone: "",
    role: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    
    if (!formData.role) {
      setError("Silakan pilih tipe user");
      return;
    }

    setLoading(true);
    
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Set user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: formData.role as "pelaku_usaha" | "internal_group"
          });

        if (roleError && !roleError.message.includes('already exists')) {
          console.error('Role assignment error:', roleError);
        }

        toast({
          title: "Pendaftaran Berhasil!",
          description: "Akun Anda telah terdaftar dan menunggu validasi admin. Silakan cek email untuk konfirmasi.",
        });
        
        navigate("/auth");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Daftar Akun Baru</h1>
            <p className="text-muted-foreground">
              Bergabung dengan platform visualisasi data penyelenggaraan telekomunikasi
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pendaftaran</CardTitle>
              <CardDescription>
                Silakan lengkapi informasi berikut untuk membuat akun baru. Akun akan divalidasi oleh admin sebelum dapat digunakan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">Tipe Pengguna *</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe pengguna" />
                    </SelectTrigger>
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
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+62"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {formData.role === 'pelaku_usaha' ? 'Nama Perusahaan *' : 'Nama Organisasi'}
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required={formData.role === 'pelaku_usaha'}
                  />
                </div>

                {/* Account Information */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi / Tujuan Penggunaan</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Jelaskan tujuan penggunaan platform ini..."
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar Akun
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Catatan Penting:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Akun akan divalidasi oleh tim admin sebelum dapat digunakan</li>
                  <li>• Proses validasi biasanya memakan waktu 1-2 hari kerja</li>
                  <li>• Anda akan menerima notifikasi email setelah akun disetujui</li>
                  <li>• Untuk akses admin, silakan hubungi administrator sistem</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicRegister;