import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  RefreshCw,
  MapPin,
  BarChart3,
  Calendar,
  Settings,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Search,
  Plus,
  X,
} from 'lucide-react';

interface BPSArea {
  id: number;
  area_code: string;
  area_name: string;
  area_type: 'province' | 'district';
  parent_area_code?: string;
  is_active: boolean;
  priority_level: number;
}

interface BPSVariable {
  id: number;
  variable_id: string;
  variable_name: string;
  variable_name_en?: string;
  unit?: string;
  category?: string;
  description?: string;
  is_active: boolean;
}

interface BPSDataPoint {
  year: string;
  [areaName: string]: string | number;
}

interface BPSDataResponse {
  success: boolean;
  data: BPSDataPoint[];
  count: number;
  meta?: {
    filters: any;
    queryTime: string;
  };
  format: string;
}

interface SyncHistory {
  id: number;
  sync_type: string;
  sync_status: string;
  started_at: string;
  completed_at?: string;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  error_message?: string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export default function BPSDataVisualization() {
  const [areas, setAreas] = useState<BPSArea[]>([]);
  const [variables, setVariables] = useState<BPSVariable[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [data, setData] = useState<BPSDataPoint[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAreas, setIsSyncingAreas] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [detailLevel, setDetailLevel] = useState<'province' | 'kabupaten'>('province');
  const [showVarSearch, setShowVarSearch] = useState(false);
  const [varSearchKeyword, setVarSearchKeyword] = useState('');
  const [varSearchResults, setVarSearchResults] = useState<{ var_id: string; title: string; unit: string; subject: string }[]>([]);
  const [isSearchingVars, setIsSearchingVars] = useState(false);
  const [availableYears, setAvailableYears] = useState<{ value: string; label: string }[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<{ value: string; label: string }[]>([]);
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [periodType, setPeriodType] = useState<string>('annual');
  const { toast } = useToast();

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load areas
      const areasResponse = await apiFetch('/v2/panel/api/bps/areas?active=true');
      if (areasResponse.success) {
        setAreas(areasResponse.data);
      }

      // Load variables
      const variablesResponse = await apiFetch('/v2/panel/api/bps/variables?active=true');
      if (variablesResponse.success) {
        setVariables(variablesResponse.data);
      }

      // Load sync history
      const historyResponse = await apiFetch('/v2/panel/api/bps/sync/history?limit=5');
      if (historyResponse.success) {
        setSyncHistory(historyResponse.data);
      }

      // Set default selections
      const provinces = areasResponse.data?.filter((a: BPSArea) => a.area_type === 'province') || [];
      if (provinces.length > 0) {
        setSelectedAreas([provinces[0].area_code]);
      }
      
      if (variablesResponse.data?.length > 0) {
        setSelectedVariable(variablesResponse.data[0].variable_id);
      }
      
      // Years will be set by loadPeriods after variable is selected

    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load BPS configuration data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    if (!selectedAreas.length || !selectedVariable || !selectedYears.length) {
      return;
    }

    try {
      setIsRefreshing(true);

      const params = new URLSearchParams({
        areas: selectedAreas.join(','),
        variables: selectedVariable,
        years: selectedYears.join(','),
        format: 'pivot',
        ...(detailLevel === 'kabupaten' ? { detail: 'kabupaten' } : {}),
        ...(selectedPeriod ? { period: selectedPeriod } : {}),
      });

      const response = await apiFetch(`/v2/panel/api/bps/data?${params.toString()}`) as BPSDataResponse;

      if (response.success) {
        setData(response.data);
        if (response.data.length === 0) {
          toast({
            title: 'No Data',
            description: 'This variable has no data for the selected province/years. Try a different variable or province.',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load chart data',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to load chart data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chart data',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedAreas, selectedVariable, selectedYears, detailLevel, selectedPeriod, toast]);

  // Trigger synchronization
  const triggerSync = useCallback(async () => {
    if (!selectedAreas.length || !selectedVariable || !selectedYears.length) {
      toast({
        title: 'Invalid Configuration',
        description: 'Please select areas, variable, and years before syncing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSyncing(true);

      const syncData = {
        areas: selectedAreas,
        variables: [selectedVariable],
        years: selectedYears.map(y => parseInt(y)),
        syncType: 'manual'
      };

      const response = await apiFetch('/v2/panel/api/bps/sync/trigger', {
        method: 'POST',
        body: JSON.stringify(syncData)
      });

      if (response.success) {
        toast({
          title: 'Sync Started',
          description: 'BPS data synchronization has been started',
        });

        // Reload sync history after a delay
        setTimeout(() => {
          loadSyncHistory();
        }, 2000);
      } else {
        toast({
          title: 'Sync Failed',
          description: response.error || 'Failed to start synchronization',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to trigger sync:', error);
      toast({
        title: 'Error',
        description: 'Failed to start synchronization',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [selectedAreas, selectedVariable, selectedYears, toast]);

  // Load sync history
  const loadSyncHistory = useCallback(async () => {
    try {
      const response = await apiFetch('/v2/panel/api/bps/sync/history?limit=5');
      if (response.success) {
        setSyncHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  }, []);

  // Sync areas (provinces/districts) from BPS API
  const syncAreasFromAPI = useCallback(async () => {
    try {
      setIsSyncingAreas(true);

      const response = await apiFetch('/v2/panel/api/bps/areas/sync', {
        method: 'POST',
      });

      if (response.success) {
        toast({
          title: 'Areas Synced',
          description: `Synced ${response.data?.syncedCount ?? ''} areas from BPS API`,
        });
        await loadInitialData();
      } else {
        toast({
          title: 'Area Sync Failed',
          description: response.error || 'Failed to sync areas from BPS API',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to sync areas:', error);
      toast({
        title: 'Area Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync areas',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingAreas(false);
    }
  }, [toast, loadInitialData]);

  // Build selectedYears from yearFrom/yearTo
  useEffect(() => {
    if (!yearFrom || !yearTo) return;
    const from = parseInt(yearFrom);
    const to = parseInt(yearTo);
    const years: string[] = [];
    for (let y = Math.min(from, to); y <= Math.max(from, to); y++) {
      years.push(y.toString());
    }
    setSelectedYears(years);
  }, [yearFrom, yearTo]);

  // Load available periods when variable or area changes
  const loadPeriods = useCallback(async () => {
    if (!selectedAreas.length || !selectedVariable) return;
    try {
      const response = await apiFetch(
        `/v2/panel/api/bps/periods?domain=${selectedAreas[0]}&var=${selectedVariable}`
      );
      if (response.success && response.data) {
        const { years, periods, periodType: pt, latestYear } = response.data;
        const yearOpts = years.length > 0 ? years : [
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
          { value: '2021', label: '2021' },
        ];
        setAvailableYears(yearOpts);
        setAvailablePeriods(periods);
        setPeriodType(pt || 'annual');

        // Auto-select year range if not set
        if (!yearFrom && yearOpts.length > 0) {
          setYearTo(yearOpts[0].value); // latest
          setYearFrom(yearOpts[Math.min(2, yearOpts.length - 1)].value); // 3 years back
        }
        // Auto-select first period if available
        if (periods.length > 0 && !selectedPeriod) {
          // Prefer "Tahunan" if available, else last period
          const tahunan = periods.find((p: { label: string }) => p.label.toLowerCase().includes('tahunan'));
          setSelectedPeriod(tahunan ? tahunan.value : periods[periods.length - 1].value);
        }
      }
    } catch (error) {
      console.error('Failed to load periods:', error);
    }
  }, [selectedAreas, selectedVariable]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  // Search BPS variable catalog
  const searchBPSVariables = useCallback(async () => {
    if (!varSearchKeyword.trim()) return;
    try {
      setIsSearchingVars(true);
      const domain = selectedAreas[0] || '0000';
      const response = await apiFetch(
        `/v2/panel/api/bps/variables/search?domain=${domain}&keyword=${encodeURIComponent(varSearchKeyword)}`
      );
      if (response.success) {
        setVarSearchResults(response.data);
      }
    } catch (error) {
      console.error('Failed to search variables:', error);
    } finally {
      setIsSearchingVars(false);
    }
  }, [varSearchKeyword, selectedAreas]);

  // Add variable from search results
  const addVariableFromSearch = useCallback(async (varItem: { var_id: string; title: string; unit: string; subject: string }) => {
    try {
      const response = await apiFetch('/v2/panel/api/bps/variables', {
        method: 'POST',
        body: JSON.stringify({
          variable_id: varItem.var_id,
          variable_name: varItem.title,
          unit: varItem.unit,
          category: varItem.subject,
        }),
      });
      if (response.success) {
        toast({ title: 'Variable Added', description: `${varItem.title} added successfully` });
        await loadInitialData();
        setSelectedVariable(varItem.var_id);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to add variable', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add variable', variant: 'destructive' });
    }
  }, [toast, loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleAreaChange = (areaCode: string) => {
    if (areaCode) {
      setSelectedAreas([areaCode]);
    }
  };

  const handleVariableChange = (variableId: string) => {
    if (variableId) {
      setSelectedVariable(variableId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading BPS data...</p>
        </div>
      </div>
    );
  }

  const provinces = areas.filter(a => a.area_type === 'province').sort((a, b) => a.area_code.localeCompare(b.area_code));
  const districts = areas.filter(a => a.area_type === 'district').sort((a, b) => a.area_code.localeCompare(b.area_code));

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">BPS Statistical Data</h2>
          <p className="text-muted-foreground mt-1">
            Indonesian statistical data visualization and management
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadChartData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={syncAreasFromAPI}
            disabled={isSyncingAreas}
          >
            <MapPin className={`h-4 w-4 mr-2 ${isSyncingAreas ? 'animate-pulse' : ''}`} />
            {isSyncingAreas ? 'Syncing Areas...' : 'Sync Areas'}
          </Button>
          <Button
            size="sm"
            onClick={triggerSync}
            disabled={isSyncing || !selectedAreas.length || !selectedVariable}
          >
            <Database className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Configuration
          </CardTitle>
          <CardDescription>
            Configure areas, variables, and time periods for visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {/* Area Selection */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Province
              </label>
              {provinces.length > 0 ? (
                <Select
                  value={selectedAreas[0] || undefined}
                  onValueChange={handleAreaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(province => (
                      <SelectItem key={province.area_code} value={province.area_code}>
                        {province.area_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-full items-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-3 text-sm text-muted-foreground">
                  Use "Sync Areas" above
                </div>
              )}
            </div>

            {/* Variable Selection */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  Statistical Variable
                </span>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowVarSearch(!showVarSearch)}
                >
                  {showVarSearch ? 'Close' : '+ Browse BPS'}
                </button>
              </label>
              <Select
                value={selectedVariable || undefined}
                onValueChange={handleVariableChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map(variable => (
                    <SelectItem key={variable.variable_id} value={variable.variable_id}>
                      {variable.variable_name}
                      {variable.unit ? ` (${variable.unit})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detail Level */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Detail Level
              </label>
              <Select value={detailLevel} onValueChange={(value: 'province' | 'kabupaten') => setDetailLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="province">Provinsi (Agregat)</SelectItem>
                  <SelectItem value="kabupaten">Kabupaten/Kota</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                Chart Type
              </label>
              <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Year & Period Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Year From */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Year From
              </label>
              <Select value={yearFrom || undefined} onValueChange={setYearFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Start year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year To */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Year To
              </label>
              <Select value={yearTo || undefined} onValueChange={setYearTo}>
                <SelectTrigger>
                  <SelectValue placeholder="End year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period (if available) */}
            {availablePeriods.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Period
                  <Badge variant="outline" className="text-xs ml-1">
                    {periodType === 'monthly' ? 'Bulanan' : periodType === 'quarterly' ? 'Triwulan' : periodType === 'semester' ? 'Semester' : 'Tahunan'}
                  </Badge>
                </label>
                <Select value={selectedPeriod || undefined} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePeriods.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* BPS Variable Search */}
          {showVarSearch && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Browse BPS Statistics Catalog</h4>
                <button type="button" onClick={() => setShowVarSearch(false)}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search... e.g. penduduk, ekspor, kemiskinan"
                  value={varSearchKeyword}
                  onChange={(e) => setVarSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchBPSVariables()}
                  className="flex-1"
                />
                <Button size="sm" onClick={searchBPSVariables} disabled={isSearchingVars}>
                  <Search className={`h-4 w-4 mr-1 ${isSearchingVars ? 'animate-spin' : ''}`} />
                  Search
                </Button>
              </div>
              {varSearchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {varSearchResults.map(item => {
                    const isAdded = variables.some(v => v.variable_id === item.var_id);
                    return (
                      <div key={item.var_id} className="flex items-start justify-between gap-3 p-3 border rounded-md bg-background">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0 text-xs">{item.var_id}</Badge>
                            <span className="text-sm font-medium truncate">{item.title}</span>
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            {item.unit && <span>Unit: {item.unit}</span>}
                            {item.subject && <span>Subject: {item.subject}</span>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? "secondary" : "default"}
                          disabled={isAdded}
                          className="shrink-0"
                          onClick={() => addVariableFromSearch(item)}
                        >
                          {isAdded ? (
                            <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Added</>
                          ) : (
                            <><Plus className="h-3.5 w-3.5 mr-1" /> Add</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {varSearchResults.length === 0 && varSearchKeyword && !isSearchingVars && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No results. Try a different keyword.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Chart Visualization</TabsTrigger>
          <TabsTrigger value="districts">District Data</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          {data.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistical Trend Analysis
                </CardTitle>
                <CardDescription>
                  {provinces.find(p => p.area_code === selectedAreas[0])?.area_name || 'Selected area'} &mdash;{' '}
                  {variables.find(v => v.variable_id === selectedVariable)?.variable_name || 'Selected variable'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === 'line' ? (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(data[0] || {})
                        .filter(key => key !== 'year')
                        .map((areaName, index) => (
                          <Line
                            key={areaName}
                            type="monotone"
                            dataKey={areaName}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                    </LineChart>
                  ) : (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(data[0] || {})
                        .filter(key => key !== 'year')
                        .map((areaName, index) => (
                          <Bar
                            key={areaName}
                            dataKey={areaName}
                            fill={COLORS[index % COLORS.length]}
                            radius={[2, 2, 0, 0]}
                          />
                        ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No Data Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {provinces.length === 0
                      ? 'Click "Sync Areas" above to load provinces from BPS.'
                      : variables.length === 0
                        ? 'No variables configured. Go to BPS Configuration to add variables.'
                        : 'Select a province, variable, and years above, then click "Sync Data" to fetch data.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="districts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                District Comparison
              </CardTitle>
              <CardDescription>
                {selectedAreas.length > 0
                  ? `Districts in ${provinces.find(p => p.area_code === selectedAreas[0])?.area_name || 'selected province'}`
                  : 'Select a province to view its districts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAreas.length > 0 ? (
                <div className="space-y-4">
                  {districts.filter(d => d.parent_area_code === selectedAreas[0]).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {districts
                        .filter(d => d.parent_area_code === selectedAreas[0])
                        .map(district => (
                          <div key={district.area_code} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h5 className="font-medium text-sm">{district.area_name}</h5>
                              <p className="text-xs text-muted-foreground">
                                Code: {district.area_code}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              P{district.priority_level}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground mt-2">
                        No districts found for this province. Sync areas to populate district data.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a province first to view its districts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Synchronization History
              </CardTitle>
              <CardDescription>
                Recent BPS data synchronization activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncHistory.length > 0 ? (
                  syncHistory.map(sync => (
                    <div key={sync.id} className="flex items-center justify-between p-5 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {sync.sync_type.charAt(0).toUpperCase() + sync.sync_type.slice(1)} Sync
                          </span>
                          {getStatusBadge(sync.sync_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(sync.started_at).toLocaleString()}
                        </p>
                        {sync.completed_at && (
                          <p className="text-sm text-muted-foreground">
                            Completed: {new Date(sync.completed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="text-green-600">+{sync.records_inserted}</span> inserted
                        </div>
                        <div className="text-sm">
                          <span className="text-blue-600">~{sync.records_updated}</span> updated
                        </div>
                        {sync.records_failed > 0 && (
                          <div className="text-sm text-red-600">
                            !{sync.records_failed} failed
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-2">No synchronization history</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}