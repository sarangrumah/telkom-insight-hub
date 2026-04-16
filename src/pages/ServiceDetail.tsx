import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, ArrowLeft, Filter, MapPin, Building2, Calendar, 
  FileText, Users, TrendingUp, BarChart3, Download 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchServices, fetchSubServices } from "@/constants/serviceTypes";

interface LicenseData {
  id: string;
  company_name: string;
  license_number: string;
  license_date: string;
  status: string;
  province_name?: string;
  kabupaten_name?: string;
  sub_service_name?: string;
  region: string;
}

interface ServiceInfo {
  name: string;
  description: string;
  count: number;
  color: string;
}

const ServiceDetail = () => {
  const { serviceName } = useParams<{ serviceName: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [filteredData, setFilteredData] = useState<LicenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [provinces, setProvinces] = useState<Array<{ id: string; name: string; [key: string]: unknown }>>([]);

  // Service info mapping
  const serviceTypes: Record<string, ServiceInfo> = {
    'jasa': { name: "Jasa Telekomunikasi", description: "Layanan telekomunikasi jasa", count: 234, color: "bg-chart-1" },
    'jaringan': { name: "Jaringan Telekomunikasi", description: "Infrastruktur jaringan telekomunikasi", count: 345, color: "bg-chart-2" },
    'telekomunikasi-khusus': { name: "Telekomunikasi Khusus", description: "Komunikasi khusus dan terbatas", count: 123, color: "bg-chart-3" },
    'isr': { name: "Internet Service Retail", description: "Layanan internet retail", count: 189, color: "bg-chart-4" },
    'tarif': { name: "Pengaturan Tarif", description: "Regulasi dan pengaturan tarif", count: 167, color: "bg-chart-5" },
    'sklo': { name: "Surat Keterangan Laik Operasi", description: "SKLO untuk operasi telekomunikasi", count: 98, color: "bg-primary" },
    'lko': { name: "Layanan Komunikasi Online", description: "Platform komunikasi online", count: 91, color: "bg-secondary" }
  };

  // Fetch service data
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceName) return;

      setLoading(true);
      try {
        // Set service info
        const currentService = serviceTypes[serviceName];
        if (currentService) {
          setServiceInfo(currentService);
        }

        // Fetch provinces for filtering
        const { data: provincesData } = await supabase
          .from('provinces')
          .select('*')
          .order('name');
        if (provincesData) setProvinces(provincesData);

        // Fetch services and sub-services to match the service name
        const [services, subServices] = await Promise.all([
          fetchServices(),
          fetchSubServices()
        ]);

        // Find matching service by name (case insensitive, handle URL slug format)
        const normalizedServiceName = serviceName.replace(/-/g, ' ');
        const matchingService = services.find(s => {
          const normalizedName = s.name.toLowerCase();
          const searchName = normalizedServiceName.toLowerCase();
          return normalizedName.includes(searchName) || 
                 searchName.includes(normalizedName) ||
                 s.code === serviceName; // Also try exact code match
        });

        // Build query for telekom_data based on service
        let query = supabase
          .from('telekom_data')
          .select(`
            id,
            company_name,
            license_number,
            license_date,
            status,
            region,
            sub_service_id,
            province_id,
            kabupaten_id,
            provinces:province_id(name),
            kabupaten:kabupaten_id(name),
            sub_services:sub_service_id(name)
          `);

        // Apply service filter if we found a matching service
        if (matchingService) {
          const relatedSubServices = subServices.filter(ss => ss.service_id === matchingService.id);
          const subServiceIds = relatedSubServices.map(ss => ss.id);
          if (subServiceIds.length > 0) {
            query = query.in('sub_service_id', subServiceIds);
          }
        }

        const { data: telekomData, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching telekom data:', error);
          return;
        }

        // Transform data for display
        const transformedData: LicenseData[] = (telekomData || []).map((item: {
          id: string;
          company_name: string;
          license_number?: string;
          license_date?: string;
          status?: string;
          provinces?: { name?: string };
          kabupaten?: { name?: string };
          sub_services?: { name?: string };
          region?: string;
        }) => ({
          id: item.id,
          company_name: item.company_name,
          license_number: item.license_number || 'N/A',
          license_date: item.license_date || 'N/A',
          status: item.status || 'active',
          province_name: item.provinces?.name || 'N/A',
          kabupaten_name: item.kabupaten?.name || 'N/A',
          sub_service_name: item.sub_services?.name || 'N/A',
          region: item.region || 'N/A'
        }));

        setLicenseData(transformedData);
        setFilteredData(transformedData);
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceName]);

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = licenseData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.province_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kabupaten_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Region filter
    if (regionFilter !== "all") {
      filtered = filtered.filter(item => 
        item.province_name?.toLowerCase() === regionFilter.toLowerCase()
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, statusFilter, regionFilter, licenseData]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      active: { label: "Aktif", variant: "default" },
      inactive: { label: "Tidak Aktif", variant: "secondary" },
      pending: { label: "Pending", variant: "outline" },
      suspended: { label: "Suspended", variant: "destructive" }
    };

    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Memuat data layanan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceInfo) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Layanan Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Layanan yang Anda cari tidak tersedia.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <div className="h-8 w-px bg-border"></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {serviceInfo.name}
                </h1>
                <p className="text-sm text-muted-foreground">{serviceInfo.description}</p>
              </div>
            </div>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                Masuk untuk Akses Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lisensi</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
              <p className="text-xs text-muted-foreground">dari {licenseData.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(item => item.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">lisensi aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perusahaan</CardTitle>
              <Building2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {new Set(filteredData.map(item => item.company_name)).size}
              </div>
              <p className="text-xs text-muted-foreground">perusahaan unik</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provinsi</CardTitle>
              <MapPin className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>
                {new Set(filteredData.map(item => item.province_name)).size}
              </div>
              <p className="text-xs text-muted-foreground">provinsi terlayani</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter & Pencarian Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari perusahaan, lisensi, lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Provinsi</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.name.toLowerCase()}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Data Lisensi {serviceInfo.name}</CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredData.length} dari {licenseData.length} data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Tidak Ada Data</h3>
                <p className="text-muted-foreground mb-4">
                  Tidak ada data yang sesuai dengan kriteria pencarian Anda.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setRegionFilter("all");
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Perusahaan</TableHead>
                      <TableHead>Nomor Lisensi</TableHead>
                      <TableHead>Sub Layanan</TableHead>
                      <TableHead>Tanggal Lisensi</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead>Kabupaten/Kota</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.company_name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.license_number}</TableCell>
                        <TableCell>{item.sub_service_name}</TableCell>
                        <TableCell>
                          {item.license_date !== 'N/A' ? 
                            new Date(item.license_date).toLocaleDateString('id-ID') : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>{item.province_name}</TableCell>
                        <TableCell>{item.kabupaten_name}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Ingin Akses Data Lengkap?</h3>
            <p className="text-muted-foreground mb-6">
              Daftar atau masuk untuk mengakses fitur analisis advanced, export data, dan visualisasi interaktif.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/public-register">
                <Button variant="outline">Daftar Sekarang</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-primary-glow">
                  Masuk
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceDetail;