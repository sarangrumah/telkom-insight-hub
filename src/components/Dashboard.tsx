import EnhancedDashboard from "@/components/EnhancedDashboard";
import { User, Session } from "@supabase/supabase-js";

interface DashboardProps {
  user: User;
  session: Session;
  onLogout: () => void;
}

export default function Dashboard({ user, session, onLogout }: DashboardProps) {
  return <EnhancedDashboard user={user} session={session} onLogout={onLogout} />;
}