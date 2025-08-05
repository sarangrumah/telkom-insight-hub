import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { BarChart3, Users, MapPin, TrendingUp } from "lucide-react";
import { useUnreadTicketCount } from "@/hooks/useUnreadTicketCount";
import { useRealtimeTickets } from "@/hooks/useRealtimeTickets";
import { DevSecOpsMonitor } from "./DevSecOpsMonitor";
import DataVisualization from "./DataVisualization";

interface DashboardProps {
  user: User;
  session: Session;
  onLogout: () => void;
}

export default function Dashboard({ user, session, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [telkomData, setTelkomData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const { data, error } = await supabase
        .from("telekom_data")
        .select("*")
        .limit(10);

      if (error) {
        console.error("Error fetching telkom data:", error);
      } else {
        setTelkomData(data || []);
      }
    } catch (error) {
      console.error("Error fetching telkom data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your telecommunications data insight hub
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telkomData.length}</div>
              <p className="text-xs text-muted-foreground">
                Telecommunications data entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {telkomData.filter(d => d.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.is_validated ? "Validated" : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground">
                Account validation status
              </p>
            </CardContent>
          </Card>

          {/* DevSecOps Monitor for Admin users */}
          {(userRole === 'super_admin' || userRole === 'internal_admin') && (
            <DevSecOpsMonitor />
          )}
        </div>

        {/* Data Visualization Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Telecommunications Data</CardTitle>
                <CardDescription>
                  Latest entries in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {telkomData.length > 0 ? (
                  <div className="space-y-4">
                    {telkomData.slice(0, 5).map((data, index) => (
                      <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{data.company_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Service: {data.service_type} | Region: {data.region || 'N/A'}
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
                    No telecommunications data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <DataVisualization 
              summaryStats={{
                totalLicenses: telkomData.length,
                activeOperators: telkomData.filter(d => d.status === 'active').length,
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