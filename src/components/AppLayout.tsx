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
  Database, 
  Settings, 
  LogOut, 
  HelpCircle, 
  MessageSquare,
  ChevronDown,
  Home
} from "lucide-react";
import { useUnreadTicketCount } from "@/hooks/useUnreadTicketCount";
import { useRealtimeTickets } from "@/hooks/useRealtimeTickets";
import { NotificationSettings } from "./NotificationSettings";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppLayoutProps {
  user: User;
  session: Session;
  onLogout: () => void;
  children: ReactNode;
}

function AppSidebar({ user, profile, userRole, onLogout, counts }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const [adminSectionOpen, setAdminSectionOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAdminUser = userRole === 'super_admin' || userRole === 'internal_admin';
  const isDataProcessor = userRole === 'pengolah_data';
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-sidebar-border/60" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        {!isCollapsed && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Panel Penyelenggaraan
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-sidebar-foreground/80 truncate">
                {profile?.full_name || user?.email || 'User'}
              </p>
              <Badge variant="secondary" className="text-xs">
                {userRole}
              </Badge>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/dashboard')}
                  isActive={isActive('/dashboard')}
                  className="hover-scale transition-all duration-200"
                >
                  <Home className="h-4 w-4" />
                  {!isCollapsed && <span>Beranda</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/data-management')}
                  isActive={isActive('/data-management')}
                  className="hover-scale transition-all duration-200"
                >
                  <Database className="h-4 w-4" />
                  {!isCollapsed && <span>Data Management</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/data-visualization')}
                  isActive={isActive('/data-visualization')}
                  className="hover-scale transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  {!isCollapsed && <span>Data Visualization</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/faq')}
                  isActive={isActive('/faq')}
                  className="hover-scale transition-all duration-200"
                >
                  <HelpCircle className="h-4 w-4" />
                  {!isCollapsed && <span>FAQ</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/support')}
                  isActive={isActive('/support')}
                  className="hover-scale transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  {!isCollapsed && (
                    <>
                      <span>Support</span>
                      {counts.userTickets > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs animate-pulse-glow">
                          {counts.userTickets}
                        </Badge>
                      )}
                    </>
                  )}
                  {isCollapsed && counts.userTickets > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdminUser || isDataProcessor) && (
          <SidebarGroup>
            <Collapsible open={adminSectionOpen} onOpenChange={setAdminSectionOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent/50 rounded-md p-2 transition-colors">
                  Administration
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isAdminUser && (
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          onClick={() => navigate('/user-management')}
                          isActive={isActive('/user-management')}
                          className="hover-scale transition-all duration-200"
                        >
                          <Users className="h-4 w-4" />
                          {!isCollapsed && <span>User Management</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/admin/faq')}
                        isActive={isActive('/admin/faq')}
                        className="hover-scale transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        {!isCollapsed && <span>FAQ Management</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/admin/tickets')}
                        isActive={isActive('/admin/tickets')}
                        className="hover-scale transition-all duration-200"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span>Ticket Management</span>
                            {counts.adminTickets > 0 && (
                              <Badge variant="destructive" className="ml-auto text-xs animate-pulse-glow">
                                {counts.adminTickets}
                              </Badge>
                            )}
                          </>
                        )}
                        {isCollapsed && counts.adminTickets > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4">
        <div className="space-y-2">
          {!isCollapsed && <NotificationSettings />}
          <Button 
            onClick={onLogout} 
            variant="outline" 
            size={isCollapsed ? "icon" : "default"}
            className="w-full hover-scale transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({ user, session, onLogout, children }: AppLayoutProps) {
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground animate-fade-in">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          user={user}
          profile={profile}
          userRole={userRole}
          onLogout={handleLogout}
          counts={counts}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger className="hover-scale transition-transform" />
              <div className="flex-1" />
              {/* Header actions can be added here */}
            </div>
          </header>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}