import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  const { user, session, loading, sessionError } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return <Navigate to="/auth" replace />;
  }

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Dashboard user={user} session={session} onLogout={() => {
    // This will be handled by AppLayout
  }} />;
};

export default DashboardPage;