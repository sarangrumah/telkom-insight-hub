import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { BarChart3, Users, MapPin, Settings, LogOut, Menu, Database, HelpCircle, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  useEffect(() => {
    fetchUserData();
    fetchTelkomData();
  }, [user]);

  const fetchUserData = async () => {
    try {
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      onLogout();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Telkom Insight Hub</h2>
        <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name || user.email}</p>
        <Badge variant="secondary" className="mt-2">
          {userRole}
        </Badge>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <BarChart3 className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/data-management'}
        >
          <Database className="mr-2 h-4 w-4" />
          Data Management
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <MapPin className="mr-2 h-4 w-4" />
          Data Map
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/faq'}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          FAQ
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => window.location.href = '/support'}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Support
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          User Management
        </Button>
        {(userRole === 'super_admin' || userRole === 'internal_admin') && (
          <>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/faq'}
            >
              <Settings className="mr-2 h-4 w-4" />
              FAQ Management
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/tickets'}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ticket Management
            </Button>
          </>
        )}
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      <div className="p-4 border-t">
        <Button onClick={handleLogout} variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 border-r bg-card">
          {sidebarContent}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your telecommunications data insight hub
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Recent data */}
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
          </div>
        </div>
      </div>
    </div>
  );
}