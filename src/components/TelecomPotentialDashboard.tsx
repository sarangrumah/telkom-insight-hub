import { useState, useEffect, useRef, useMemo } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  RefreshCw, Loader2, Signal, MapPin, Search, ArrowUpDown, Settings, BarChart3, Map, List,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// =============================================================================
// Types
// =============================================================================
interface Score {
  area_id: string;
  area_name: string;
  area_code: string;
  latitude: number;
  longitude: number;
  market_activity_score: number;
  untapped_opportunity_score: number;
  bps_demand_score: number;
  total_score: number;
  license_count: number;
  company_count: number;
  service_count: number;
  service_breakdown: Record<string, { count: number; companies: number; active: number }>;
  rank: number;
  tier: string;
}

interface Config {
  service_weights: Record<string, number>;
  market_activity_weight: number;
  untapped_opportunity_weight: number;
  bps_demand_weight: number;
  include_bps_data: boolean;
  area_level: string;
}

interface AreaStat {
  service_type: string;
  total_licenses: number;
  total_companies: number;
  area_name?: string;
  license_count?: number;
}

// =============================================================================
// Constants
// =============================================================================
const TIER_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800',
};

const TIER_HEX: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#ef4444',
};

const SERVICE_TYPES: Record<string, string> = {
  Jasa: 'Jasa',
  Jaringan: 'Jaringan',
  Telsus: 'Telsus',
  ISR: 'ISR',
  SKLO: 'SKLO',
  LKO: 'LKO',
  Penomoran: 'Penomoran',
  Tarif: 'Tarif',
};

const SERVICE_KEYS = Object.keys(SERVICE_TYPES);

const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ef4444', '#06b6d4', '#f97316'];

// =============================================================================
// Sub-components
// =============================================================================
function TierBadge({ tier }: { tier: string }) {
  return (
    <Badge className={`${TIER_COLORS[tier] || 'bg-gray-100 text-gray-800'} font-bold`}>
      Tier {tier}
    </Badge>
  );
}

// =============================================================================
// Main Component
// =============================================================================
export default function TelecomPotentialDashboard() {
  const { toast } = useToast();

  // --- State ---
  const [activeTab, setActiveTab] = useState('map');
  const [scores, setScores] = useState<Score[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Map state
  const [areaLevel, setAreaLevel] = useState<'province' | 'kabupaten'>('province');
  const [activeServiceFilter, setActiveServiceFilter] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // Rankings state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Score>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);

  // Config form state
  const [configForm, setConfigForm] = useState<Config>({
    service_weights: { jasa: 0.2, jaringan: 0.25, telekomunikasi_khusus: 0.15, isr: 0.15, sklo: 0.1, lko: 0.1, tarif: 0.05 },
    market_activity_weight: 0.4,
    untapped_opportunity_weight: 0.4,
    bps_demand_weight: 0.2,
    include_bps_data: true,
    area_level: 'province',
  });

  // =========================================================================
  // Data fetching
  // =========================================================================
  const fetchScores = async (level?: string) => {
    try {
      setLoading(true);
      const lvl = level || areaLevel;
      const res = await apiFetch(`/v2/panel/api/telecom-potential/v2/scores?area_level=${lvl}`);
      setScores(res.data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load scores', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await apiFetch('/v2/panel/api/telecom-potential/v2/config');
      const cfg = res.data as Config;
      setConfig(cfg);
      setConfigForm(cfg);
      if (cfg.area_level) {
        setAreaLevel(cfg.area_level as 'province' | 'kabupaten');
      }
    } catch {
      // use defaults
    }
  };

  const fetchAreaStats = async () => {
    try {
      const res = await apiFetch(`/v2/panel/api/telecom-potential/v2/area-stats?area_level=${areaLevel}`);
      setAreaStats(res.data || []);
    } catch {
      // ignore
    }
  };

  const computeScores = async () => {
    try {
      setComputing(true);
      await apiFetch('/v2/panel/api/telecom-potential/v2/compute', { method: 'POST' });
      toast({ title: 'Success', description: 'Scores computed successfully' });
      await fetchScores();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to compute scores', variant: 'destructive' });
    } finally {
      setComputing(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSavingConfig(true);
      const res = await apiFetch('/v2/panel/api/telecom-potential/v2/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      setConfig(res.data);
      toast({ title: 'Success', description: 'Configuration saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save config', variant: 'destructive' });
    } finally {
      setSavingConfig(false);
    }
  };

  // =========================================================================
  // Map logic
  // =========================================================================
  const fetchMapData = async (level?: string, svcFilter?: string | null) => {
    const lvl = level || areaLevel;
    const svc = (svcFilter !== undefined ? svcFilter : activeServiceFilter)
      ? `&service_type=${svcFilter !== undefined ? svcFilter : activeServiceFilter}` : '';
    try {
      const res = await apiFetch(`/v2/panel/api/telecom-potential/v2/map-data?area_level=${lvl}${svc}`);
      return res.data as GeoJSON.FeatureCollection;
    } catch {
      return null;
    }
  };

  const initializeMap = async () => {
    if (!mapContainerRef.current) return;
    if (map.current) return; // already initialized

    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (!token || token === 'pk.your_mapbox_public_token_here') {
      setMapError('Mapbox token not configured. Set VITE_MAPBOX_PUBLIC_TOKEN in your .env file with a valid Mapbox public token.');
      setMapLoading(false);
      return;
    }

    setMapLoading(true);
    setMapError(null);
    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [118, -2.5],
        zoom: 4.5,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', async () => {
        setMapLoading(false);
        setMapError(null); // Clear any transient errors once map loads
        await loadMapLayer();
      });

      map.current.on('error', (e) => {
        // Only treat auth/style errors as fatal, not tile loading errors
        const msg = e?.error?.message || '';
        if (msg.includes('401') || msg.includes('403') || msg.includes('access token')) {
          console.error('Map auth error:', e);
          setMapError('Invalid Mapbox token. Check your VITE_MAPBOX_PUBLIC_TOKEN in .env');
          setMapLoading(false);
        } else {
          // Non-fatal (tile errors, etc) — just log
          console.warn('Map warning:', msg || e);
        }
      });
    } catch (err: any) {
      setMapError(err.message || 'Failed to initialize map');
      setMapLoading(false);
    }
  };

  const loadMapLayer = async () => {
    if (!map.current) return;

    const geojson = await fetchMapData();
    if (!geojson) return;

    // Remove existing layer/source
    if (map.current.getLayer('telecom-circles')) {
      map.current.removeLayer('telecom-circles');
    }
    if (map.current.getSource('telecom-potential-data')) {
      map.current.removeSource('telecom-potential-data');
    }

    map.current.addSource('telecom-potential-data', {
      type: 'geojson',
      data: geojson,
    });

    map.current.addLayer({
      id: 'telecom-circles',
      type: 'circle',
      source: 'telecom-potential-data',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'license_count'],
          0, 6,
          50, 15,
          200, 25,
          500, 35,
        ],
        'circle-color': [
          'match', ['get', 'tier'],
          'A', TIER_HEX.A,
          'B', TIER_HEX.B,
          'C', TIER_HEX.C,
          'D', TIER_HEX.D,
          '#9ca3af',
        ],
        'circle-opacity': 0.75,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Click handler
    map.current.on('click', 'telecom-circles', (e) => {
      if (!e.features || e.features.length === 0) return;
      const props = e.features[0].properties as any;
      const coords = (e.features[0].geometry as any).coordinates.slice() as [number, number];

      // Parse service_breakdown if stringified
      let breakdown: Record<string, { count: number; companies: number; active: number }> = {};
      try {
        breakdown = typeof props.service_breakdown === 'string'
          ? JSON.parse(props.service_breakdown)
          : props.service_breakdown || {};
      } catch { /* ignore */ }

      const topServices = Object.entries(breakdown)
        .sort(([, a], [, b]) => (b as any).count - (a as any).count)
        .slice(0, 3);

      const topServicesHtml = topServices.length > 0
        ? topServices.map(([key, val]) =>
            `<div class="flex justify-between text-xs"><span>${SERVICE_TYPES[key] || key}</span><span class="font-medium">${(val as any).count}</span></div>`
          ).join('')
        : '<div class="text-xs text-gray-400">No service data</div>';

      const tierColor = TIER_HEX[props.tier] || '#9ca3af';

      if (popupRef.current) popupRef.current.remove();

      popupRef.current = new mapboxgl.Popup({ closeButton: true, maxWidth: '280px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">${props.area_name || 'Unknown'}</div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: white; background: ${tierColor}; margin-bottom: 8px;">
              Tier ${props.tier}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; margin-bottom: 8px;">
              <div><span style="color: #6b7280;">Score:</span> <strong>${Number(props.total_score || 0).toFixed(1)}</strong></div>
              <div><span style="color: #6b7280;">Licenses:</span> <strong>${props.license_count || 0}</strong></div>
              <div><span style="color: #6b7280;">Companies:</span> <strong>${props.company_count || 0}</strong></div>
              <div><span style="color: #6b7280;">Services:</span> <strong>${props.service_count || 0}</strong></div>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">Top Services</div>
            ${topServicesHtml}
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('mouseenter', 'telecom-circles', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'telecom-circles', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  // =========================================================================
  // Effects
  // =========================================================================

  // Initial data load
  useEffect(() => {
    fetchScores();
    fetchConfig();
  }, []);

  // Re-fetch scores when area level changes
  useEffect(() => {
    fetchScores(areaLevel);
  }, [areaLevel]);

  // Map initialization: container is always mounted (forceMount), init once
  useEffect(() => {
    if (activeTab !== 'map') return;

    if (!map.current) {
      const timer = setTimeout(() => initializeMap(), 200);
      return () => clearTimeout(timer);
    }

    // Returning to map tab — resize to fit (container was hidden via CSS)
    const timer = setTimeout(() => {
      map.current?.resize();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Reload map data when area level or service filter changes
  useEffect(() => {
    if (activeTab !== 'map') return;
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Update the GeoJSON data source or re-create layer
    const updateMap = async () => {
      const geojson = await fetchMapData();
      if (!geojson || !map.current) return;

      const source = map.current.getSource('telecom-potential-data') as mapboxgl.GeoJSONSource;
      if (source) {
        // Just update the data — faster than removing/re-adding layer
        source.setData(geojson);
      } else {
        // Source doesn't exist yet, do full layer setup
        await loadMapLayer();
      }
    };
    updateMap();
  }, [areaLevel, activeServiceFilter]);

  // Fetch area stats when service tab is active
  useEffect(() => {
    if (activeTab === 'services') {
      fetchAreaStats();
    }
  }, [activeTab, areaLevel]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current) popupRef.current.remove();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // =========================================================================
  // Rankings: derived data
  // =========================================================================
  const filteredScores = useMemo(() => {
    let result = [...scores];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => s.area_name.toLowerCase().includes(lower));
    }
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [scores, searchTerm, sortField, sortDir]);

  const handleSort = (field: keyof Score) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // =========================================================================
  // Service breakdown: derived data
  // =========================================================================
  const serviceSummary = useMemo(() => {
    const totals: Record<string, number> = {};
    scores.forEach(s => {
      if (!s.service_breakdown) return;
      Object.entries(s.service_breakdown).forEach(([key, val]) => {
        totals[key] = (totals[key] || 0) + val.count;
      });
    });
    return Object.entries(totals).map(([key, value]) => ({
      name: SERVICE_TYPES[key] || key,
      key,
      value,
    }));
  }, [scores]);

  const top10ByLicenses = useMemo(() => {
    return [...scores]
      .sort((a, b) => b.license_count - a.license_count)
      .slice(0, 10)
      .map(s => ({ name: s.area_name, license_count: s.license_count }));
  }, [scores]);

  const pieData = useMemo(() => {
    return serviceSummary.map((s, i) => ({
      ...s,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [serviceSummary]);

  // Detail dialog data
  const selectedRadarData = useMemo(() => {
    if (!selectedScore) return [];
    return [
      { subject: 'Market Activity', value: selectedScore.market_activity_score },
      { subject: 'Untapped Opportunity', value: selectedScore.untapped_opportunity_score },
      { subject: 'BPS Demand', value: selectedScore.bps_demand_score },
    ];
  }, [selectedScore]);

  const selectedServiceData = useMemo(() => {
    if (!selectedScore?.service_breakdown) return [];
    return Object.entries(selectedScore.service_breakdown).map(([key, val]) => ({
      name: SERVICE_TYPES[key] || key,
      count: val.count,
      companies: val.companies,
      active: val.active,
    }));
  }, [selectedScore]);

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Signal className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Telecom Potential Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Scoring and analysis of telecom market potential across Indonesia
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={computeScores}
            disabled={computing}
            variant="default"
          >
            {computing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Compute Scores
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Map Overview</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Rankings</span>
            <span className="sm:hidden">Rank</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Service Breakdown</span>
            <span className="sm:hidden">Services</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* Tab 1: Map Overview */}
        {/* ================================================================= */}
        <TabsContent value="map" forceMount className={`space-y-4 ${activeTab !== 'map' ? 'hidden' : ''}`}>
          {/* Controls */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              {/* Area level toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Area Level:</span>
                <Button
                  variant={areaLevel === 'province' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAreaLevel('province')}
                >
                  Province
                </Button>
                <Button
                  variant={areaLevel === 'kabupaten' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAreaLevel('kabupaten')}
                >
                  Kabupaten
                </Button>
              </div>

              {/* Service type filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Service:</span>
                <Button
                  variant={activeServiceFilter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveServiceFilter(null)}
                >
                  All
                </Button>
                {SERVICE_KEYS.map(key => (
                  <Button
                    key={key}
                    variant={activeServiceFilter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveServiceFilter(key)}
                  >
                    {SERVICE_TYPES[key]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardContent className="p-0 relative">
              {mapLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {mapError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                  <div className="text-center p-6 max-w-md">
                    <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">{mapError}</p>
                  </div>
                </div>
              )}
              <div ref={mapContainerRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-muted-foreground">Tier Legend:</span>
            {Object.entries(TIER_HEX).map(([tier, color]) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span>Tier {tier}</span>
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-4">Circle size = license count</span>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* Tab 2: Rankings */}
        {/* ================================================================= */}
        <TabsContent value="rankings" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search area name..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground">{filteredScores.length} areas</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {([
                          ['rank', 'Rank'],
                          ['area_name', 'Area'],
                          ['tier', 'Tier'],
                          ['total_score', 'Total Score'],
                          ['market_activity_score', 'Market Activity'],
                          ['untapped_opportunity_score', 'Untapped Opp.'],
                          ['license_count', 'Licenses'],
                          ['company_count', 'Companies'],
                          ['service_count', 'Services'],
                        ] as [keyof Score, string][]).map(([field, label]) => (
                          <TableHead
                            key={field}
                            className="cursor-pointer select-none whitespace-nowrap"
                            onClick={() => handleSort(field)}
                          >
                            <div className="flex items-center gap-1">
                              {label}
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScores.map(score => (
                        <TableRow key={score.area_id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{score.rank}</TableCell>
                          <TableCell className="font-medium">{score.area_name}</TableCell>
                          <TableCell><TierBadge tier={score.tier} /></TableCell>
                          <TableCell className="font-semibold">{score.total_score.toFixed(1)}</TableCell>
                          <TableCell>{score.market_activity_score.toFixed(1)}</TableCell>
                          <TableCell>{score.untapped_opportunity_score.toFixed(1)}</TableCell>
                          <TableCell>{score.license_count}</TableCell>
                          <TableCell>{score.company_count}</TableCell>
                          <TableCell>{score.service_count}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedScore(score)}>
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredScores.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            {scores.length === 0 ? 'No scores computed yet. Click "Compute Scores" to generate.' : 'No matching areas found.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detail Dialog */}
          <Dialog open={!!selectedScore} onOpenChange={open => { if (!open) setSelectedScore(null); }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {selectedScore && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {selectedScore.area_name}
                      <TierBadge tier={selectedScore.tier} />
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">{selectedScore.total_score.toFixed(1)}</div>
                      <div className="text-muted-foreground">Total Score</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">{selectedScore.license_count}</div>
                      <div className="text-muted-foreground">Licenses</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">{selectedScore.company_count}</div>
                      <div className="text-muted-foreground">Companies</div>
                    </div>
                  </div>

                  {/* Radar chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Score Perspectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={selectedRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Per-service bar chart */}
                  {selectedServiceData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Service Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={selectedServiceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Licenses" fill="#3b82f6" />
                            <Bar dataKey="companies" name="Companies" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ================================================================= */}
        {/* Tab 3: Service Breakdown */}
        {/* ================================================================= */}
        <TabsContent value="services" className="space-y-4">
          {/* National summary bar chart */}
          <Card>
            <CardHeader>
              <CardTitle>Total Licenses by Service Type</CardTitle>
              <CardDescription>National summary across all areas</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Licenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No service data available. Compute scores first.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 10 areas horizontal bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Areas by License Count</CardTitle>
              </CardHeader>
              <CardContent>
                {top10ByLicenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={top10ByLicenses} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="license_count" name="Licenses" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card>
              <CardHeader>
                <CardTitle>Service Type Proportions</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* Tab 4: Configuration */}
        {/* ================================================================= */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Perspective weights */}
            <Card>
              <CardHeader>
                <CardTitle>Perspective Weights</CardTitle>
                <CardDescription>
                  Controls how each scoring perspective contributes to the total. Values are normalized automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="market_activity_weight">Market Activity Weight</Label>
                  <Input
                    id="market_activity_weight"
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={configForm.market_activity_weight}
                    onChange={e => setConfigForm(prev => ({ ...prev, market_activity_weight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="untapped_opportunity_weight">Untapped Opportunity Weight</Label>
                  <Input
                    id="untapped_opportunity_weight"
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={configForm.untapped_opportunity_weight}
                    onChange={e => setConfigForm(prev => ({ ...prev, untapped_opportunity_weight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bps_demand_weight">BPS Demand Weight</Label>
                  <Input
                    id="bps_demand_weight"
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={configForm.bps_demand_weight}
                    onChange={e => setConfigForm(prev => ({ ...prev, bps_demand_weight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service type weights */}
            <Card>
              <CardHeader>
                <CardTitle>Service Type Weights</CardTitle>
                <CardDescription>
                  Weight for each service type in the market activity score calculation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SERVICE_KEYS.map(key => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`sw-${key}`}>{SERVICE_TYPES[key]}</Label>
                    <Input
                      id={`sw-${key}`}
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={configForm.service_weights[key] ?? 0}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setConfigForm(prev => ({
                          ...prev,
                          service_weights: { ...prev.service_weights, [key]: val },
                        }));
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* BPS toggle + area level */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="include_bps"
                  checked={configForm.include_bps_data}
                  onCheckedChange={(checked: boolean) =>
                    setConfigForm(prev => ({ ...prev, include_bps_data: !!checked }))
                  }
                />
                <Label htmlFor="include_bps" className="cursor-pointer">
                  Include BPS data in scoring
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Area Level</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="area_level"
                      value="province"
                      checked={configForm.area_level === 'province'}
                      onChange={() => setConfigForm(prev => ({ ...prev, area_level: 'province' }))}
                      className="accent-primary"
                    />
                    <span className="text-sm">Province</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="area_level"
                      value="kabupaten"
                      checked={configForm.area_level === 'kabupaten'}
                      onChange={() => setConfigForm(prev => ({ ...prev, area_level: 'kabupaten' }))}
                      className="accent-primary"
                    />
                    <span className="text-sm">Kabupaten</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Configuration
            </Button>
            <Button variant="outline" onClick={computeScores} disabled={computing}>
              {computing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Compute Scores
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
