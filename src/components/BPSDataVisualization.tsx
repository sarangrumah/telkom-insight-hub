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
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const { toast } = useToast();

  // Available years (2020-2024)
  const availableYears = ['2020', '2021', '2022', '2023', '2024'];

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load areas
      const areasResponse = await apiFetch('/panel/api/bps/areas?active=true');
      if (areasResponse.success) {
        setAreas(areasResponse.data);
      }

      // Load variables
      const variablesResponse = await apiFetch('/panel/api/bps/variables?active=true');
      if (variablesResponse.success) {
        setVariables(variablesResponse.data);
      }

      // Load sync history
      const historyResponse = await apiFetch('/panel/api/bps/sync/history?limit=5');
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
      
      setSelectedYears(['2022', '2023', '2024']);

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
        format: 'pivot'
      });

      const response = await apiFetch(`/panel/api/bps/data?${params.toString()}`) as BPSDataResponse;

      if (response.success) {
        setData(response.data);
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
  }, [selectedAreas, selectedVariable, selectedYears, toast]);

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

      const response = await apiFetch('/panel/api/bps/sync/trigger', {
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
      const response = await apiFetch('/panel/api/bps/sync/history?limit=5');
      if (response.success) {
        setSyncHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleAreaChange = (areaCode: string) => {
    setSelectedAreas([areaCode]);
  };

  const handleVariableChange = (variableId: string) => {
    setSelectedVariable(variableId);
  };

  const handleYearToggle = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort()
    );
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

  const provinces = areas.filter(a => a.area_type === 'province');
  const districts = areas.filter(a => a.area_type === 'district');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">BPS Statistical Data</h2>
          <p className="text-muted-foreground">
            Indonesian statistical data visualization and management
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Area Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Province</label>
              <Select value={selectedAreas[0] || ''} onValueChange={handleAreaChange}>
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
            </div>

            {/* Variable Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Statistical Variable</label>
              <Select value={selectedVariable} onValueChange={handleVariableChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map(variable => (
                    <SelectItem key={variable.variable_id} value={variable.variable_id}>
                      <div className="flex flex-col">
                        <span>{variable.variable_name}</span>
                        {variable.unit && (
                          <span className="text-xs text-muted-foreground">
                            Unit: {variable.unit}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedYears(['2022', '2023', '2024'])}
                >
                  Recent 3Y
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedYears(['2020', '2021', '2022', '2023', '2024'])}
                >
                  All Years
                </Button>
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Years</label>
            <div className="flex flex-wrap gap-2">
              {availableYears.map(year => (
                <Button
                  key={year}
                  variant={selectedYears.includes(year) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearToggle(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Chart Visualization</TabsTrigger>
          <TabsTrigger value="districts">District Data</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          {data.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistical Trend Analysis
                </CardTitle>
                <CardDescription>
                  Time-series data visualization with district comparisons
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
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="text-lg font-medium">No Data Available</h3>
                    <p className="text-muted-foreground">
                      Configure the settings above and sync data to view charts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                District Comparison
              </CardTitle>
              <CardDescription>
                Current year data comparison across districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAreas.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Districts in {provinces.find(p => p.area_code === selectedAreas[0])?.area_name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {districts
                      .filter(d => d.parent_area_code === selectedAreas[0])
                      .map(district => (
                        <Card key={district.area_code} className="p-4">
                          <div className="space-y-2">
                            <h5 className="font-medium">{district.area_name}</h5>
                            <p className="text-sm text-muted-foreground">
                              Code: {district.area_code}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Priority: {district.priority_level}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
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
                    <div key={sync.id} className="flex items-center justify-between p-4 border rounded-lg">
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