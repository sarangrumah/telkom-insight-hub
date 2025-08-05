import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DataVisualizationProps {
  data?: any[];
  summaryStats?: {
    totalLicenses: number;
    activeOperators: number;
    totalApplications: number;
    pendingApprovals: number;
  };
}

const DataVisualization = ({ data = [], summaryStats }: DataVisualizationProps) => {
  // Process data for charts
  const serviceTypeData = [
    { name: 'Jasa', value: 234, fill: 'hsl(var(--chart-1))' },
    { name: 'Jaringan', value: 345, fill: 'hsl(var(--chart-2))' },
    { name: 'Telekomunikasi Khusus', value: 123, fill: 'hsl(var(--chart-3))' },
    { name: 'ISR', value: 189, fill: 'hsl(var(--chart-4))' },
    { name: 'Tarif', value: 167, fill: 'hsl(var(--chart-5))' },
    { name: 'SKLO', value: 98, fill: 'hsl(var(--primary))' },
    { name: 'LKO', value: 91, fill: 'hsl(var(--secondary))' }
  ];

  const regionData = [
    { region: 'Jakarta', count: 456 },
    { region: 'Surabaya', count: 234 },
    { region: 'Bandung', count: 189 },
    { region: 'Medan', count: 167 },
    { region: 'Makassar', count: 134 },
    { region: 'Semarang', count: 123 },
    { region: 'Palembang', count: 98 },
    { region: 'Denpasar', count: 87 }
  ];

  const monthlyData = [
    { month: 'Jan', applications: 45, approvals: 42 },
    { month: 'Feb', applications: 52, approvals: 48 },
    { month: 'Mar', applications: 48, approvals: 44 },
    { month: 'Apr', applications: 61, approvals: 58 },
    { month: 'May', applications: 55, approvals: 52 },
    { month: 'Jun', applications: 67, approvals: 63 }
  ];

  const defaultSummaryStats = {
    totalLicenses: 1247,
    activeOperators: 89,
    totalApplications: 456,
    pendingApprovals: 23
  };

  const stats = summaryStats || defaultSummaryStats;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Izin</CardTitle>
            <Badge variant="secondary">{stats.totalLicenses.toLocaleString()}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLicenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Izin penyelenggaraan aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelaku Usaha</CardTitle>
            <Badge variant="secondary">{stats.activeOperators}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOperators}</div>
            <p className="text-xs text-muted-foreground">Penyelenggara aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aplikasi</CardTitle>
            <Badge variant="secondary">{stats.totalApplications}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Permohonan diproses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            <Badge variant="destructive">{stats.pendingApprovals}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Permohonan pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Penyelenggaraan</CardTitle>
            <CardDescription>
              Pembagian data berdasarkan jenis layanan telekomunikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sebaran Regional</CardTitle>
            <CardDescription>
              Distribusi penyelenggara telekomunikasi per wilayah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Applications Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Permohonan Bulanan</CardTitle>
            <CardDescription>
              Perbandingan aplikasi yang masuk dan disetujui per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="hsl(var(--chart-1))" name="Aplikasi Masuk" />
                <Bar dataKey="approvals" fill="hsl(var(--chart-2))" name="Disetujui" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Terbaru</CardTitle>
          <CardDescription>
            Penyelenggara telekomunikasi yang baru terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Perusahaan</th>
                  <th className="text-left p-2">Jenis</th>
                  <th className="text-left p-2">Region</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { company: 'PT Telekom Indonesia', type: 'Jasa', region: 'Jakarta', status: 'Active', date: '2024-01-15' },
                  { company: 'PT Indosat Ooredoo', type: 'Jaringan', region: 'Jakarta', status: 'Active', date: '2024-01-14' },
                  { company: 'PT XL Axiata', type: 'Jasa', region: 'Surabaya', status: 'Active', date: '2024-01-13' },
                  { company: 'PT Smartfren', type: 'ISR', region: 'Bandung', status: 'Pending', date: '2024-01-12' },
                  { company: 'PT Hutchison 3 Indonesia', type: 'Jaringan', region: 'Medan', status: 'Active', date: '2024-01-11' }
                ].map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.company}</td>
                    <td className="p-2">
                      <Badge variant="outline">{item.type}</Badge>
                    </td>
                    <td className="p-2">{item.region}</td>
                    <td className="p-2">
                      <Badge 
                        variant={item.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;