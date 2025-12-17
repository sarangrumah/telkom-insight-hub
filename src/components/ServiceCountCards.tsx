import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import {
  Settings,
  Wifi,
  Phone,
  DollarSign,
  Antenna,
  ClipboardCheck,
  FileText,
  Radio,
} from 'lucide-react';

type ServiceCode =
  | 'jasa'
  | 'jaringan'
  | 'penomoran'
  | 'tarif'
  | 'telsus'
  | 'sklo'
  | 'lko'
  | 'isr';

interface ServiceCountItem {
  code: ServiceCode;
  name: string; // From DB (unused for label, kept for debugging)
  count: number;
}

interface ServiceCountsResponse {
  counts: ServiceCountItem[];
}

const iconByCode: Record<ServiceCode, React.ComponentType<{ className?: string }>> = {
  jasa: Settings,
  jaringan: Wifi,
  penomoran: Phone,
  tarif: DollarSign,
  telsus: Antenna,
  sklo: ClipboardCheck,
  lko: FileText,
  isr: Radio,
};

const labelByCode: Record<ServiceCode, string> = {
  jasa: 'Jasa',
  jaringan: 'Jaringan',
  penomoran: 'Penomoran',
  tarif: 'Tarif',
  telsus: 'Telsus',
  sklo: 'SKLO',
  lko: 'LKO',
  isr: 'ISR',
};

const colorByCode: Record<ServiceCode, { from: string; to: string; ring: string; text: string }> = {
  jasa: { from: 'from-violet-500/15', to: 'to-indigo-500/10', ring: 'ring-violet-400/40', text: 'text-violet-700 dark:text-violet-300' },
  jaringan: { from: 'from-amber-500/20', to: 'to-orange-500/10', ring: 'ring-amber-400/40', text: 'text-amber-700 dark:text-amber-300' },
  penomoran: { from: 'from-rose-500/20', to: 'to-pink-500/10', ring: 'ring-rose-400/40', text: 'text-rose-700 dark:text-rose-300' },
  tarif: { from: 'from-sky-500/20', to: 'to-blue-500/10', ring: 'ring-sky-400/40', text: 'text-sky-700 dark:text-sky-300' },
  telsus: { from: 'from-emerald-500/20', to: 'to-green-500/10', ring: 'ring-emerald-400/40', text: 'text-emerald-700 dark:text-emerald-300' },
  sklo: { from: 'from-fuchsia-500/20', to: 'to-rose-500/10', ring: 'ring-fuchsia-400/40', text: 'text-fuchsia-700 dark:text-fuchsia-300' },
  lko: { from: 'from-slate-500/20', to: 'to-zinc-500/10', ring: 'ring-slate-400/40', text: 'text-slate-700 dark:text-slate-300' },
  isr: { from: 'from-orange-500/20', to: 'to-amber-500/10', ring: 'ring-orange-400/40', text: 'text-orange-700 dark:text-orange-300' },
};

export function ServiceCountCards() {
  const [counts, setCounts] = useState<ServiceCountItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = (await apiFetch('/panel/api/stats/service-counts')) as ServiceCountsResponse;
        if (mounted) setCounts(res.counts || []);
      } catch (e) {
        console.error('Failed to fetch service counts', e);
        if (mounted) setCounts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Skeletons for loading state in fixed order
  const order: ServiceCode[] = [
    'jasa',
    'jaringan',
    'penomoran',
    'tarif',
    'telsus',
    'sklo',
    'lko',
    'isr',
  ];

  const items: ServiceCountItem[] = loading
    ? order.map(code => ({ code, name: code.toUpperCase(), count: 0 }))
    : (counts || []).filter(c => order.includes(c.code)).sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map(({ code, name, count }) => {
        const Icon = iconByCode[code];
        const palette = colorByCode[code];
        return (
          <Card
            key={code}
            className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br ${palette.from} ${palette.to} min-h-[112px]`}
          >
            <div className={`absolute inset-0 pointer-events-none rounded-xl ring-1 ${palette.ring}`}></div>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2 min-w-0">
                {/* Label di atas, bold, rapi */}
                <div
                  className="font-semibold text-sm text-foreground/90 truncate"
                  title={labelByCode[code] || name}
                >
                  {labelByCode[code] || name}
                </div>

                {/* Baris ikon dan angka sejajar */}
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur flex items-center justify-center shadow ring-1 ring-black/5`}>
                    <Icon className={`h-6 w-6 ${palette.text}`} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className={`text-3xl font-semibold leading-none tracking-tight tabular-nums ${palette.text}`}>
                      {loading ? (
                        <span className="inline-block h-7 w-20 rounded bg-black/10 dark:bg-white/10 animate-pulse"></span>
                      ) : (
                        count.toLocaleString()
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">/ data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ServiceCountCards;
