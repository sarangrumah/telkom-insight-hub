import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { useMonitoring } from '@/hooks/useMonitoring';
import DashboardPage from './components/DashboardPage';
import DataManagement from './pages/DataManagement';
import DataVisualization from './pages/DataVisualization';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import AdminFAQ from './pages/AdminFAQ';
import AdminTickets from './pages/AdminTickets';
import UserManagement from './pages/UserManagement';
import PermissionManagement from './pages/PermissionManagement';
import NotFound from './pages/NotFound';
import Homepage from './pages/Homepage';
import PublicRegister from './pages/PublicRegister';
import SearchResults from './pages/SearchResults';
import PublicDataView from './pages/PublicDataView';
import TelekomDataDetail from './pages/TelekomDataDetail';
import CompanyProfileCompletionForm from './components/CompanyProfileCompletionForm';
import EnhancedRegistrationForm from './components/EnhancedRegistrationForm';
import Jasa from './pages/services/Jasa';
import Jaringan from './pages/services/Jaringan';
import Penomoran from './pages/services/Penomoran';
import Tarif from './pages/services/Tarif';
import Telsus from './pages/services/Telsus';
import SKLO from './pages/services/SKLO';
import ISR from './pages/services/ISR';
import LKO from './pages/services/LKO';
import AppLayout from './components/AppLayout';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './hooks/AuthProvider';
import AuthPage from './components/AuthPage';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { user, loading, sessionExpired, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingScreen />;
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-destructive text-lg">Session Expired</div>
          <p className="text-muted-foreground">
            Your session has expired. Please log in again to continue.
          </p>
          <Navigate to="/auth" replace />
        </div>
      </div>
    );
  }

  const ProtectedLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/auth" replace />;
    return (
      <AppLayout
        user={user}
        onLogout={() => {
          logout();
          navigate('/');
        }}
      >
        {children}
      </AppLayout>
    );
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/public-data" element={<PublicDataView />} />
      <Route path="/public-register" element={<PublicRegister />} />
      <Route path="/complete-registration" element={<CompanyProfileCompletionForm />} />
      <Route
        path="/register"
        element={<Navigate to="/public-register" replace />}
      />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/detail/:id" element={<TelekomDataDetail />} />
      <Route path="/public/faq" element={<FAQ />} />
      <Route
        path="/auth"
        element={<AuthPage onAuthSuccess={() => navigate('/dashboard')} />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/data-management"
        element={
          <ProtectedLayout>
            <DataManagement />
          </ProtectedLayout>
        }
      />
      <Route
        path="/data-visualization"
        element={
          <ProtectedLayout>
            <DataVisualization />
          </ProtectedLayout>
        }
      />

      <Route
        path="/services/jasa"
        element={
          <ProtectedLayout>
            <Jasa />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/jaringan"
        element={
          <ProtectedLayout>
            <Jaringan />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/penomoran"
        element={
          <ProtectedLayout>
            <Penomoran />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/tarif"
        element={
          <ProtectedLayout>
            <Tarif />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/telsus"
        element={
          <ProtectedLayout>
            <Telsus />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/sklo"
        element={
          <ProtectedLayout>
            <SKLO />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/isr"
        element={
          <ProtectedLayout>
            <ISR />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/lko"
        element={
          <ProtectedLayout>
            <LKO />
          </ProtectedLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <ProtectedLayout>
            <FAQ />
          </ProtectedLayout>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedLayout>
            <Support />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/faq"
        element={
          <ProtectedLayout>
            <AdminFAQ />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedLayout>
            <AdminTickets />
          </ProtectedLayout>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedLayout>
            <UserManagement />
          </ProtectedLayout>
        }
      />
      <Route
        path="/permission-management"
        element={
          <ProtectedLayout>
            <PermissionManagement />
          </ProtectedLayout>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppWithMonitoring: React.FC = () => {
  useMonitoring();
  return (
    <BrowserRouter basename="/panel">
      <AppRoutes />
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        <AppWithMonitoring />
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
