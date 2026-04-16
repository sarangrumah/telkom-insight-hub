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
import { Loader2, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEmailAvailability } from '@/hooks/useEmailAvailability';
import EnhancedRegistrationForm from '@/components/EnhancedRegistrationForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // will sync with authActionError
  const { toast } = useToast();
  const { login, register, user, authActionError, clearAuthActionError, refreshProfile } =
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

  const [etelkomForm, setEtelkomForm] = useState({
    email: '',
    password: '',
  });

  const [etelkomLoading, setEtelkomLoading] = useState(false);

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

  const handleEtelkomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEtelkomLoading(true);
    setError(null);
    try {
      const resp = await fetch('/v2/panel/api/auth/login-etelekomunikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: etelkomForm.email,
          password: etelkomForm.password,
        }),
      });

      if (!resp.ok) {
        let message = 'Login e-Telekomunikasi gagal';
        try {
          const errJson = await resp.json();
          if (errJson?.error) message = errJson.error;
        } catch { /* ignore */ }
        throw new Error(message);
      }

      const data = await resp.json();
      localStorage.setItem('app.jwt.token', data.token);
      // Reload auth context so useAuth.user is set and redirect triggers
      await refreshProfile();
      toast({
        title: 'Login berhasil',
        description: `Selamat datang, ${data.user.full_name || data.user.email}`,
      });
      onAuthSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      setError(message);
      toast({
        title: 'Login gagal',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setEtelkomLoading(false);
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
              className="grid w-full grid-cols-3"
              onClick={() => {
                setError(null);
                clearAuthActionError();
              }}
            >
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="etelkom">e-Telkom</TabsTrigger>
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

            <TabsContent value="etelkom" className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-2">
                <Globe className="inline-block h-4 w-4 mr-1" />
                Login menggunakan akun e-Telekomunikasi yang sudah terdaftar
              </div>
              <Separator />
              <form onSubmit={handleEtelkomLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="etelkom-email">Email e-Telekomunikasi</Label>
                  <Input
                    id="etelkom-email"
                    type="email"
                    placeholder="email@perusahaan.co.id"
                    value={etelkomForm.email}
                    onChange={e =>
                      setEtelkomForm({ ...etelkomForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etelkom-password">Password</Label>
                  <Input
                    id="etelkom-password"
                    type="password"
                    value={etelkomForm.password}
                    onChange={e =>
                      setEtelkomForm({ ...etelkomForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={etelkomLoading}>
                  {etelkomLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login dengan e-Telekomunikasi
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Gunakan akun yang terdaftar di e-telekomunikasi.komdigi.go.id
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <EnhancedRegistrationForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
