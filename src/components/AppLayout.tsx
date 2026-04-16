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
  Plug,
  Signal,
  ClipboardList,
  LifeBuoy,
  type LucideIcon,
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

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  badgePulse?: boolean;
}

interface MenuGroup {
  label: string;
  collapsible?: boolean;
  items: MenuItem[];
}

function AppSidebar({ user, userRole, onLogout, counts }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const {
    canAccessModule,
  } = usePermissions();

  const isActive = (path: string) => location.pathname === path;
  const isAdminUser =
    userRole === 'super_admin' || userRole === 'internal_admin';
  const isDataProcessor = userRole === 'pengolah_data';
  const isPelakuUsaha = userRole === 'pelaku_usaha';
  const isCollapsed = state === 'collapsed';

  // Permission checks
  const allowDataManagement =
    canAccessModule('data_management') || isAdminUser || isDataProcessor;
  const allowDataVisualization =
    canAccessModule('data_visualization') || isAdminUser || isDataProcessor || isPelakuUsaha;
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
  const allowServices = isAdminUser || isDataProcessor || isPelakuUsaha;
  const allowBPSConfig = isAdminUser || isDataProcessor;
  const allowBPSData = isAdminUser || isDataProcessor || isPelakuUsaha;
  const allowAnalisis = isAdminUser || isDataProcessor;

  // --- Build menu groups based on role ---
  const menuGroups: MenuGroup[] = [];

  // 1. Utama
  const utamaItems: MenuItem[] = [
    { label: 'Beranda', path: '/dashboard', icon: Home },
  ];
  if (allowDataManagement) {
    utamaItems.push({ label: 'Data Management', path: '/data-management', icon: Database });
  }
  if (allowDataVisualization) {
    utamaItems.push({ label: 'Data Visualization', path: '/data-visualization', icon: BarChart3 });
  }
  menuGroups.push({ label: 'Utama', items: utamaItems });

  // 2. Layanan
  if (allowServices) {
    menuGroups.push({
      label: 'Layanan',
      collapsible: true,
      items: [
        { label: 'Jasa', path: '/services/jasa', icon: KeyRound },
        { label: 'Jaringan', path: '/services/jaringan', icon: Wifi },
        { label: 'Penomoran', path: '/services/penomoran', icon: Menu },
        { label: 'Tarif', path: '/services/tarif', icon: BadgeDollarSign },
        { label: 'Telsus', path: '/services/telsus', icon: Radio },
        { label: 'SKLO', path: '/services/sklo', icon: FileText },
        { label: 'LKO', path: '/services/lko', icon: FileStack },
        { label: 'ISR', path: '/services/isr', icon: RadioTower },
      ],
    });
  }

  // 3. Data & Statistik
  if (allowBPSConfig || allowBPSData) {
    const dataItems: MenuItem[] = [];
    if (allowBPSConfig) {
      dataItems.push({ label: 'BPS Configuration', path: '/bps-configuration', icon: Settings });
    }
    if (allowBPSData) {
      dataItems.push({ label: 'BPS Data', path: '/bps-data', icon: BarChart3 });
    }
    if (allowBPSConfig) {
      dataItems.push({ label: 'BPS Survey', path: '/bps-surveys', icon: ClipboardList });
    }
    if (dataItems.length > 0) {
      menuGroups.push({
        label: 'Data & Statistik',
        collapsible: true,
        items: dataItems,
      });
    }
  }

  // 4. Analisis (admin & pengolah_data only)
  if (allowAnalisis) {
    menuGroups.push({
      label: 'Analisis',
      collapsible: true,
      items: [
        { label: 'Integrations', path: '/integrations', icon: Plug },
        { label: 'Telecom Potential', path: '/telecom-potential', icon: Signal },
      ],
    });
  }

  // 5. Administrasi (admin & pengolah_data only)
  const adminItems: MenuItem[] = [];
  if (allowUserManagement) {
    adminItems.push({ label: 'User Management', path: '/user-management', icon: Users });
  }
  if (allowPermissionManagement) {
    adminItems.push({ label: 'Permission Management', path: '/permission-management', icon: Settings });
  }
  if (allowAdminFAQ) {
    adminItems.push({ label: 'FAQ Management', path: '/admin/faq', icon: HelpCircle });
  }
  if (allowTicketManagement) {
    adminItems.push({
      label: 'Ticket Management',
      path: '/admin/tickets',
      icon: MessageSquare,
      badge: counts.adminTickets > 0 ? counts.adminTickets : undefined,
      badgePulse: true,
    });
  }
  if (adminItems.length > 0) {
    menuGroups.push({
      label: 'Administrasi',
      collapsible: true,
      items: adminItems,
    });
  }

  // 6. Bantuan
  menuGroups.push({
    label: 'Bantuan',
    items: [
      { label: 'FAQ', path: '/faq', icon: HelpCircle },
      {
        label: 'Support',
        path: '/support',
        icon: LifeBuoy,
        badge: counts.userTickets > 0 ? counts.userTickets : undefined,
        badgePulse: true,
      },
    ],
  });

  // --- Collapsible state for each group ---
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    menuGroups.forEach((g) => {
      if (g.collapsible) init[g.label] = true;
    });
    return init;
  });

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  // --- Render helpers ---
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          onClick={() => navigate(item.path)}
          isActive={isActive(item.path)}
          className="hover-scale transition-all duration-200"
          tooltip={isCollapsed ? item.label : undefined}
        >
          <Icon className="h-4 w-4" />
          {!isCollapsed && (
            <>
              <span>{item.label}</span>
              {item.badge != null && (
                <Badge
                  variant="destructive"
                  className={`ml-auto text-xs ${item.badgePulse ? 'animate-pulse-glow' : ''}`}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
          {isCollapsed && item.badge != null && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (group: MenuGroup, idx: number) => {
    const isFirst = idx === 0;

    if (group.collapsible && !isCollapsed) {
      return (
        <SidebarGroup key={group.label}>
          <Collapsible
            open={openSections[group.label] ?? true}
            onOpenChange={() => toggleSection(group.label)}
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group flex w-full items-center justify-between hover:bg-sidebar-accent/50 rounded-md p-2 transition-colors">
                {group.label}
                <ChevronDown className="h-4 w-4 transition-transform duration-500 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      );
    }

    // Non-collapsible or collapsed sidebar
    return (
      <SidebarGroup key={group.label}>
        {!isFirst && isCollapsed && <SidebarSeparator />}
        {!isCollapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

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
        {menuGroups.map((group, idx) => renderGroup(group, idx))}
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
