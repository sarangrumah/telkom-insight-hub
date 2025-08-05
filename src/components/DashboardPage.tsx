import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";

const DashboardPage = () => {
  const { user, session } = useAuth();
  
  return <Dashboard user={user!} session={session!} onLogout={() => window.location.reload()} />;
};

export default DashboardPage;