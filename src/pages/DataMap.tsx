import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_TYPE_HIERARCHY, getSubServices } from '@/constants/serviceTypes';

type TelekomData = {
  id: string;
  company_name: string;
  service_type: string;
  sub_service_type: string | null;
  status: string;
  region: string;
  latitude: number;
  longitude: number;
  license_date: string;
  license_number: string;
};

const DataMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [data, setData] = useState<TelekomData[]>([]);
  const [filteredData, setFilteredData] = useState<TelekomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [subServiceFilter, setSubServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

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
      await fetchData();
      
      // Try to get token from Supabase first
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
  }, [data, serviceTypeFilter, subServiceFilter, statusFilter]);

  useEffect(() => {
    if (data.length > 0 && mapboxToken && !map.current) {
      initializeMap();
    }
  }, [data, mapboxToken]);

  useEffect(() => {
    if (map.current && map.current.getSource('telekom-data')) {
      updateMapData();
    }
  }, [filteredData]);

  const fetchData = async () => {
    try {
      const { data: telekomData, error } = await supabase
        .from('telekom_data')
        .select('id, company_name, service_type, sub_service_type, status, region, latitude, longitude, license_date, license_number')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      setData(telekomData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive",
      });
    }
  };

  const filterData = () => {
    let filtered = data;
    
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.service_type === serviceTypeFilter);
    }
    
    if (subServiceFilter !== 'all') {
      filtered = filtered.filter(item => item.sub_service_type === subServiceFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredData(filtered);
  };

  const updateMapData = () => {
    if (!map.current || !map.current.getSource('telekom-data')) return;

    const source = map.current.getSource('telekom-data') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: filteredData.map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude]
        },
        properties: {
          id: item.id,
          company_name: item.company_name,
          service_type: item.service_type,
          sub_service_type: item.sub_service_type,
          status: item.status,
          region: item.region,
          license_date: item.license_date,
          license_number: item.license_number,
        }
      }))
    });
  };

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [106.816666, -6.200000], // Indonesia center
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addDataToMap();
    });
  };

  const addDataToMap = () => {
    if (!map.current) return;

    // Add data source
    map.current.addSource('telekom-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredData.map(item => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.longitude, item.latitude]
          },
          properties: {
            id: item.id,
            company_name: item.company_name,
            service_type: item.service_type,
            sub_service_type: item.sub_service_type,
            status: item.status,
            region: item.region,
            license_date: item.license_date,
            license_number: item.license_number,
          }
        }))
      }
    });

    // Add layer
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

    // Add click event
    map.current.on('click', 'telekom-points', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      new mapboxgl.Popup()
        .setLngLat([properties.longitude, properties.latitude])
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${properties.company_name}</h3>
            <p class="text-sm text-gray-600">Service: ${properties.service_type}</p>
            ${properties.sub_service_type ? `<p class="text-sm text-gray-600">Sub-service: ${properties.sub_service_type}</p>` : ''}
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

  const clearFilters = () => {
    setServiceTypeFilter('all');
    setSubServiceFilter('all');
    setStatusFilter('all');
  };

  const availableSubServices = serviceTypeFilter === 'all' 
    ? [] 
    : getSubServices(serviceTypeFilter);

  const handleServiceTypeChange = (value: string) => {
    setServiceTypeFilter(value);
    setSubServiceFilter('all'); // Reset sub-service filter when main service changes
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading telecommunications data and map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Mapbox Token Required</h2>
            <p className="text-sm text-muted-foreground">
              Unable to load Mapbox token automatically. Please enter your Mapbox public token to view the data map.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter Mapbox public token..."
                className="w-full px-3 py-2 border rounded-md"
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your token from{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Data Map</h1>
            <p className="text-muted-foreground">Geographic visualization of telecommunications data</p>
          </div>
          <Badge variant="secondary">
            {filteredData.length} locations
          </Badge>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={serviceTypeFilter} onValueChange={handleServiceTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Main Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Main Services</SelectItem>
              {Object.keys(SERVICE_TYPE_HIERARCHY).map((serviceType) => (
                <SelectItem key={serviceType} value={serviceType}>
                  {serviceType === 'jasa' ? 'JASA' : 
                   serviceType === 'jaringan' ? 'JARINGAN' : 
                   'TELEKOMUNIKASI KHUSUS'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={subServiceFilter} 
            onValueChange={setSubServiceFilter}
            disabled={serviceTypeFilter === 'all'}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sub Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub Services</SelectItem>
              {availableSubServices.map((subService) => (
                <SelectItem key={subService} value={subService}>
                  {subService.length > 50 ? `${subService.substring(0, 50)}...` : subService}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Legend */}
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
    </div>
  );
};

export default DataMap;