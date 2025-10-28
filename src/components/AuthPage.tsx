import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEmailAvailability } from '@/hooks/useEmailAvailability';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // will sync with authActionError
  const { toast } = useToast();
  const { login, register, user, authActionError, clearAuthActionError } =
    useAuth();
  const navigate = useNavigate();
  // If already logged in, prevent accessing auth page
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
  });
  // Bersihkan error saat user mengganti input
  useEffect(() => {
    if (error || authActionError) {
      // Delay kecil agar tidak flicker jika error baru saja muncul
      const t = setTimeout(() => {
        setError(null);
        clearAuthActionError();
      }, 2000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loginForm.email,
    loginForm.password,
    signupForm.email,
    signupForm.password,
    signupForm.fullName,
  ]);
  // Centralized email availability (debounced, abortable) hook
  const {
    checking: checkingEmail,
    available: emailAvailable,
    error: emailAvailabilityError,
  } = useEmailAvailability(signupForm.email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(loginForm.email, loginForm.password);
      // Hanya tampilkan toast sukses jika benar-benar tidak throw error
      toast({
        title: 'Login successful',
        description: 'Welcome to Telkom Insight Hub',
      });
      onAuthSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(
        signupForm.email,
        signupForm.password,
        signupForm.fullName,
        signupForm.companyName,
        signupForm.phone
      );
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
      // Auto-login to limited dashboard
      onAuthSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      // Tidak tampilkan toast sukses; bisa tampilkan toast error opsional
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Telkom Insight Hub
          </CardTitle>
          <CardDescription>
            Access telecommunications data and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2"
              onClick={() => {
                setError(null);
                clearAuthActionError();
              }}
            >
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {(error || authActionError) && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error || authActionError}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={e =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={e =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    value={signupForm.fullName}
                    onChange={e =>
                      setSignupForm({ ...signupForm, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={e =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    required
                  />
                  {checkingEmail && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Checking
                      availability...
                    </p>
                  )}
                  {!checkingEmail &&
                    emailAvailable === true &&
                    !emailAvailabilityError && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Email is available
                      </p>
                    )}
                  {!checkingEmail &&
                    emailAvailable === false &&
                    !emailAvailabilityError && (
                      <p className="text-xs text-destructive mt-1">
                        Email already registered
                      </p>
                    )}
                  {emailAvailabilityError && (
                    <p className="text-xs text-amber-600 mt-1">
                      Cannot verify email right now: {emailAvailabilityError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={e =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-company">Company Name</Label>
                  <Input
                    id="signup-company"
                    type="text"
                    value={signupForm.companyName}
                    onChange={e =>
                      setSignupForm({
                        ...signupForm,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={signupForm.phone}
                    onChange={e =>
                      setSignupForm({ ...signupForm, phone: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
