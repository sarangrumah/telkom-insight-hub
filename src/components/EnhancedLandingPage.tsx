import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  BarChart3,
  Users,
  Building2,
  Globe,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Database,
  Eye,
  ChevronRight,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/apiClient';

const EnhancedLandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalLicenses: 0,
    activeOperators: 0,
    totalApplications: 0,
    pendingApprovals: 0,
  });

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Muat dan animasikan counter dari API publik (fallback ke 0 jika gagal)
  useEffect(() => {
    let timer: number | undefined;

    const animateTo = (target: {
      totalLicenses: number;
      activeOperators: number;
      totalApplications: number;
      pendingApprovals: number;
    }) => {
      const animationDuration = 2000;
      const steps = 60;
      const stepTime = animationDuration / steps;

      let currentStep = 0;
      if (timer) clearInterval(timer);
      timer = window.setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedStats({
          totalLicenses: Math.floor((target.totalLicenses || 0) * easeOut),
          activeOperators: Math.floor((target.activeOperators || 0) * easeOut),
          totalApplications: Math.floor((target.totalApplications || 0) * easeOut),
          pendingApprovals: Math.floor((target.pendingApprovals || 0) * easeOut),
        });

        if (currentStep >= steps) {
          if (timer) clearInterval(timer);
          setAnimatedStats({
            totalLicenses: Number(target.totalLicenses || 0),
            activeOperators: Number(target.activeOperators || 0),
            totalApplications: Number(target.totalApplications || 0),
            pendingApprovals: Number(target.pendingApprovals || 0),
          });
        }
      }, stepTime);
    };

    (async () => {
      try {
        const data = await apiFetch('/api/public/stats/dashboard') as {
          total_licenses?: number;
          active_operators?: number;
          total_applications?: number;
          pending_approvals?: number;
        };
        const target = {
          totalLicenses: data?.total_licenses ?? 0,
          activeOperators: data?.active_operators ?? 0,
          totalApplications: data?.total_applications ?? 0,
          pendingApprovals: data?.pending_approvals ?? 0,
        };
        animateTo(target);
      } catch {
        animateTo({
          totalLicenses: 0,
          activeOperators: 0,
          totalApplications: 0,
          pendingApprovals: 0,
        });
      }
    })();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Jenis Penyelenggaraan - daftar kartu dengan count dari DB (fallback 0)
  const [serviceTypes, setServiceTypes] = useState<
    { code: string; name: string; count: number; color: string; description: string }[]
  >([
    { code: 'jasa', name: 'Jasa', count: 0, color: 'bg-purple-500', description: 'Layanan telekomunikasi jasa' },
    { code: 'jaringan', name: 'Jaringan', count: 0, color: 'bg-amber-500', description: 'Infrastruktur jaringan' },
    { code: 'telsus', name: 'Telekomunikasi Khusus', count: 0, color: 'bg-emerald-500', description: 'Komunikasi khusus' },
    { code: 'isr', name: 'ISR', count: 0, color: 'bg-orange-500', description: 'Internet Service Retail' },
    { code: 'tarif', name: 'Tarif', count: 0, color: 'bg-sky-500', description: 'Pengaturan tarif' },
    { code: 'sklo', name: 'SKLO', count: 0, color: 'bg-fuchsia-500', description: 'Surat Keterangan Laik Operasi' },
    { code: 'lko', name: 'LKO', count: 0, color: 'bg-slate-500', description: 'Layanan Komunikasi Online' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiFetch('/api/public/stats/service-counts') as {
          counts?: { code?: string; name?: string; count?: number }[];
        };
        const list = resp?.counts || [];
        const map = new Map(
          list.map(x => [String(x.code || '').toLowerCase(), Number(x.count || 0)])
        );
        setServiceTypes(prev =>
          prev.map(s => ({
            ...s,
            count: map.get(s.code) ?? 0, // jika tidak ada di DB -> 0
          }))
        );
      } catch {
        // biarkan default 0
      }
    })();
  }, []);

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: 'Visualisasi Data Real-time',
      description:
        'Dashboard interaktif dengan grafik dan chart yang update secara real-time',
    },
    {
      icon: <Database className="h-8 w-8 text-accent" />,
      title: 'Integrasi Multi-Source',
      description:
        'Mengintegrasikan data dari berbagai sumber untuk analisis komprehensif',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Keamanan Tingkat Enterprise',
      description: 'Sistem keamanan berlapis dengan enkripsi end-to-end',
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: 'Performa Tinggi',
      description: 'Platform high-performance dengan response time sub-detik',
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Responsive Navbar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50'
            : 'bg-transparent'
        } ${
          isMobileMenuOpen && !isScrolled ? 'shadow-xl shadow-primary/10' : ''
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              <div className="relative">
                <Globe className="h-6 w-6 lg:h-8 lg:w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              </div>
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Panel Penyelenggaraan
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/public/faq')}
                className={`text-sm lg:text-base transition-all duration-300 px-3 lg:px-4 py-1.5 lg:py-2 ${
                  isScrolled || isMobileMenuOpen
                    ? 'hover:bg-primary/10 text-foreground'
                    : 'hover:bg-white/10 text-foreground hover:text-primary'
                }`}
              >
                FAQ
              </Button>

              {user ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-sm lg:text-base px-3 lg:px-4 py-1.5 lg:py-2 transition-all duration-300 transform hover:scale-105"
                >
                  Dashboard
                  <ArrowRight className="ml-1.5 lg:ml-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/auth')}
                    className={`text-sm lg:text-base transition-all duration-300 ${
                      isScrolled || isMobileMenuOpen
                        ? 'hover:bg-primary/10 text-foreground hover:text-primary'
                        : 'hover:bg-white/20 text-foreground hover:text-primary'
                    }`}
                  >
                    Masuk
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-sm lg:text-base px-3 lg:px-4 transition-all duration-300 transform hover:scale-105"
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div
              className={`md:hidden border-t transform transition-all duration-300 ease-in-out ${
                isScrolled || isMobileMenuOpen
                  ? 'border-border/50'
                  : 'border-white/20'
              } animate-slide-down`}
            >
              <div className="px-4 py-4 space-y-4 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/public/faq');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-base hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  FAQ
                </Button>

                {user ? (
                  <Button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-base transition-all duration-300 transform hover:scale-105"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-base border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300"
                    >
                      Masuk
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-base transition-all duration-300 transform hover:scale-105"
                    >
                      Daftar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Enhanced Hero Section with Responsive Design */}
      <section className="relative pt-20 lg:pt-24 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 lg:mb-8 leading-tight">
              Visualisasi Data
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse mt-2">
                Penyelenggaraan Telekomunikasi
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Platform next-generation untuk mengelola, memvisualisasikan, dan
              menganalisis data penyelenggaraan telekomunikasi Indonesia dengan
              teknologi AI dan real-time analytics.
            </p>
          </div>

          {/* Enhanced Responsive Search Bar */}
          <div className="max-w-4xl mx-auto mb-8 lg:mb-12 animate-scale-in px-4 sm:px-0">
            <Card className="border-primary/20 shadow-glow bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Cari data penyelenggaraan telekomunikasi..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 sm:h-14 text-base lg:text-lg border-primary/20 focus:border-primary/50 bg-background/50"
                      onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="px-6 sm:px-8 h-12 sm:h-14 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow text-base lg:text-lg whitespace-nowrap"
                  >
                    Cari <Search className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Responsive Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in px-4 sm:px-0">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base lg:text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transform hover:scale-105 transition-all w-full sm:w-auto"
            >
              {user ? 'Buka Dashboard' : 'Mulai Sekarang'}
              <ArrowRight className="ml-3 h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/data-visualization')}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base lg:text-lg border-primary/30 hover:bg-primary/10 transform hover:scale-105 transition-all w-full sm:w-auto"
            >
              <Eye className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
              Lihat Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Statistics Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Data Real-time Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">
                  Total Izin
                </CardTitle>
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {animatedStats.totalLicenses.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Izin penyelenggaraan aktif
                </p>
                <div className="mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">
                  Pelaku Usaha
                </CardTitle>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent mb-2">
                  {animatedStats.activeOperators}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Penyelenggara aktif
                </p>
                <div className="mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">
                  Total Aplikasi
                </CardTitle>
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-chart-4 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
                  style={{ color: 'hsl(var(--chart-4))' }}
                >
                  {animatedStats.totalApplications}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Permohonan diproses
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-chart-4/10 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">
                  Menunggu Persetujuan
                </CardTitle>
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-chart-5 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
                  style={{ color: 'hsl(var(--chart-5))' }}
                >
                  {animatedStats.pendingApprovals}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Permohonan pending
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-chart-5/10 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    -5% bulan ini
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Features Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Platform Teknologi Terdepan
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Dibangun dengan teknologi modern untuk memberikan pengalaman
              analisis data yang tak tertandingi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/80 border-primary/10"
              >
                <CardHeader>
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Service Types Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Jenis Penyelenggaraan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {serviceTypes.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group bg-gradient-to-br from-card to-card/80"
                onClick={() =>
                  navigate(
                    `/data-visualization?service=${service.name.toLowerCase()}`
                  )
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {service.name}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                  </div>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className="text-sm sm:text-lg font-semibold px-2 sm:px-3 py-1"
                      >
                        {service.count}
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Data terdaftar
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${service.color} shadow-md flex-shrink-0`}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Responsive CTA Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-accent"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lg:mb-8 leading-tight">
              Bergabung dengan Platform Terdepan
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 lg:mb-10 opacity-90 leading-relaxed max-w-4xl mx-auto">
              Dapatkan akses lengkap ke visualisasi data real-time, analytics
              AI-powered, dan insights yang mengubah cara Anda memahami industri
              telekomunikasi
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
              {!user && (
                <>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate('/register')}
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base lg:text-lg bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    <Star className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                    Daftar Sebagai Pelaku Usaha
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base lg:text-lg border-white/30 text-white hover:bg-white/10 transform hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    Masuk ke Akun
                    <ArrowRight className="ml-3 h-5 w-5 lg:h-6 lg:w-6" />
                  </Button>
                </>
              )}
              {user && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base lg:text-lg bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all w-full sm:w-auto max-w-md mx-auto"
                >
                  <BarChart3 className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                  Kembali ke Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Panel Peneyelenggaraan
                </h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-md">
                Platform visualisasi data penyelenggaraan telekomunikasi
                Indonesia yang komprehensif, terintegrasi, dan didukung
                teknologi AI untuk insights yang mendalam.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs sm:text-sm"
                >
                  AI-Powered
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-accent/10 text-accent text-xs sm:text-sm"
                >
                  Real-time
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-chart-4/10 text-xs sm:text-sm"
                >
                  Secure
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">
                Layanan
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Visualisasi Data
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Manajemen Izin
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Analisis Statistik
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Integrasi API
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  AI Analytics
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">
                Kontak & Support
              </h4>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="break-all">+62 21 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="break-all">info@komdigi.go.id</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-primary cursor-pointer transition-colors">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 lg:mt-12 pt-6 lg:pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              &copy; 2025 BimaCreativeTech. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;
