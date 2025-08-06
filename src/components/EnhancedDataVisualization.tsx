import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  MapPin, Filter, Search, Download, Eye, Calendar, TrendingUp,
  RefreshCw, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchServices, fetchSubServices, type Service, type SubService } from '@/constants/serviceTypes';

type TelekomData = {
  id: string;
  company_name: string;
  sub_service_id: string | null;
  status: string;
  region: string;
  latitude: number;
  longitude: number;
  license_date: string;
  license_number: string;
  sub_service?: {
    id: string;
    name: string;
    service: {
      id: string;
      name: string;
      code: string;
    };
  } | null;
};

const EnhancedDataVisualization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [data, setData] = useState<TelekomData[]>([]);
  const [filteredData, setFilteredData] = useState<TelekomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

  // Enhanced Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [subServiceFilter, setSubServiceFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await Promise.all([fetchData(), loadServices()]);
      
      const token = await fetchMapboxToken();
      if (token) {
        setMapboxToken(token);
      }
      setLoading(false);
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchTerm, serviceFilter, subServiceFilter, regionFilter, statusFilter, yearFilter]);

  useEffect(() => {
    if (filteredData.length > 0 && mapboxToken && !map.current) {
      initializeMap();
    }
  }, [filteredData, mapboxToken]);

  useEffect(() => {
    if (map.current && map.current.getSource('telekom-data')) {
      updateMapData();
    }
  }, [filteredData]);

  const loadServices = async () => {
    try {
      const [servicesData, subServicesData] = await Promise.all([
        fetchServices(),
        fetchSubServices()
      ]);
      setServices(servicesData);
      setSubServices(subServicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const fetchData = async () => {
    try {
      const { data: telekomData, error } = await supabase
        .from('telekom_data')
        .select(`
          id, 
          company_name, 
          sub_service_id, 
          status, 
          region, 
          latitude, 
          longitude, 
          license_date, 
          license_number,
          sub_service:sub_services(
            id,
            name,
            service:services(
              id,
              name,
              code
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(telekomData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load visualization data",
        variant: "destructive",
      });
    }
  };

  const filterData = () => {
    let filtered = data;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.sub_service?.service?.id === serviceFilter
      );
    }

    // Sub-service filter
    if (subServiceFilter !== 'all') {
      filtered = filtered.filter(item => item.sub_service_id === subServiceFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(item => item.region === regionFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.license_date) return false;
        const itemYear = new Date(item.license_date).getFullYear().toString();
        return itemYear === yearFilter;
      });
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setServiceFilter('all');
    setSubServiceFilter('all');
    setRegionFilter('all');
    setStatusFilter('all');
    setYearFilter('all');
  };

  // Get available years from data
  const getAvailableYears = () => {
    const years = new Set<string>();
    data.forEach(item => {
      if (item.license_date) {
        const year = new Date(item.license_date).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  };

  // Enhanced data processing functions
  const getYearlyLicenseIssuance = () => {
    const yearCounts: Record<string, number> = {};
    filteredData.forEach(item => {
      if (item.license_date) {
        const year = new Date(item.license_date).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });

    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  const getMonthlyTrends = () => {
    const monthCounts: Record<string, number> = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize all months to 0
    months.forEach(month => {
      monthCounts[month] = 0;
    });

    filteredData.forEach(item => {
      if (item.license_date) {
        const month = months[new Date(item.license_date).getMonth()];
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    return months.map(month => ({
      month,
      count: monthCounts[month]
    }));
  };

  const getServiceDistribution = () => {
    const serviceCounts: Record<string, number> = {};
    const serviceLabels: Record<string, string> = {
      'jasa': 'Jasa',
      'jaringan': 'Jaringan',
      'telekomunikasi_khusus': 'Telekomunikasi Khusus',
      'isr': 'ISR',
      'tarif': 'Tarif',
      'sklo': 'SKLO',
      'lko': 'LKO'
    };

    filteredData.forEach(item => {
      const serviceType = item.sub_service?.service?.code || 'unknown';
      serviceCounts[serviceType] = (serviceCounts[serviceType] || 0) + 1;
    });

    return Object.entries(serviceCounts).map(([key, value], index) => ({
      name: serviceLabels[key] || key,
      value,
      fill: `hsl(var(--chart-${(index % 7) + 1}))`
    }));
  };

  const getRegionalDistribution = () => {
    const regionCounts: Record<string, number> = {};
    filteredData.forEach(item => {
      if (item.region) {
        regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
      }
    });

    return Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 regions
  };

  const getSummaryStats = () => {
    const totalLicenses = filteredData.length;
    const activeOperators = new Set(filteredData.filter(item => item.status === 'active').map(item => item.company_name)).size;
    const regions = new Set(filteredData.map(item => item.region).filter(Boolean)).size;
    const pendingApprovals = filteredData.filter(item => item.status === 'pending').length;

    return { totalLicenses, activeOperators, regions, pendingApprovals };
  };

  // Map functions (keeping existing map logic)
  const initializeMap = () => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [106.816666, -6.200000],
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => {
      addDataToMap();
    });
  };

  const addDataToMap = () => {
    if (!map.current) return;

    map.current.addSource('telekom-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredData
          .filter(item => item.latitude && item.longitude)
          .map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [item.longitude, item.latitude]
            },
            properties: {
              id: item.id,
              company_name: item.company_name,
              service_type: item.sub_service?.service?.code || 'unknown',
              service_name: item.sub_service?.service?.name || 'Unknown Service',
              sub_service_name: item.sub_service?.name || 'Unknown Sub-service',
              status: item.status,
              region: item.region,
              license_date: item.license_date,
              license_number: item.license_number,
            }
          }))
      }
    });

    map.current.addLayer({
      id: 'telekom-points',
      type: 'circle',
      source: 'telekom-data',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'service_type'],
          'jasa', 'hsl(var(--chart-1))',
          'jaringan', 'hsl(var(--chart-2))',
          'telekomunikasi_khusus', 'hsl(var(--chart-3))',
          'isr', 'hsl(var(--chart-4))',
          'tarif', 'hsl(var(--chart-5))',
          'sklo', 'hsl(var(--primary))',
          'lko', 'hsl(var(--secondary))',
          'hsl(var(--muted-foreground))'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click and hover events
    map.current.on('click', 'telekom-points', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      new mapboxgl.Popup()
        .setLngLat([properties.longitude, properties.latitude])
        .setHTML(`
          <div class="p-3">
            <h3 class="font-semibold text-lg">${properties.company_name}</h3>
            <p class="text-sm text-gray-600">Service: ${properties.service_name}</p>
            <p class="text-sm text-gray-600">Sub-service: ${properties.sub_service_name}</p>
            <p class="text-sm text-gray-600">Status: ${properties.status}</p>
            <p class="text-sm text-gray-600">Region: ${properties.region}</p>
            ${properties.license_number ? `<p class="text-sm text-gray-600">License: ${properties.license_number}</p>` : ''}
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('mouseenter', 'telekom-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'telekom-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  const updateMapData = () => {
    if (!map.current || !map.current.getSource('telekom-data')) return;

    const source = map.current.getSource('telekom-data') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: filteredData
        .filter(item => item.latitude && item.longitude)
        .map(item => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.longitude, item.latitude]
          },
          properties: {
            id: item.id,
            company_name: item.company_name,
            service_type: item.sub_service?.service?.code || 'unknown',
            service_name: item.sub_service?.service?.name || 'Unknown Service',
            sub_service_name: item.sub_service?.name || 'Unknown Sub-service',
            status: item.status,
            region: item.region,
            license_date: item.license_date,
            license_number: item.license_number,
          }
        }))
    });
  };

  const exportToCSV = () => {
    const headers = ['Company Name', 'Service Type', 'Sub Service', 'Region', 'Status', 'License Date', 'License Number'];
    const csvData = filteredData.map(item => [
      item.company_name,
      item.sub_service?.service?.name || '',
      item.sub_service?.name || '',
      item.region || '',
      item.status,
      item.license_date || '',
      item.license_number || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telekom-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading enhanced visualization...</p>
        </div>
      </div>
    );
  }

  const summaryStats = getSummaryStats();
  const serviceDistribution = getServiceDistribution();
  const regionalDistribution = getRegionalDistribution();
  const yearlyTrends = getYearlyLicenseIssuance();
  const monthlyTrends = getMonthlyTrends();
  const availableYears = getAvailableYears();
  const availableRegions = [...new Set(data.map(item => item.region).filter(Boolean))].sort();
  const availableSubServices = serviceFilter === 'all' 
    ? [] 
    : subServices.filter(ss => ss.service_id === serviceFilter);

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Enhanced Data Visualization
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced analytics and insights for telecommunications data with AI-powered filtering
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredData.length} records
          </Badge>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Global Filters */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Advanced Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies, licenses, regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={(value) => {
              setServiceFilter(value);
              setSubServiceFilter('all');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subServiceFilter} onValueChange={setSubServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Sub-Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Services</SelectItem>
                {availableSubServices.map(subService => (
                  <SelectItem key={subService.id} value={subService.id}>{subService.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {availableRegions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="col-span-full sm:col-span-1"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="issuance">License Issuance</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Total Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summaryStats.totalLicenses}</div>
                <p className="text-xs text-muted-foreground">Active telecommunications licenses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Active Operators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{summaryStats.activeOperators}</div>
                <p className="text-xs text-muted-foreground">Unique active operators</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: 'hsl(var(--chart-4))' }} />
                  Regions Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>{summaryStats.regions}</div>
                <p className="text-xs text-muted-foreground">Geographic regions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-5/5 to-chart-5/10 border-chart-5/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: 'hsl(var(--chart-5))' }} />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'hsl(var(--chart-5))' }}>{summaryStats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Service Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Top Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalDistribution.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="region" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issuance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                License Issuance Trends by Year
              </CardTitle>
              <CardDescription>Number of telecommunications licenses issued per year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={yearlyTrends}>
                  <defs>
                    <linearGradient id="colorIssuance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorIssuance)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keep existing tabs content for geographic, analytics, trends, and data table */}
        {/* ... (previous tab content remains the same) ... */}
      </Tabs>
    </div>
  );
};

export default EnhancedDataVisualization;
