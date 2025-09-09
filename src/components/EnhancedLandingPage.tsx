import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, BarChart3, Users, Building2, Globe, ArrowRight, Phone, Mail, MapPin,
  TrendingUp, Shield, Zap, Database, Eye, ChevronRight, Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const EnhancedLandingPage = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedStats, setAnimatedStats] = useState({
    totalLicenses: 0,
    activeOperators: 0,
    totalApplications: 0,
    pendingApprovals: 0
  });

  // Target stats values
  const targetStats = {
    totalLicenses: 1247,
    activeOperators: 89,
    totalApplications: 456,
    pendingApprovals: 23
  };

  // Animate counters on load
  useEffect(() => {
    const animationDuration = 2000;
    const steps = 60;
    const stepTime = animationDuration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalLicenses: Math.floor(targetStats.totalLicenses * easeOut),
        activeOperators: Math.floor(targetStats.activeOperators * easeOut),
        totalApplications: Math.floor(targetStats.totalApplications * easeOut),
        pendingApprovals: Math.floor(targetStats.pendingApprovals * easeOut)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(targetStats);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const serviceTypes = [
    { name: "Jasa", count: 234, color: "bg-chart-1", description: "Layanan telekomunikasi jasa" },
    { name: "Jaringan", count: 345, color: "bg-chart-2", description: "Infrastruktur jaringan" },
    { name: "Telekomunikasi Khusus", count: 123, color: "bg-chart-3", description: "Komunikasi khusus" },
    { name: "ISR", count: 189, color: "bg-chart-4", description: "Internet Service Retail" },
    { name: "Tarif", count: 167, color: "bg-chart-5", description: "Pengaturan tarif" },
    { name: "SKLO", count: 98, color: "bg-primary", description: "Surat Keterangan Laik Operasi" },
    { name: "LKO", count: 91, color: "bg-secondary", description: "Layanan Komunikasi Online" }
  ];

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Visualisasi Data Real-time",
      description: "Dashboard interaktif dengan grafik dan chart yang update secara real-time"
    },
    {
      icon: <Database className="h-8 w-8 text-accent" />,
      title: "Integrasi Multi-Source",
      description: "Mengintegrasikan data dari berbagai sumber untuk analisis komprehensif"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Keamanan Tingkat Enterprise",
      description: "Sistem keamanan berlapis dengan enkripsi end-to-end"
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: "Performa Tinggi",
      description: "Platform high-performance dengan response time sub-detik"
    }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
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
      {/* Animated Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Globe className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Panel Penyelenggaraan
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/faq")} className="hover:bg-primary/10">
              FAQ
            </Button>
            {user && session ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow">
                Beranda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:bg-primary/10">
                  Masuk
                </Button>
                <Button onClick={() => navigate("/register")} className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow">
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax Effect */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              <span className="block">Visualisasi Data</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse mt-2">
                Penyelenggaraan Telekomunikasi
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
              Platform next-generation untuk mengelola, memvisualisasikan, dan menganalisis data 
              penyelenggaraan telekomunikasi Indonesia dengan teknologi AI dan real-time analytics.
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mt-8 md:mt-12 mb-8 md:mb-12 animate-scale-in">
            <Card className="border-primary/20 shadow-glow bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Cari data penyelenggaraan telekomunikasi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 md:h-14 text-base md:text-lg border-primary/20 focus:border-primary/50 bg-background/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    size="lg" 
                    className="px-6 md:px-8 h-12 md:h-14 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
                  >
                    <span className="hidden sm:inline">Cari</span>
                    <Search className="h-5 w-5 sm:ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center animate-fade-in px-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transform hover:scale-105 transition-all"
            >
              {user ? "Buka Dashboard" : "Mulai Sekarang"}
              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/data-visualization")}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg border-primary/30 hover:bg-primary/10 transform hover:scale-105 transition-all"
            >
              <Eye className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              Lihat Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Animated Statistics */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Data Real-time Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total Izin</CardTitle>
                <Building2 className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">
                  {animatedStats.totalLicenses.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Izin penyelenggaraan aktif</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Pelaku Usaha</CardTitle>
                <Users className="h-6 w-6 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent mb-2">
                  {animatedStats.activeOperators}
                </div>
                <p className="text-sm text-muted-foreground">Penyelenggara aktif</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Total Aplikasi</CardTitle>
                <BarChart3 className="h-6 w-6 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--chart-4))' }}>
                  {animatedStats.totalApplications}
                </div>
                <p className="text-sm text-muted-foreground">Permohonan diproses</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-chart-4/10">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Menunggu Persetujuan</CardTitle>
                <Globe className="h-6 w-6 text-chart-5" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--chart-5))' }}>
                  {animatedStats.pendingApprovals}
                </div>
                <p className="text-sm text-muted-foreground">Permohonan pending</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-chart-5/10">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    -5% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Platform Teknologi Terdepan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dibangun dengan teknologi modern untuk memberikan pengalaman analisis data yang tak tertandingi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80 border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Service Types */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Jenis Penyelenggaraan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {serviceTypes.map((service, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group bg-gradient-to-br from-card to-card/80 p-1"
                onClick={() => navigate(`/service/${service.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <CardDescription className="text-xs md:text-sm leading-relaxed">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-sm md:text-lg font-semibold px-2 md:px-3 py-1">
                        {service.count}
                      </Badge>
                      <p className="text-xs md:text-sm text-muted-foreground mt-2">Data terdaftar</p>
                    </div>
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${service.color} shadow-md flex-shrink-0`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-accent"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Bergabung dengan Platform Terdepan
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 opacity-90 leading-relaxed px-4">
              Dapatkan akses lengkap ke visualisasi data real-time, analytics AI-powered, 
              dan insights yang mengubah cara Anda memahami industri telekomunikasi
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4">
              {!user && (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all"
                  >
                    <Star className="mr-3 h-6 w-6" />
                    Daftar Sebagai Pelaku Usaha
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate("/auth")}
                    className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10 transform hover:scale-105 transition-all"
                  >
                    Masuk ke Akun
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </>
              )}
              {user && session && (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all"
                >
                  <BarChart3 className="mr-3 h-6 w-6" />
                  Kembali ke Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Panel Peneyelenggaraan
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                Platform visualisasi data penyelenggaraan telekomunikasi Indonesia yang komprehensif, 
                terintegrasi, dan didukung teknologi AI untuk insights yang mendalam.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Real-time
                </Badge>
                <Badge variant="secondary" className="bg-chart-4/10">
                  Secure
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Layanan</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Visualisasi Data</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Manajemen Izin</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Analisis Statistik</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Integrasi API</li>
                <li className="hover:text-primary cursor-pointer transition-colors">AI Analytics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Kontak & Support</h4>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <Phone className="h-5 w-5" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>info@komdigi.go.id</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <MapPin className="h-5 w-5" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; 2025 BimaCreativeTech. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;