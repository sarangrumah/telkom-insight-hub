import * as React from 'react';
import { RefreshCw, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Panel — Kabupaten CAPTCHA (ported from e-telekomunikasi-js)
// Server endpoints:
//   GET  /v2/panel/api/auth/captcha         → { token, challenge }
//   POST /v2/panel/api/auth/captcha/verify  → { valid }
// =============================================================================

interface IndonesianCaptchaProps {
  onVerified: (verified: boolean, token?: string) => void;
  verified: boolean;
}

const CAPTCHA_BASE = '/v2/panel/api/auth/captcha';

export function IndonesianCaptcha({ onVerified, verified }: IndonesianCaptchaProps) {
  const [challenge, setChallenge] = React.useState('');
  const [token, setToken] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);

  const fetchChallenge = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnswer('');
    onVerified(false);
    try {
      const res = await fetch(CAPTCHA_BASE, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setChallenge(data.data.challenge);
        setToken(data.data.token);
      } else {
        setError('Gagal memuat CAPTCHA. Silakan coba lagi.');
      }
    } catch {
      setError('Gagal memuat CAPTCHA. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  }, [onVerified]);

  React.useEffect(() => {
    void fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify() {
    const normalized = answer.trim();
    if (!normalized) {
      setError('Jawaban wajib diisi.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${CAPTCHA_BASE}/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answer: normalized }),
      });
      const data = await res.json();

      if (data.valid) {
        setError(null);
        onVerified(true, token);
      } else if (data.expired) {
        setError('CAPTCHA kedaluwarsa. Memuat ulang...');
        onVerified(false);
        setTimeout(() => void fetchChallenge(), 1000);
      } else {
        setError('Teks yang Anda ketik tidak sesuai. Silakan coba lagi.');
        onVerified(false);
      }
    } catch {
      setError('Gagal memverifikasi. Silakan coba lagi.');
    } finally {
      setVerifying(false);
    }
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800/60 dark:bg-green-900/20">
        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Verifikasi CAPTCHA berhasil
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold">Verifikasi Keamanan</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Ketik ulang nama daerah berikut untuk verifikasi keamanan:
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchChallenge()}
          disabled={loading}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-label="Ganti teks CAPTCHA"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-md border bg-background px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          className="select-none rounded-md border bg-background px-4 py-3 text-center text-lg font-bold tracking-widest text-foreground"
          aria-hidden="true"
        >
          {challenge}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="captcha-answer" className="sr-only">
            Ketik ulang teks CAPTCHA
          </Label>
          <Input
            id="captcha-answer"
            type="text"
            placeholder="Ketik ulang teks di atas..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleVerify();
              }
            }}
            className={cn(error && 'border-destructive')}
            autoComplete="off"
            disabled={loading || verifying}
          />
        </div>
        <Button
          type="button"
          onClick={() => void handleVerify()}
          disabled={loading || verifying || !answer.trim()}
        >
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verifikasi'}
        </Button>
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
