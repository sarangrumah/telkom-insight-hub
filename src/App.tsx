import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { useMonitoring } from "@/hooks/useMonitoring";
import DashboardPage from "./components/DashboardPage";
import DataManagement from "./pages/DataManagement";
import DataVisualization from "./pages/DataVisualization";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import AdminFAQ from "./pages/AdminFAQ";
import AdminTickets from "./pages/AdminTickets";
import UserManagement from "./pages/UserManagement";
import PermissionManagement from "./pages/PermissionManagement";
import CompanyManagement from "./pages/CompanyManagement";
import NotFound from "./pages/NotFound";
import Homepage from "./pages/Homepage";
import PublicRegister from "./pages/PublicRegister";
import SearchResults from "./pages/SearchResults";
import PublicDataView from "./pages/PublicDataView";
import ServiceDetail from "./pages/ServiceDetail";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";

const queryClient = new QueryClient();

const PublicRoutes = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/public-data" element={<PublicDataView />} />
      <Route path="/public-register" element={<PublicRegister />} />
      <Route path="/register" element={<Navigate to="/public-register" replace />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/support" element={<Support />} />
      <Route path="/service/:serviceName" element={<ServiceDetail />} />
      <Route path="/auth" element={<AuthPage onAuthSuccess={() => navigate("/dashboard")} />} />
      {/* Redirect expired session attempts to dashboard to auth */}
      <Route path="/dashboard" element={<Navigate to="/auth" replace />} />
      <Route path="/data-management" element={<Navigate to="/auth" replace />} />
      <Route path="/data-visualization" element={<Navigate to="/auth" replace />} />
      <Route path="/admin/*" element={<Navigate to="/auth" replace />} />
      <Route path="/user-management" element={<Navigate to="/auth" replace />} />
      <Route path="/permission-management" element={<Navigate to="/auth" replace />} />
      <Route path="/company-management" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AuthenticatedRoutes: React.FC<{ user: any; session: any }> = ({ user, session }) => {
  const navigate = useNavigate();
  
  return (
    <AppLayout user={user} session={session} onLogout={() => navigate("/")}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/data-visualization" element={<DataVisualization />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/admin/faq" element={<AdminFAQ />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/permission-management" element={<PermissionManagement />} />
        <Route path="/company-management" element={<CompanyManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const AppRoutes: React.FC = () => {
  const { user, session, loading, sessionError } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle session errors with user-friendly message
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-destructive text-lg">Session Expired</div>
          <p className="text-muted-foreground">Your session has expired. Please log in again to continue.</p>
          <Navigate to="/auth" replace />
        </div>
      </div>
    );
  }

  // Check if user is trying to access authenticated routes
  const isAuthenticatedRoute = window.location.pathname.startsWith('/dashboard') || 
                              window.location.pathname.startsWith('/data-management') ||
                              window.location.pathname.startsWith('/data-visualization') ||
                               window.location.pathname.startsWith('/admin') ||
                               window.location.pathname.startsWith('/user-management') ||
                               window.location.pathname.startsWith('/permission-management') ||
                               window.location.pathname.startsWith('/company-management');

  // If trying to access authenticated routes without proper session, redirect to auth
  if (isAuthenticatedRoute && (!user || !session)) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated and accessing authenticated routes, show authenticated routes
  if (user && session && isAuthenticatedRoute) {
    return <AuthenticatedRoutes user={user} session={session} />;
  }

  // Default to public routes for all other cases
  return <PublicRoutes />;
};

const AppWithMonitoring: React.FC = () => {
  useMonitoring();
  
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityHeaders />
      <Toaster />
      <Sonner />
      <AppWithMonitoring />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
