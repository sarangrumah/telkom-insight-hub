export type PelaporanStatus = 'Sudah Melaporkan' | 'Belum Melaporkan';

export interface RawTarifItem {
  jenis_izin?: string | null;
  title?: string | null; // "Belum Melaporkan" / "Sudah Melaporkan"
  color?: string | null;
  title_jenis?: string | null; // e.g. "Bulanan ISP"
  penyelenggara?: string | null;
  pic?: string | null;
  email?: string | null; // sometimes "0"
  status_email?: string | null; // "sudah update" / "belum update"
  id_user?: string | null;
  app_name?: string | null; // e.g. ISP
  id_jenis_izin?: string | null;
  id_izin?: string | null;
  id_jenis_report?: string | null;
  jenis_periode?: string | null; // e.g. Bulanan
  jenis?: string | null; // e.g. Jasa / Jaringan
  tanggal?: string | null; // may be null
  filename?: string | null;
  status?: string | null; // sometimes "Belum"
}

export interface TarifRow {
  id: number;
  penyelenggara: string;
  nib?: string; // not available in JSON, kept for UI compatibility
  pic: string;
  email: string;
  statusEmail: string;
  tanggal: string | null;
  jenis: string;
  sub: string;
  periode: string;
  status: PelaporanStatus;
}

let cache: TarifRow[] | null = null;

function toStatus(raw: RawTarifItem): PelaporanStatus {
  const t = (raw.title || '').toLowerCase().trim();
  const s = (raw.status || '').toLowerCase().trim();
  if (t.includes('belum') || s === 'belum') return 'Belum Melaporkan';
  return 'Sudah Melaporkan';
}

function sanitizeEmail(email?: string | null) {
  if (!email || email === '0') return '-';
  return email;
}

export function mapRawToRow(items: RawTarifItem[]): TarifRow[] {
  return items.map((it, idx) => ({
    id: idx + 1,
    penyelenggara: it.penyelenggara || '-',
    nib: undefined, // sumber JSON tidak menyediakan NIB
    pic: it.pic || '-',
    email: sanitizeEmail(it.email),
    statusEmail: (it.status_email || '').toLowerCase() || '-',
    tanggal: it.tanggal || null,
    jenis: it.jenis || '-',
    sub: it.title_jenis || it.app_name || '-',
    periode: it.jenis_periode || '-',
    status: toStatus(it),
  }));
}

/**
 * Ambil data tarif dari JSON statis (public/data-tarif.json) dan cache di memori.
 * Penempatan file di public dipertahankan agar dapat di-fetch langsung oleh client (best-practice Vite),
 * sementara abstraksi akses datanya dipusatkan di layer lib ini sesuai arsitektur proyek.
 */
export async function getTarifRows(): Promise<TarifRow[]> {
  if (cache) return cache;
  const res = await fetch('/data-tarif.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Gagal memuat data tarif: ${res.status}`);
  const json = await res.json();
  const rows = mapRawToRow((json?.data || []) as RawTarifItem[]);
  cache = rows;
  return rows;
}