import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Panel — Reusable PII Masked Field with Eye Toggle
// Ported from e-telekomunikasi-js. Used across admin dialogs, queues, and
// dashboards to hide sensitive data by default.
// =============================================================================

interface MaskedFieldProps {
  value: string | null | undefined;
  maskFn?: (value: string) => string;
  className?: string;
  label?: string;
  display?: 'inline' | 'block';
  /** If true, does not render the eye toggle — display-only masking. */
  staticMask?: boolean;
}

function defaultMask(value: string): string {
  if (!value) return '—';
  if (value.length <= 8) return '****' + value.slice(-4);
  return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
}

/** Mask email: show first 3 chars + ***@domain */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return defaultMask(email);
  const visible = local.slice(0, 3);
  return `${visible}${'*'.repeat(Math.max(local.length - 3, 3))}@${domain}`;
}

/** Mask phone: show last 4 digits */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  if (phone.length <= 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

/** Mask NPWP: show first 4 + **** + last 4 */
export function maskNpwp(npwp: string | null | undefined): string {
  if (!npwp) return '—';
  return defaultMask(npwp);
}

/** Mask KTP / identity number */
export function maskIdentitas(no: string | null | undefined): string {
  if (!no) return '—';
  return defaultMask(no);
}

/** Generic first-4 + last-4 masking. */
export function maskPii(value: string | null | undefined): string {
  if (!value) return '—';
  return defaultMask(value);
}

export function MaskedField({
  value,
  maskFn = defaultMask,
  className,
  label,
  display = 'inline',
  staticMask = false,
}: MaskedFieldProps) {
  const [revealed, setRevealed] = React.useState(false);

  if (!value) return <span className="text-muted-foreground">—</span>;

  const displayValue = revealed ? value : maskFn(value);

  if (staticMask) {
    return <span className={cn('font-mono text-sm', className)}>{maskFn(value)}</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        display === 'block' && 'flex',
        className,
      )}
    >
      <span className="font-mono text-sm">{displayValue}</span>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={revealed ? `Sembunyikan ${label ?? 'data'}` : `Tampilkan ${label ?? 'data'}`}
        title={revealed ? 'Sembunyikan' : 'Tampilkan'}
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
