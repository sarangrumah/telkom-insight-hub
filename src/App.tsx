import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./components/DashboardPage";
import DataManagement from "./pages/DataManagement";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import AdminFAQ from "./pages/AdminFAQ";
import AdminTickets from "./pages/AdminTickets";
import NotFound from "./pages/NotFound";
import Homepage from "./pages/Homepage";
import PublicRegister from "./pages/PublicRegister";
import SearchResults from "./pages/SearchResults";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";

const queryClient = new QueryClient();

const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Homepage />} />
    <Route path="/register" element={<PublicRegister />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/support" element={<Support />} />
    <Route path="/auth" element={<AuthPage onAuthSuccess={() => window.location.href = "/dashboard"} />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AuthenticatedRoutes = () => {
  const { user, session } = useAuth();

  return (
    <AppLayout user={user!} session={session!} onLogout={() => window.location.href = "/"}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/admin/faq" element={<AdminFAQ />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const AppRoutes = () => {
  const { user, session, loading } = useAuth();

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

  // Check if user is trying to access authenticated routes
  const isAuthenticatedRoute = window.location.pathname.startsWith('/dashboard') || 
                              window.location.pathname.startsWith('/data-management') ||
                              window.location.pathname.startsWith('/admin');

  if (isAuthenticatedRoute && (!user || !session)) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} />;
  }

  if (user && session && isAuthenticatedRoute) {
    return <AuthenticatedRoutes />;
  }

  return <PublicRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
