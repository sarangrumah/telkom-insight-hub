import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, Users, Building2, Globe, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock summary data - replace with real data from API
  const summaryStats = {
    totalLicenses: 1247,
    activeOperators: 89,
    totalApplications: 456,
    pendingApprovals: 23
  };

  const serviceTypes = [
    { name: "Jasa", count: 234, color: "bg-chart-1" },
    { name: "Jaringan", count: 345, color: "bg-chart-2" },
    { name: "Telekomunikasi Khusus", count: 123, color: "bg-chart-3" },
    { name: "ISR", count: 189, color: "bg-chart-4" },
    { name: "Tarif", count: 167, color: "bg-chart-5" },
    { name: "SKLO", count: 98, color: "bg-primary" },
    { name: "LKO", count: 91, color: "bg-secondary" }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results or filtered data view
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TelekomViz</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/faq")}>
              FAQ
            </Button>
            {user ? (
              <Button onClick={() => navigate("/dashboard")}>
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Masuk
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Visualisasi Data
            <span className="block text-primary">Penyelenggaraan Telekomunikasi</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Platform komprehensif untuk mengelola, memvisualisasikan, dan menganalisis data 
            penyelenggaraan telekomunikasi Indonesia dengan berbagai sumber data terintegrasi.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari data penyelenggaraan telekomunikasi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    Cari
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button size="lg" onClick={handleGetStarted}>
            {user ? "Buka Dashboard" : "Mulai Sekarang"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Summary Statistics */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ringkasan Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Izin</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalLicenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Izin penyelenggaraan aktif</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pelaku Usaha</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.activeOperators}</div>
                <p className="text-xs text-muted-foreground">Penyelenggara aktif</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Aplikasi</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Permohonan diproses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Permohonan pending</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Types Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Jenis Penyelenggaraan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {serviceTypes.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-lg font-semibold">
                      {service.count}
                    </Badge>
                    <div className={`w-4 h-4 rounded-full ${service.color}`}></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Data terdaftar</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bergabung dengan Platform Kami</h2>
          <p className="text-xl mb-8 opacity-90">
            Dapatkan akses lengkap ke visualisasi data dan fitur analisis yang powerful
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <>
                <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
                  Daftar Sebagai Pelaku Usaha
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                  Masuk ke Akun
                </Button>
              </>
            )}
            {user && (
              <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
                Kembali ke Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">TelekomViz</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform visualisasi data penyelenggaraan telekomunikasi Indonesia yang komprehensif dan terintegrasi.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Visualisasi Data</li>
                <li>Manajemen Izin</li>
                <li>Analisis Statistik</li>
                <li>Integrasi API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/faq")}>FAQ</button></li>
                <li><button onClick={() => navigate("/support")}>Dukungan</button></li>
                <li>Dokumentasi API</li>
                <li>Panduan Pengguna</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@telekomviz.id</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TelekomViz. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;