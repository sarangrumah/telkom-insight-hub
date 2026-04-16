import EnhancedDashboard from '@/components/EnhancedDashboard';
import { AppUser } from '@/hooks/useAuth';

interface DashboardProps {
  user: AppUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return <EnhancedDashboard user={user} onLogout={onLogout} />;
}
