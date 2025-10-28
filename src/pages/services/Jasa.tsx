import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, RotateCcw } from 'lucide-react';

type JasaStatus = 'Permohonan Baru' | 'Disetujui' | 'Ditolak' | 'Diproses';

interface JasaRecord {
  id: number;
  penyelenggara: string;
  nib: string; // nomor identitas di bawah nama
  layanan: string; // teks lengkap (dengan bagian dalam tanda kurung)
  nomorIzin: string;
  tanggalPengajuan: string;
  tanggalSubmit: string;
  tanggalBerlaku: string;
  kbli: string;
  status: JasaStatus;
}

const DUMMY_DATA: JasaRecord[] = [
  {
    id: 1,
    penyelenggara: 'BCTech',
    nib: '987654321',
    layanan: 'Penyelenggaraan Jasa Pusat Panggilan Informasi (Call Center)',
    nomorIzin: '3463',
    tanggalPengajuan: '22 November 2024',
    tanggalSubmit: '22 November 2024',
    tanggalBerlaku: '21 November 2024',
    kbli: 'Aktivitas Call Centre',
    status: 'Permohonan Baru',
  },
  {
    id: 2,
    penyelenggara: 'BCTech',
    nib: '987654321',
    layanan: 'Penyelenggaraan Jasa Sistem Komunikasi Data',
    nomorIzin: '12',
    tanggalPengajuan: '22 November 2024',
    tanggalSubmit: '22 November 2024',
    tanggalBerlaku: '22 November 2024',
    kbli: 'Jasa Sistem Komunikasi Data',
    status: 'Permohonan Baru',
  },
  {
    id: 3,
    penyelenggara: 'PETABYTE NETWORK INDONESIA',
    nib: '28102300355850003',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: '28102300355850003',
    tanggalPengajuan: '23 June 2024',
    tanggalSubmit: '23 June 2024',
    tanggalBerlaku: '23 June 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 4,
    penyelenggara: 'ERKA JARINGAN UTAMA',
    nib: '07112200382470005',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: '07112200382470005',
    tanggalPengajuan: '23 June 2024',
    tanggalSubmit: '23 June 2024',
    tanggalBerlaku: '23 June 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 5,
    penyelenggara: 'CORBEC COMMUNICATION',
    nib: '91203160312160009',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: '91203160312160009',
    tanggalPengajuan: '23 June 2024',
    tanggalSubmit: '23 June 2024',
    tanggalBerlaku: '23 June 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 6,
    penyelenggara: 'ALFA DIGITAL MEDIA',
    nib: '1906202012340001',
    layanan: 'Penyelenggaraan Jasa Teleponi Dasar (Fixed Line)',
    nomorIzin: 'TL-2020-001',
    tanggalPengajuan: '10 Agustus 2024',
    tanggalSubmit: '11 Agustus 2024',
    tanggalBerlaku: '11 Agustus 2024',
    kbli: 'Jasa Teleponi Dasar',
    status: 'Diproses',
  },
  {
    id: 7,
    penyelenggara: 'NUSANTARA KOMUNIKA',
    nib: '2108202012340002',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: 'ISP-2021-045',
    tanggalPengajuan: '01 Juli 2024',
    tanggalSubmit: '02 Juli 2024',
    tanggalBerlaku: '02 Juli 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 8,
    penyelenggara: 'GARUDA NET SOLUSI',
    nib: '3101202211110003',
    layanan: 'Penyelenggaraan Jasa Sistem Komunikasi Data',
    nomorIzin: 'SKD-2022-010',
    tanggalPengajuan: '05 Mei 2024',
    tanggalSubmit: '06 Mei 2024',
    tanggalBerlaku: '06 Mei 2024',
    kbli: 'Jasa Sistem Komunikasi Data',
    status: 'Disetujui',
  },
  {
    id: 9,
    penyelenggara: 'SATELITA PERSADA',
    nib: '0101202310100004',
    layanan: 'Penyelenggaraan Jasa VSAT (Very Small Aperture Terminal)',
    nomorIzin: 'VSAT-2023-022',
    tanggalPengajuan: '12 April 2024',
    tanggalSubmit: '13 April 2024',
    tanggalBerlaku: '13 April 2024',
    kbli: 'Jasa Telekomunikasi Satelit',
    status: 'Diproses',
  },
  {
    id: 10,
    penyelenggara: 'MEGA DATA TEKNO',
    nib: '2205202310100005',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: 'ISP-2023-067',
    tanggalPengajuan: '20 Maret 2024',
    tanggalSubmit: '21 Maret 2024',
    tanggalBerlaku: '21 Maret 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 11,
    penyelenggara: 'PRIMA KOM',
    nib: '0606202212120006',
    layanan: 'Penyelenggaraan Jasa Teleponi Dasar (Mobile)',
    nomorIzin: 'MOB-2022-101',
    tanggalPengajuan: '14 Februari 2024',
    tanggalSubmit: '15 Februari 2024',
    tanggalBerlaku: '15 Februari 2024',
    kbli: 'Jasa Teleponi Bergerak',
    status: 'Ditolak',
  },
  {
    id: 12,
    penyelenggara: 'NUSANTARA MEDIA LINK',
    nib: '1508202213130007',
    layanan: 'Penyelenggaraan Jasa Pusat Panggilan Informasi (Call Center)',
    nomorIzin: 'CC-2022-015',
    tanggalPengajuan: '11 Januari 2024',
    tanggalSubmit: '12 Januari 2024',
    tanggalBerlaku: '12 Januari 2024',
    kbli: 'Aktivitas Call Centre',
    status: 'Disetujui',
  },
  {
    id: 13,
    penyelenggara: 'ANDALAN CYBERINDO',
    nib: '0101202414140008',
    layanan: 'Penyelenggaraan Jasa Sistem Komunikasi Data',
    nomorIzin: 'SKD-2024-002',
    tanggalPengajuan: '03 Januari 2024',
    tanggalSubmit: '04 Januari 2024',
    tanggalBerlaku: '04 Januari 2024',
    kbli: 'Jasa Sistem Komunikasi Data',
    status: 'Permohonan Baru',
  },
  {
    id: 14,
    penyelenggara: 'GLOBAL NUSANTARA LINK',
    nib: '0202202415150009',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: 'ISP-2024-009',
    tanggalPengajuan: '10 Februari 2024',
    tanggalSubmit: '11 Februari 2024',
    tanggalBerlaku: '11 Februari 2024',
    kbli: 'Internet Service Provider',
    status: 'Permohonan Baru',
  },
  {
    id: 15,
    penyelenggara: 'SINERGI TELEMATIKA',
    nib: '0303202416160010',
    layanan: 'Penyelenggaraan Jasa VoIP (Voice over Internet Protocol)',
    nomorIzin: 'VOIP-2024-005',
    tanggalPengajuan: '15 Maret 2024',
    tanggalSubmit: '16 Maret 2024',
    tanggalBerlaku: '16 Maret 2024',
    kbli: 'Jasa Teleponi Internet',
    status: 'Diproses',
  },
  {
    id: 16,
    penyelenggara: 'MAJU MUNDUR NET',
    nib: '0404202417170011',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: 'ISP-2024-021',
    tanggalPengajuan: '17 April 2024',
    tanggalSubmit: '18 April 2024',
    tanggalBerlaku: '18 April 2024',
    kbli: 'Internet Service Provider',
    status: 'Disetujui',
  },
  {
    id: 17,
    penyelenggara: 'SAMUDRA DIGITAL',
    nib: '0505202418180012',
    layanan: 'Penyelenggaraan Jasa Pusat Panggilan Informasi (Call Center)',
    nomorIzin: 'CC-2024-006',
    tanggalPengajuan: '20 Mei 2024',
    tanggalSubmit: '21 Mei 2024',
    tanggalBerlaku: '21 Mei 2024',
    kbli: 'Aktivitas Call Centre',
    status: 'Disetujui',
  },
  {
    id: 18,
    penyelenggara: 'METRO CIPTA DATA',
    nib: '0606202419190013',
    layanan: 'Penyelenggaraan Jasa Sistem Komunikasi Data',
    nomorIzin: 'SKD-2024-012',
    tanggalPengajuan: '10 Juni 2024',
    tanggalSubmit: '11 Juni 2024',
    tanggalBerlaku: '11 Juni 2024',
    kbli: 'Jasa Sistem Komunikasi Data',
    status: 'Permohonan Baru',
  },
  {
    id: 19,
    penyelenggara: 'BORNEO NET MANDIRI',
    nib: '0707202420200014',
    layanan:
      'Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    nomorIzin: 'ISP-2024-030',
    tanggalPengajuan: '05 Juli 2024',
    tanggalSubmit: '06 Juli 2024',
    tanggalBerlaku: '06 Juli 2024',
    kbli: 'Internet Service Provider',
    status: 'Diproses',
  },
  {
    id: 20,
    penyelenggara: 'TELEKOM PRIMA SOLUSI',
    nib: '0808202421210015',
    layanan: 'Penyelenggaraan Jasa VoIP (Voice over Internet Protocol)',
    nomorIzin: 'VOIP-2024-010',
    tanggalPengajuan: '18 Agustus 2024',
    tanggalSubmit: '19 Agustus 2024',
    tanggalBerlaku: '19 Agustus 2024',
    kbli: 'Jasa Teleponi Internet',
    status: 'Disetujui',
  },
];

function StatusBadge({ value }: { value: JasaStatus }) {
  const cls =
    value === 'Disetujui'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : value === 'Permohonan Baru'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : value === 'Diproses'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  return (
    <Badge variant="outline" className={cls}>
      {value}
    </Badge>
  );
}

function renderService(text: string) {
  const open = text.indexOf('(');
  const close = text.lastIndexOf(')');
  if (open > -1 && close > open) {
    const before = text.slice(0, open).trim();
    const inside = text.slice(open + 1, close).trim();
    return (
      <span>
        {before} ({' '}
        <em className="italic">
          {inside}
        </em> )
      </span>
    );
  }
  return <span>{text}</span>;
}

const PAGE_SIZES = [10, 20, 50];

export default function JasaPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulasi refetch data; ketika terhubung API ganti dengan pemanggilan ulang data
    setTimeout(() => setRefreshing(false), 400);
  };

  const total = DUMMY_DATA.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => DUMMY_DATA.slice(start, end), [start, end]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jasa</h1>
          <p className="text-muted-foreground">
            Daftar permohonan dan izin penyelenggaraan jasa telekomunikasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            title="Refresh"
          >
            <RotateCcw className={'mr-2 h-4 w-4' + (refreshing ? ' animate-spin' : '')} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Jasa</CardTitle>
          <CardDescription>
            Tabel dengan 20 data dummy untuk uji pagination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>PENYELENGGARA</TableHead>
                  <TableHead>LAYANAN</TableHead>
                  <TableHead>NOMOR IZIN</TableHead>
                  <TableHead>TANGGAL PENGAJUAN</TableHead>
                  <TableHead>TANGGAL SUBMIT</TableHead>
                  <TableHead>TANGGAL BERLAKU</TableHead>
                  <TableHead>KBLI</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right w-[60px]">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">
                      {start + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{row.penyelenggara}</div>
                      <div className="text-xs text-muted-foreground">({row.nib})</div>
                    </TableCell>
                    <TableCell className="max-w-[320px]">{renderService(row.layanan)}</TableCell>
                    <TableCell>{row.nomorIzin}</TableCell>
                    <TableCell>{row.tanggalPengajuan}</TableCell>
                    <TableCell>{row.tanggalSubmit}</TableCell>
                    <TableCell>{row.tanggalBerlaku}</TableCell>
                    <TableCell>{row.kbli}</TableCell>
                    <TableCell>
                      <StatusBadge value={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => console.log('view', row.id)}
                        aria-label="Lihat detail"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Menampilkan {total === 0 ? 0 : start + 1}–{end} dari {total} data
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    const next = parseInt(v, 10) || 10;
                    setPageSize(next);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <span className="px-2 text-sm text-muted-foreground">
                      Page {Math.min(page, totalPages)} of {totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}