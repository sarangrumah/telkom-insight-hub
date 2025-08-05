import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { MapPin, Filter, Search, Download, Eye, Calendar } from 'lucide-react';
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

const DataVisualization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [data, setData] = useState<TelekomData[]>([]);
  const [filteredData, setFilteredData] = useState<TelekomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

  // Global Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [subServiceFilter, setSubServiceFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

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
  }, [data, searchTerm, serviceFilter, subServiceFilter, regionFilter, statusFilter, dateRangeFilter]);

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

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateRangeFilter) {
        case 'last_year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'last_6_months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'last_3_months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => {
        if (!item.license_date) return false;
        return new Date(item.license_date) >= cutoffDate;
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
    setDateRangeFilter('all');
  };

  const handleServiceChange = (value: string) => {
    setServiceFilter(value);
    setSubServiceFilter('all');
  };

  // Initialize Map
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
          'jasa', '#ef4444',
          'jaringan', '#3b82f6',
          'telekomunikasi_khusus', '#10b981',
          'isr', '#f59e0b',
          'tarif', '#8b5cf6',
          'sklo', '#ec4899',
          'lko', '#06b6d4',
          '#6b7280'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.current.on('click', 'telekom-points', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      new mapboxgl.Popup()
        .setLngLat([properties.longitude, properties.latitude])
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${properties.company_name}</h3>
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

  // Data processing functions
  const getUniqueRegions = () => {
    const regions = [...new Set(data.map(item => item.region).filter(Boolean))];
    return regions.sort();
  };

  const availableSubServices = serviceFilter === 'all' 
    ? [] 
    : subServices.filter(ss => ss.service_id === serviceFilter);

  const getSummaryStats = () => {
    const totalLicenses = filteredData.length;
    const activeOperators = new Set(filteredData.filter(item => item.status === 'active').map(item => item.company_name)).size;
    const regions = new Set(filteredData.map(item => item.region).filter(Boolean)).size;
    const pendingApprovals = filteredData.filter(item => item.status === 'pending').length;

    return { totalLicenses, activeOperators, regions, pendingApprovals };
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
      .slice(0, 10);
  };

  const getYearlyTrends = () => {
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
          <p className="text-muted-foreground">Loading visualization data...</p>
        </div>
      </div>
    );
  }

  const summaryStats = getSummaryStats();
  const serviceDistribution = getServiceDistribution();
  const regionalDistribution = getRegionalDistribution();
  const yearlyTrends = getYearlyTrends();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Visualization</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights for telecommunications data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredData.length} records
          </Badge>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies, licenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={serviceFilter} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={subServiceFilter} 
              onValueChange={setSubServiceFilter}
              disabled={serviceFilter === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sub Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Services</SelectItem>
                {availableSubServices.map((subService) => (
                  <SelectItem key={subService.id} value={subService.id}>
                    {subService.name.length > 40 ? `${subService.name.substring(0, 40)}...` : subService.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {getUniqueRegions().map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="data-table">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                  <Badge variant="secondary">{summaryStats.totalLicenses}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.totalLicenses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active telecommunication licenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
                  <Badge variant="secondary">{summaryStats.activeOperators}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.activeOperators}</div>
                  <p className="text-xs text-muted-foreground">Unique companies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regions Covered</CardTitle>
                  <Badge variant="secondary">{summaryStats.regions}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.regions}</div>
                  <p className="text-xs text-muted-foreground">Geographic coverage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Badge variant="destructive">{summaryStats.pendingApprovals}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Type Distribution</CardTitle>
                  <CardDescription>License distribution by service category</CardDescription>
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
                  <CardTitle>Top Regions</CardTitle>
                  <CardDescription>Regional distribution of licenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionalDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Interactive map showing telecommunications license locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mapboxToken ? (
                <div className="flex items-center justify-center h-96 border rounded-lg">
                  <div className="text-center space-y-4">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Mapbox token required for map visualization</p>
                  </div>
                </div>
              ) : (
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <div ref={mapContainer} className="absolute inset-0" />
                  
                  {/* Map Legend */}
                  <Card className="absolute top-4 left-4 p-3 space-y-2 z-10">
                    <h3 className="text-sm font-semibold">Service Types</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs">Jasa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs">Jaringan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">Telekomunikasi Khusus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs">ISR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs">Tarif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span className="text-xs">SKLO</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-xs">LKO</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Detailed breakdown by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Analysis</CardTitle>
                  <CardDescription>License count by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={regionalDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="region" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  License Issuance Trends
                </CardTitle>
                <CardDescription>
                  Historical data showing license issuance by year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={yearlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Licenses Issued"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data-table">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Data Table</CardTitle>
              <CardDescription>
                Complete list of filtered telecommunications data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Sub Service</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>License Date</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.company_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.sub_service?.service?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.sub_service?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{item.region || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.status === 'active' ? 'default' : 
                              item.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.license_date ? 
                            new Date(item.license_date).toLocaleDateString('id-ID') : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.license_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredData.length > 50 && (
                <div className="mt-4 text-center text-muted-foreground">
                  Showing first 50 results. Use filters to narrow down results or export all data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;