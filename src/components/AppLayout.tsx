import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  Database, 
  HelpCircle, 
  MessageSquare 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUnreadTicketCount } from "@/hooks/useUnreadTicketCount";
import { useRealtimeTickets } from "@/hooks/useRealtimeTickets";
import { NotificationSettings } from "./NotificationSettings";

interface AppLayoutProps {
  user: User;
  session: Session;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppLayout({ user, session, onLogout, children }: AppLayoutProps) {
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { counts } = useUnreadTicketCount();
  
  // Initialize real-time notifications and ticket updates
  useRealtimeTickets();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping fetch');
      setIsLoading(false);
      return;
    }

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
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
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

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Telkom Insight Hub</h2>
        <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name || user?.email || 'User'}</p>
        <Badge variant="secondary" className="mt-2">
          {userRole}
        </Badge>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button 
          variant={isActive('/dashboard') ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/dashboard')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        
        <Button 
          variant={isActive('/data-management') ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/data-management')}
        >
          <Database className="mr-2 h-4 w-4" />
          Data Management
        </Button>
        
        <Button 
          variant={isActive('/data-visualization') ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/data-visualization')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Data Visualization
        </Button>
        
        <Button 
          variant={isActive('/faq') ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/faq')}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          FAQ
        </Button>
        
        <Button 
          variant={isActive('/support') ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/support')}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Support
          {counts.userTickets > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs min-w-5 h-5 flex items-center justify-center p-1">
              {counts.userTickets}
            </Badge>
          )}
        </Button>
        
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          User Management
        </Button>
        
        {(userRole === 'super_admin' || userRole === 'internal_admin' || userRole === 'pengolah_data') && (
          <>
            <Button 
              variant={isActive('/admin/faq') ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => navigate('/admin/faq')}
            >
              <Settings className="mr-2 h-4 w-4" />
              FAQ Management
            </Button>
            <Button 
              variant={isActive('/admin/tickets') ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => navigate('/admin/tickets')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ticket Management
              {counts.adminTickets > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs min-w-5 h-5 flex items-center justify-center p-1">
                  {counts.adminTickets}
                </Badge>
              )}
            </Button>
          </>
        )}
        
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      <div className="p-4 border-t space-y-2">
        <NotificationSettings />
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
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Telkom System</h1>
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

      <div className="lg:flex w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 border-r bg-card">
          {sidebarContent}
        </div>

        {/* Main content */}
        <div className="flex-1 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}