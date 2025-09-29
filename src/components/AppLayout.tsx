import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppUser } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  BarChart3,
  Users,
  Database,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  Home,
  KeyRound,
  Wifi,
  Menu,
  BadgeDollarSign,
  Radio,
  FileText,
  FileStack,
  RadioTower,
} from 'lucide-react';
import { useUnreadTicketCount } from '@/hooks/useUnreadTicketCount';
import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';
import { NotificationSettings } from './NotificationSettings';
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
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AppLayoutProps {
  user: AppUser;
  onLogout: () => void;
  children: ReactNode;
}

interface AppSidebarProps {
  user: AppUser;
  userRole: string;
  onLogout: () => void;
  counts: {
    userTickets: number;
    adminTickets: number;
    unread: number;
    highPriority: number;
    total: number;
  };
}

function AppSidebar({ user, userRole, onLogout, counts }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const [adminSectionOpen, setAdminSectionOpen] = useState(true);
  const [servicesSectionOpen, setServicesSectionOpen] = useState(true);
  // Pull effective permissions (all modules) once; sidebar is lightweight
  const {
    permissions,
    loading: permLoading,
    canAccessModule,
    canRead,
  } = usePermissions();

  const isActive = (path: string) => location.pathname === path;
  const isAdminUser =
    userRole === 'super_admin' || userRole === 'internal_admin';
  const isDataProcessor = userRole === 'pengolah_data';
  const isCollapsed = state === 'collapsed';

  // Helper permission checks (fallback ke role lama jika permission belum loaded)
  const allowDataManagement =
    canAccessModule('data_management') || isAdminUser || isDataProcessor;
  const allowDataVisualization =
    canAccessModule('data_visualization') || isAdminUser || isDataProcessor;
  const allowSupport = canAccessModule('support') || true; // support accessible to all logged users
  const allowFAQ = canAccessModule('faq') || true;
  const allowUserManagement =
    isAdminUser && (canAccessModule('user_management') || true);
  const allowPermissionManagement =
    isAdminUser && (canAccessModule('permission_management') || true);
  const allowAdminFAQ =
    (isAdminUser || isDataProcessor) &&
    (canAccessModule('faq_management') || true);
  const allowTicketManagement =
    (isAdminUser || isDataProcessor) &&
    (canAccessModule('ticket_management') || true);
  // Services group only for specific roles
  const allowServices = isAdminUser || isDataProcessor;

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
                {user?.full_name || user?.email || 'User'}
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
                  tooltip={isCollapsed ? 'Beranda' : undefined}
                >
                  <Home className="h-4 w-4" />
                  {!isCollapsed && <span>Beranda</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {allowDataManagement && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/data-management')}
                    isActive={isActive('/data-management')}
                    className="hover-scale transition-all duration-200"
                    tooltip={isCollapsed ? 'Data Management' : undefined}
                  >
                    <Database className="h-4 w-4" />
                    {!isCollapsed && <span>Data Management</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {allowDataVisualization && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/data-visualization')}
                    isActive={isActive('/data-visualization')}
                    className="hover-scale transition-all duration-200"
                    tooltip={isCollapsed ? 'Data Visualization' : undefined}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!isCollapsed && <span>Data Visualization</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {allowFAQ && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/faq')}
                    isActive={isActive('/faq')}
                    className="hover-scale transition-all duration-200"
                    tooltip={isCollapsed ? 'FAQ' : undefined}
                  >
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && <span>FAQ</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {allowSupport && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/support')}
                    isActive={isActive('/support')}
                    className="hover-scale transition-all duration-200"
                    tooltip={isCollapsed ? 'Support' : undefined}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {!isCollapsed && (
                      <>
                        <span>Support</span>
                        {counts.userTickets > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs animate-pulse-glow"
                          >
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Services group */}
        {allowServices && (
          <>
            {isCollapsed && <SidebarSeparator />}
            <SidebarGroup>
              {!isCollapsed ? (
                <Collapsible
                  open={servicesSectionOpen}
                  onOpenChange={setServicesSectionOpen}
                >
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-sidebar-accent/50 rounded-md p-2 transition-colors">
                      Services
                      <ChevronDown className="h-4 w-4 transition-transform duration-500 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/jasa')}
                            isActive={isActive('/services/jasa')}
                            className="hover-scale transition-all duration-200"
                          >
                            <KeyRound className="h-4 w-4" />
                            <span>Jasa</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/jaringan')}
                            isActive={isActive('/services/jaringan')}
                            className="hover-scale transition-all duration-200"
                          >
                            <Wifi className="h-4 w-4" />
                            <span>Jaringan</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/penomoran')}
                            isActive={isActive('/services/penomoran')}
                            className="hover-scale transition-all duration-200"
                          >
                            <Menu className="h-4 w-4" />
                            <span>Penomoran</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/tarif')}
                            isActive={isActive('/services/tarif')}
                            className="hover-scale transition-all duration-200"
                          >
                            <BadgeDollarSign className="h-4 w-4" />
                            <span>Tarif</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/telsus')}
                            isActive={isActive('/services/telsus')}
                            className="hover-scale transition-all duration-200"
                          >
                            <Radio className="h-4 w-4" />
                            <span>Telsus</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/sklo')}
                            isActive={isActive('/services/sklo')}
                            className="hover-scale transition-all duration-200"
                          >
                            <FileText className="h-4 w-4" />
                            <span>SKLO</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/lko')}
                            isActive={isActive('/services/lko')}
                            className="hover-scale transition-all duration-200"
                          >
                            <FileStack className="h-4 w-4" />
                            <span>LKO</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/services/isr')}
                            isActive={isActive('/services/isr')}
                            className="hover-scale transition-all duration-200"
                          >
                            <RadioTower className="h-4 w-4" />
                            <span>ISR</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                // Collapsed state - show services items directly with tooltips
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/jasa')}
                        isActive={isActive('/services/jasa')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Jasa"
                      >
                        <KeyRound className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/jaringan')}
                        isActive={isActive('/services/jaringan')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Jaringan"
                      >
                        <Wifi className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/penomoran')}
                        isActive={isActive('/services/penomoran')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Penomoran"
                      >
                        <Menu className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/tarif')}
                        isActive={isActive('/services/tarif')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Tarif"
                      >
                        <BadgeDollarSign className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/telsus')}
                        isActive={isActive('/services/telsus')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Telsus"
                      >
                        <Radio className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/sklo')}
                        isActive={isActive('/services/sklo')}
                        className="hover-scale transition-all duration-200"
                        tooltip="SKLO"
                      >
                        <FileText className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/lko')}
                        isActive={isActive('/services/lko')}
                        className="hover-scale transition-all duration-200"
                        tooltip="LKO"
                      >
                        <FileStack className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/services/isr')}
                        isActive={isActive('/services/isr')}
                        className="hover-scale transition-all duration-200"
                        tooltip="ISR"
                      >
                        <RadioTower className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          </>
        )}

        {(isAdminUser || isDataProcessor) && (
          <>
            {isCollapsed && <SidebarSeparator />}
            <SidebarGroup>
              {!isCollapsed ? (
                <Collapsible
                  open={adminSectionOpen}
                  onOpenChange={setAdminSectionOpen}
                >
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-sidebar-accent/50 rounded-md p-2 transition-colors">
                      Administration
                      <ChevronDown className="h-4 w-4 transition-transform duration-500 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {allowUserManagement && (
                          <>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                onClick={() => navigate('/user-management')}
                                isActive={isActive('/user-management')}
                                className="hover-scale transition-all duration-200"
                              >
                                <Users className="h-4 w-4" />
                                <span>User Management</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>

                            {allowPermissionManagement && (
                              <SidebarMenuItem>
                                <SidebarMenuButton
                                  onClick={() =>
                                    navigate('/permission-management')
                                  }
                                  isActive={isActive('/permission-management')}
                                  className="hover-scale transition-all duration-200"
                                >
                                  <Settings className="h-4 w-4" />
                                  <span>Permission Management</span>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )}
                          </>
                        )}

                        {allowAdminFAQ && (
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => navigate('/admin/faq')}
                              isActive={isActive('/admin/faq')}
                              className="hover-scale transition-all duration-200"
                            >
                              <HelpCircle className="h-4 w-4" />
                              <span>FAQ Management</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}

                        {allowTicketManagement && (
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => navigate('/admin/tickets')}
                              isActive={isActive('/admin/tickets')}
                              className="hover-scale transition-all duration-200"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <>
                                <span>Ticket Management</span>
                                {counts.adminTickets > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto text-xs animate-pulse-glow"
                                  >
                                    {counts.adminTickets}
                                  </Badge>
                                )}
                              </>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                // Collapsed state - show admin menu items directly with tooltips
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isAdminUser && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/user-management')}
                            isActive={isActive('/user-management')}
                            className="hover-scale transition-all duration-200"
                            tooltip="User Management"
                          >
                            <Users className="h-4 w-4" />
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate('/permission-management')}
                            isActive={isActive('/permission-management')}
                            className="hover-scale transition-all duration-200"
                            tooltip="Permission Management"
                          >
                            <Settings className="h-4 w-4" />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/admin/faq')}
                        isActive={isActive('/admin/faq')}
                        className="hover-scale transition-all duration-200"
                        tooltip="FAQ Management"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/admin/tickets')}
                        isActive={isActive('/admin/tickets')}
                        className="hover-scale transition-all duration-200"
                        tooltip="Ticket Management"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {counts.adminTickets > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4">
        <div className="space-y-2">
          {!isCollapsed && <NotificationSettings />}
          {isCollapsed ? (
            <SidebarMenuButton
              onClick={onLogout}
              className="w-full hover-scale transition-all duration-200 border border-sidebar-border hover:bg-sidebar-accent"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4" />
            </SidebarMenuButton>
          ) : (
            <Button
              onClick={onLogout}
              variant="outline"
              size="default"
              className="w-full hover-scale transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({
  user,
  onLogout,
  children,
}: AppLayoutProps) {
  const [userRole] = useState<string>(user?.roles?.[0] || 'guest');
  const { counts } = useUnreadTicketCount();
  useRealtimeTickets();
  const handleLogout = () => onLogout();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          user={user}
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
          <div className="flex-1 overflow-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
