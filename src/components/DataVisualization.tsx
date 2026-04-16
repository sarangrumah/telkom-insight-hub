import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useState } from 'react';

interface ServiceRelationLite {
  name?: string | null;
  service?: {
    name?: string | null;
  } | null;
}

interface TelekomDataLite {
  id?: string;
  company_name?: string | null;
  status?: string | null;
  license_date?: string | null;
  region?: string | null;
  sub_service?: ServiceRelationLite | null;
  service_type?: string | null;
  sub_service_type?: string | null;
}

interface DataVisualizationProps {
  data?: TelekomDataLite[];
  summaryStats?: {
    totalLicenses: number;
    activeOperators: number;
    totalApplications: number;
    pendingApprovals: number;
  };
}

const DataVisualization = ({
  data = [],
  summaryStats,
}: DataVisualizationProps) => {
  const [showSubServices, setShowSubServices] = useState(false);

  // Map service_type codes to human-friendly labels
  const serviceLabelMap: Record<string, string> = {
    jasa: 'Jasa',
    jaringan: 'Jaringan',
    telekomunikasi_khusus: 'Telekomunikasi Khusus',
    isr: 'ISR',
    tarif: 'Tarif',
    sklo: 'SKLO',
    lko: 'LKO',
  };
  const normalizeServiceLabel = (value?: string | null) => {
    if (!value) return 'Unknown';
    const key = value.toLowerCase();
    return serviceLabelMap[key] || value;
  };

  // Process real data only (no mock)
  const processServiceTypeData = () => {
    if (data.length === 0) {
      return [];
    }

    if (showSubServices) {
      // Group by sub-service names (supports Supabase shape and fallback)
      const subServiceCounts: Record<string, number> = {};
      data.forEach((item: TelekomDataLite) => {
        const raw =
          item?.sub_service?.name || item?.sub_service_type || 'Other';
        const label =
          typeof raw === 'string' && raw.length > 50
            ? raw.substring(0, 50) + '...'
            : raw;
        subServiceCounts[label] = (subServiceCounts[label] || 0) + 1;
      });

      return Object.entries(subServiceCounts)
        .map(([name, count], index) => ({
          name,
          value: count,
          fill: `hsl(var(--chart-${(index % 5) + 1}))`,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Show top 10 sub-services
    } else {
      // Group by main service (supports Supabase shape and fallback), normalized to context labels
      const serviceCounts: Record<string, number> = {};
      data.forEach((item: TelekomDataLite) => {
        // Prefer enum code for stable grouping, fallback to related service name
        const code = item?.service_type;
        const relatedName = item?.sub_service?.service?.name;
        const display = code
          ? normalizeServiceLabel(code)
          : normalizeServiceLabel(relatedName || 'Unknown');
        serviceCounts[display] = (serviceCounts[display] || 0) + 1;
      });

      return Object.entries(serviceCounts)
        .map(([name, count], index) => ({
          name,
          value: count,
          fill: `hsl(var(--chart-${(index % 7) + 1}))`,
        }))
        .sort((a, b) => b.value - a.value);
    }
  };

  const serviceTypeData = processServiceTypeData();

  const regionData = (() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const key = item?.region || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const monthlyData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const base = months.map((m) => ({ month: m, applications: 0, approvals: 0 }));
    data.forEach((item) => {
      if (!item?.license_date) return;
      const idx = new Date(item.license_date).getMonth();
      if (idx >= 0 && idx < 12) {
        base[idx].applications += 1;
        if ((item?.status || '').toLowerCase() === 'active') {
          base[idx].approvals += 1;
        }
      }
    });
    return base;
  })();

  const computedStats = {
    totalLicenses: data.length,
    activeOperators: data.filter((d) => (d?.status || '').toLowerCase() === 'active').length,
    totalApplications: data.length,
    pendingApprovals: data.filter((d) => (d?.status || '').toLowerCase() === 'pending').length,
  };

  const stats = summaryStats ?? computedStats;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Izin</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.totalLicenses.toLocaleString()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalLicenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Izin penyelenggaraan aktif
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelaku Usaha</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.activeOperators}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.activeOperators}
            </div>
            <p className="text-xs text-muted-foreground">Penyelenggara aktif</p>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Aplikasi
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.totalApplications}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalApplications}
            </div>
            <p className="text-xs text-muted-foreground">Permohonan diproses</p>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Persetujuan
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {stats.pendingApprovals}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">Permohonan pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Service Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg">
                  Distribusi Jenis Penyelenggaraan
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Pembagian data berdasarkan jenis layanan telekomunikasi •
                  Mode: {showSubServices ? 'Sub-Services' : 'Main Services'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubServices(!showSubServices)}
                className="w-full sm:w-auto"
              >
                {showSubServices ? 'Main Services' : 'Sub Services'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full h-[350px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => {
                      // Truncate long names for better display
                      const shortName =
                        name.length > 15 ? `${name.substring(0, 12)}...` : name;
                      return `${shortName}: ${value} (${(percent * 100).toFixed(
                        0
                      )}%)`;
                    }}
                    outerRadius="70%"
                    innerRadius="20%"
                    fill="#8884d8"
                    dataKey="value"
                    fontSize={10}
                  >
                    {serviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      `${val}`,
                      'Jumlah',
                    ]}
                    labelFormatter={label => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={60}
                    fontSize={10}
                    wrapperStyle={{
                      paddingTop: '10px',
                      fontSize: '10px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Sebaran Regional
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Distribusi penyelenggara telekomunikasi per wilayah
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full h-[350px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="region"
                    fontSize={11}
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={11} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Monthly Applications Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Tren Permohonan Bulanan
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Perbandingan aplikasi yang masuk dan disetujui per bulan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full h-[350px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={11} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend fontSize={11} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="applications"
                    fill="hsl(var(--chart-1))"
                    name="Aplikasi Masuk"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="approvals"
                    fill="hsl(var(--chart-2))"
                    name="Disetujui"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Data Terbaru</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Penyelenggara telekomunikasi yang baru terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">
                      Perusahaan
                    </th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">
                      Jenis
                    </th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">
                      Region
                    </th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">
                      Status
                    </th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .slice()
                    .sort((a, b) => {
                      const da = a?.license_date ? new Date(a.license_date).getTime() : 0;
                      const db = b?.license_date ? new Date(b.license_date).getTime() : 0;
                      return db - da;
                    })
                    .slice(0, 5)
                    .map((item, index) => {
                      const type = item?.service_type
                        ? normalizeServiceLabel(item.service_type)
                        : item?.sub_service?.name || item?.sub_service_type || 'Unknown';
                      const status = item?.status || 'Unknown';
                      const dateStr = item?.license_date
                        ? new Date(item.license_date).toLocaleDateString('id-ID')
                        : '-';
                      return (
                        <tr
                          key={item?.id || index}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">
                            <div
                              className="max-w-[200px] truncate"
                              title={item?.company_name || '-'}
                            >
                              {item?.company_name || '-'}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3">
                            <Badge variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm">
                            {item?.region || 'Unknown'}
                          </td>
                          <td className="p-2 sm:p-3">
                            <Badge
                              variant={(status || '').toLowerCase() === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {status}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 text-muted-foreground text-xs sm:text-sm">
                            <div className="whitespace-nowrap">
                              {dateStr}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
