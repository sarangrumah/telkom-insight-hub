import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { 
  BarChart3, Users, MapPin, TrendingUp, Calendar, Filter,
  RefreshCw, Download, Eye
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useUnreadTicketCount } from "@/hooks/useUnreadTicketCount";
import { useRealtimeTickets } from "@/hooks/useRealtimeTickets";
import { DevSecOpsMonitor } from "./DevSecOpsMonitor";
import DataVisualization from "./DataVisualization";

interface EnhancedDashboardProps {
  user: User;
  session: Session;
  onLogout: () => void;
}

export default function EnhancedDashboard({ user, session, onLogout }: EnhancedDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [telkomData, setTelkomData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { counts } = useUnreadTicketCount();
  
  // Initialize real-time notifications and ticket updates
  useRealtimeTickets();

  useEffect(() => {
    fetchUserData();
    fetchTelkomData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping fetch');
      return;
    }
    
    try {
      console.log('Fetching user data for user:', user.id);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError) {
        console.error("Role error:", roleError);
      } else {
        setUserRole(roleData?.role || "guest");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTelkomData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from("telekom_data")
        .select(`
          *,
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

      if (error) {
        console.error("Error fetching telkom data:", error);
      } else {
        setTelkomData(data || []);
      }
    } catch (error) {
      console.error("Error fetching telkom data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

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

  // Service distribution data for vertical bar chart
  const getServiceDistributionData = () => {
    const filteredData = getFilteredDataByYear();
    const serviceCounts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const serviceName = item.sub_service?.service?.name || 'Unknown';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    return Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Sub-service distribution data for horizontal bar chart
  const getSubServiceDistributionData = () => {
    const filteredData = getFilteredDataByYear();
    const subServiceCounts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const subServiceName = item.sub_service?.name || 'Unknown';
      subServiceCounts[subServiceName] = (subServiceCounts[subServiceName] || 0) + 1;
    });

    return Object.entries(subServiceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 sub-services
  };

  // Monthly trends data
  const getMonthlyTrendsData = () => {
    const filteredData = getFilteredDataByYear();
    const monthCounts: Record<string, number> = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

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

  const refreshData = async () => {
    await fetchTelkomData();
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading enhanced dashboard...</p>
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
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enhanced Dashboard
            </h1>
            <p className="text-muted-foreground">
              Advanced analytics and real-time insights for telecommunications data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records ({selectedYear})</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
              <p className="text-xs text-muted-foreground">
                Telecommunications data entries
              </p>
              <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active dataset
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <MapPin className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {filteredData.filter(d => d.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active services
              </p>
              <Badge variant="secondary" className="mt-2 bg-accent/10 text-accent">
                <Eye className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Status</CardTitle>
              <Users className="h-4 w-4" style={{ color: 'hsl(var(--chart-4))' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>
                {profile?.is_validated ? "Validated" : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground">
                Account validation status
              </p>
              <Badge variant="secondary" className="mt-2" style={{ backgroundColor: 'hsl(var(--chart-4) / 0.1)', color: 'hsl(var(--chart-4))' }}>
                Role: {userRole}
              </Badge>
            </CardContent>
          </Card>

          {/* DevSecOps Monitor for Admin users */}
          {(userRole === 'super_admin' || userRole === 'internal_admin') && (
            <DevSecOpsMonitor />
          )}
        </div>

        {/* Enhanced Data Visualization Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">
              <BarChart3 className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="subservices">Sub-Services</TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Trends ({selectedYear})
                  </CardTitle>
                  <CardDescription>License issuance per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Telecommunications Data</CardTitle>
                  <CardDescription>Latest entries in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredData.length > 0 ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {filteredData.slice(0, 5).map((data, index) => (
                        <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <h4 className="font-medium">{data.company_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Service: {data.sub_service?.service?.name || 'N/A'} | Region: {data.region || 'N/A'}
                            </p>
                          </div>
                          <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
                            {data.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No telecommunications data available for {selectedYear}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Service Distribution - Vertical Bar Chart ({selectedYear})</span>
                  <Badge variant="outline">
                    <Filter className="h-3 w-3 mr-1" />
                    Year: {selectedYear}
                  </Badge>
                </CardTitle>
                <CardDescription>Distribution of telecommunications services</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={serviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
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

          <TabsContent value="subservices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sub-Service Distribution - Horizontal Bar Chart ({selectedYear})</span>
                  <Badge variant="outline">
                    <Filter className="h-3 w-3 mr-1" />
                    Top 10
                  </Badge>
                </CardTitle>
                <CardDescription>Top 10 sub-services by license count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={subServiceData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
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

          <TabsContent value="analytics" className="space-y-6">
            <DataVisualization 
              summaryStats={{
                totalLicenses: filteredData.length,
                activeOperators: filteredData.filter(d => d.status === 'active').length,
                totalApplications: 456,
                pendingApprovals: 23
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}