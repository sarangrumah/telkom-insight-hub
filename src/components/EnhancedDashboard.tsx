import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppUser } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/apiClient';
import {
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useUnreadTicketCount } from '@/hooks/useUnreadTicketCount';
import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';
import { DevSecOpsMonitor } from './DevSecOpsMonitor';
import DataVisualization from './DataVisualization';
import { ExcelExportButton } from './ExcelExportButton';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/components/PermissionGuard';
import ServiceCountCards from '@/components/ServiceCountCards';

interface EnhancedDashboardProps {
  user: AppUser;
  onLogout: () => void;
}

interface TelkomDataRow {
  id: string;
  company_name: string | null;
  status: string | null;
  license_date: string | null;
  region: string | null;
  service_type?: string | null;
  sub_service_type?: string | null;
  sub_service?: {
    id: string;
    name: string | null;
    service?: {
      id: string;
      name: string | null;
      code: string | null;
    } | null;
  } | null;
}

export default function EnhancedDashboard({
  user,
  onLogout,
}: EnhancedDashboardProps) {
  const [userRole, setUserRole] = useState<string>(user?.roles?.[0] || '');
  const [telkomData, setTelkomData] = useState<TelkomDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { counts } = useUnreadTicketCount();

  // Initialize real-time notifications and ticket updates
  useRealtimeTickets();

  const navigate = useNavigate();

  interface SystemStatus {
    api: { status: string; uptimeSec: number; memory?: { rss: number; heapUsed: number; heapTotal: number } };
    db: { status: string; latencyMs: number | null };
    lastBackupAt: string | null;
  }

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [sysLoading, setSysLoading] = useState(true);

  // Pending validations (admin): number of profiles not validated
  const [pendingValidations, setPendingValidations] = useState<number | null>(null);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/panel/api/system/status');
      setSystemStatus(res as SystemStatus);
    } catch (e) {
      console.error('Failed to load system status', e);
      setSystemStatus(null);
    } finally {
      setSysLoading(false);
    }
  }, []);

  const fetchPendingValidations = useCallback(async () => {
    try {
      // Only fetch for admin roles
      if (userRole !== 'super_admin' && userRole !== 'internal_admin') {
        setPendingValidations(null);
        return;
      }
      const res = await apiFetch('/panel/api/admin/users/pending-count') as { pending?: number };
      setPendingValidations(typeof res?.pending === 'number' ? res.pending : 0);
    } catch (e) {
      // Silently ignore for non-admin or errors
      setPendingValidations(null);
    }
  }, [userRole]);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSystemStatus]);

  useEffect(() => {
    fetchPendingValidations();
    const iv = setInterval(fetchPendingValidations, 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchPendingValidations]);

  const fetchTelkomData = useCallback(async () => {
    try {
      setRefreshing(true);
      setIsLoading(true);

      // Fetch all pages; apply year filter on server when possible
      const PAGE_SIZE = 100; // capped by server to max 100
      let page = 1;
      let total = 0;
      let all: TelkomDataRow[] = [];

      const isAllYears = selectedYear === 'all';
      const dateFrom = !isAllYears ? `${selectedYear}-01-01` : null;
      const dateTo = !isAllYears ? `${selectedYear}-12-31` : null;

      while (true) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(PAGE_SIZE));
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        const resp = (await apiFetch(
          `/panel/api/telekom-data?${params.toString()}`
        )) as { data: TelkomDataRow[]; page: number; pageSize: number; total: number };

        const chunk = resp?.data || [];
        all = all.concat(chunk);
        total = resp?.total ?? chunk.length;

        // Exit conditions
        if (all.length >= total || chunk.length === 0) break;
        page += 1;

        // Safety cap to avoid infinite loops on unexpected server responses
        if (page > 200) {
          console.warn('Pagination safety cap reached while fetching telekom data.');
          break;
        }
      }

      setTelkomData(all);
    } catch (err: unknown) {
      console.error('Error fetching telekom data:', err);
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data.';
      toast({
        title: 'Gagal memuat data',
        description: message,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, toast]);

  useEffect(() => {
    fetchTelkomData();
  }, [fetchTelkomData, user?.id, selectedYear]);

  // Get available years from data
  const getAvailableYears = () => {
    const years = new Set<string>();
    telkomData.forEach(item => {
      if (item.license_date) {
        const year = new Date(item.license_date).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  };

  // Filter data by selected year
  const getFilteredDataByYear = () => {
    if (selectedYear === 'all') return telkomData;
    return telkomData.filter(item => {
      if (!item.license_date) return false;
      const itemYear = new Date(item.license_date).getFullYear().toString();
      return itemYear === selectedYear;
    });
  };

  // Helpers: normalize label for service_type codes -> human friendly
  const normalizeServiceLabel = (value?: string | null) => {
    if (!value) return 'Unknown';
    const map: Record<string, string> = {
      jasa: 'Jasa',
      jaringan: 'Jaringan',
      telekomunikasi_khusus: 'Telekomunikasi Khusus',
      isr: 'ISR',
      tarif: 'Tarif',
      sklo: 'SKLO',
      lko: 'LKO',
    };
    const key = String(value).toLowerCase();
    return map[key] || String(value);
  };

  // Service distribution data for vertical bar chart
  const getServiceDistributionData = () => {
    const filteredData = getFilteredDataByYear();
    const serviceCounts = new Map<string, number>();

    filteredData.forEach(item => {
      // Prefer enum code for stable grouping; fallback to related service name
      const label = item.service_type
        ? normalizeServiceLabel(item.service_type)
        : normalizeServiceLabel(item.sub_service?.service?.name || 'Unknown');
      serviceCounts.set(label, (serviceCounts.get(label) || 0) + 1);
    });
    return Array.from(serviceCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Sub-service distribution data for horizontal bar chart
  const getSubServiceDistributionData = () => {
    const filteredData = getFilteredDataByYear();
    const subServiceCounts = new Map<string, number>();

    filteredData.forEach(item => {
      const raw =
        item.sub_service?.name ||
        item.sub_service_type ||
        'Unknown';
      const name =
        typeof raw === 'string' && raw.length > 80
          ? raw.slice(0, 80) + '...'
          : raw;
      subServiceCounts.set(
        name,
        (subServiceCounts.get(name) || 0) + 1
      );
    });
    return Array.from(subServiceCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 sub-services
  };

  // Monthly trends data
  const getMonthlyTrendsData = () => {
    const filteredData = getFilteredDataByYear();
    const monthCounts = new Map<string, number>();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    months.forEach(month => monthCounts.set(month, 0));

    filteredData.forEach(item => {
      if (item.license_date) {
        const month = months[new Date(item.license_date).getMonth()];
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      }
    });
    return months.map(month => ({ month, count: monthCounts.get(month) || 0 }));
  };

  const refreshData = async () => {
    await fetchTelkomData();
    toast({
      title: 'Data Refreshed',
      description: 'Dashboard data has been updated successfully.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredDataByYear();
  const serviceData = getServiceDistributionData();
  const subServiceData = getSubServiceDistributionData();
  const monthlyData = getMonthlyTrendsData();
  const availableYears = getAvailableYears();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-3 sm:p-6 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto h-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Enhanced Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Advanced analytics and real-time insights for telecommunications
              data
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[140px] min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="hover-scale shadow-sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid - 2 Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-8 space-y-6 overflow-y-auto">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 border-primary/20 hover-scale transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Records
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {filteredData.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Data entries ({selectedYear})
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-primary/10 text-primary"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 via-accent/3 to-accent/10 border-accent/20 hover-scale transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Services
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {filteredData.filter(d => d.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently active
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-accent/10 text-accent"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Real-time
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/3 to-chart-4/10 border-chart-4/20 hover-scale transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    User Status
                  </CardTitle>
                  <Users
                    className="h-4 w-4"
                    style={{ color: 'hsl(var(--chart-4))' }}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: 'hsl(var(--chart-4))' }}
                  >
                    {user?.is_validated ? 'Validated' : 'Pending'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account status
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2"
                    style={{
                      backgroundColor: 'hsl(var(--chart-4) / 0.1)',
                      color: 'hsl(var(--chart-4))',
                    }}
                  >
                    {userRole || 'guest'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts and Data */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs sm:text-sm">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="subservices" className="text-xs sm:text-sm">
                  Sub-Services
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Service counts summary */}
                <ServiceCountCards />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5" />
                        Monthly Trends ({selectedYear})
                      </CardTitle>
                      <CardDescription>
                        License issuance per month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="opacity-30"
                          />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{
                              fill: 'hsl(var(--primary))',
                              strokeWidth: 2,
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                              stroke: 'hsl(var(--primary))',
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Data</CardTitle>
                      <CardDescription>
                        Latest telecommunications entries
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredData.length > 0 ? (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                          {filteredData.slice(0, 5).map((data, index) => (
                            <div
                              key={data.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium truncate">
                                  {data.company_name ||
                                    data.sub_service?.service?.name ||
                                    data.sub_service?.name ||
                                    (data.id ? `Record ${data.id.substring(0, 8)}` : 'Record')}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {data.sub_service?.service?.name || 'N/A'} •{' '}
                                  {data.region || 'N/A'}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  data.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="ml-2 flex-shrink-0"
                              >
                                {data.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No data available for {selectedYear}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-lg">
                        Service Distribution ({selectedYear})
                      </span>
                      <Badge variant="outline">
                        <Filter className="h-3 w-3 mr-1" />
                        Year: {selectedYear}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Distribution of telecommunications services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={serviceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          fontSize={11}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subservices" className="space-y-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-lg">
                        Sub-Service Distribution ({selectedYear})
                      </span>
                      <Badge variant="outline">
                        <Filter className="h-3 w-3 mr-1" />
                        Top 10
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Top 10 sub-services by license count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(350, subServiceData.length * 35)}
                    >
                      <BarChart
                        data={subServiceData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
                        barCategoryGap={6}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          fontSize={12}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={200}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          tick={{ fontSize: 11 }}
                          tickFormatter={value =>
                            typeof value === 'string' && value.length > 25
                              ? value.slice(0, 25) + '...'
                              : value
                          }
                        />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--accent))"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="overflow-hidden">
                  <DataVisualization data={filteredData} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Widgets & Sidebar */}
          <div className="xl:col-span-4 space-y-4">
            <div className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto custom-scrollbar space-y-4">
              {/* DevSecOps Monitor for Admin users */}
              {(userRole === 'super_admin' ||
                userRole === 'internal_admin') && (
                <div className="animate-fade-in">
                  <DevSecOpsMonitor />
                </div>
              )}

              {/* Ticket Status Widget */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>Real-time ticket overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Unread Tickets
                      </span>
                      <Badge variant="destructive" className="px-2 py-1">
                        {counts.unread}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Priority</span>
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 bg-amber-100 text-amber-800"
                      >
                        {counts.highPriority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Active</span>
                      <Badge variant="outline" className="px-2 py-1">
                        {counts.total}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Widget */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PermissionGuard moduleCode="data_management" action="read">
                      <ExcelExportButton
                        className="w-full justify-start hover-scale"
                        count={filteredData.length}
                        currentFilters={
                          selectedYear !== 'all'
                            ? {
                                date_from: `${selectedYear}-01-01`,
                                date_to: `${selectedYear}-12-31`,
                              }
                            : undefined
                        }
                      />
                    </PermissionGuard>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover-scale"
                      size="sm"
                      onClick={() => navigate('/data-visualization')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full hover-scale flex items-center justify-between"
                      size="sm"
                      onClick={() => navigate('/user-management')}
                    >
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </span>
                      {typeof pendingValidations === 'number' && pendingValidations > 0 && (
                        <Badge variant="destructive" className="px-2 py-0.5">
                          {pendingValidations}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Status Widget */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sysLoading ? (
                    <div className="text-sm text-muted-foreground">Loading system status...</div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        {(() => {
                          const status = systemStatus?.db.status || 'down';
                          const cls =
                            status === 'ok' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';
                          return (
                            <Badge variant="default" className={cls}>
                              {status.toUpperCase()}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DB Latency</span>
                        <span className="text-xs text-muted-foreground">
                          {systemStatus?.db.latencyMs != null ? `${systemStatus?.db.latencyMs} ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Services</span>
                        <Badge variant="default" className={(systemStatus?.api.status || 'down') === 'ok' ? 'bg-green-500' : 'bg-red-500'}>
                          {(systemStatus?.api.status || 'down').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="text-xs text-muted-foreground">
                          {systemStatus
                            ? `${Math.floor((systemStatus.api.uptimeSec || 0) / 3600)}h ${Math.floor(((systemStatus.api.uptimeSec || 0) % 3600) / 60)}m`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Backup</span>
                        <span className="text-xs text-muted-foreground">
                          {systemStatus?.lastBackupAt ? new Date(systemStatus.lastBackupAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
