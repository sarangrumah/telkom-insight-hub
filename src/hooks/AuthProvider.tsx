import { ReactNode } from 'react';
import { AuthProvider as Provider } from './useAuth';

// Simple re-export component to help React Fast Refresh treat context provider as a component file
export function AuthProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
