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
import { RotateCcw } from 'lucide-react';

type JaringanStatus = 'Permohonan Baru' | 'Disetujui' | 'Ditolak' | 'Diproses';

interface JaringanRecord {
  id: number;
  penyelenggara: string;
  nib: string;
  layanan: string;
  nomorIzin: string;
  tanggalPengajuan: string;
  tanggalSubmit: string;
  tanggalBerlaku: string;
  kbli: string;
  status: JaringanStatus;
}

const DUMMY_DATA: JaringanRecord[] = (() => {
  const base: JaringanRecord[] = [
    {
      id: 1,
      penyelenggara: 'BCTech',
      nib: '987654321',
      layanan: 'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Satelit',
      nomorIzin: '9000000',
      tanggalPengajuan: '22 November 2024',
      tanggalSubmit: '22 November 2024',
      tanggalBerlaku: '23 November 2024',
      kbli: 'Aktivitas Telekomunikasi Satelit',
      status: 'Disetujui',
    },
    {
      id: 2,
      penyelenggara: 'BCTech',
      nib: '987654321',
      layanan:
        'Penyelenggaraan Jaringan Bergerak Terestrial Radio Trunking',
      nomorIzin: '78965',
      tanggalPengajuan: '22 November 2024',
      tanggalSubmit: '22 November 2024',
      tanggalBerlaku: '23 November 2024',
      kbli: 'Aktivitas Telekomunikasi Tanpa Kabel',
      status: 'Permohonan Baru',
    },
    {
      id: 3,
      penyelenggara: 'BCTech',
      nib: '987654321',
      layanan: 'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Satelit',
      nomorIzin: '51231',
      tanggalPengajuan: '21 November 2024',
      tanggalSubmit: '21 November 2024',
      tanggalBerlaku: '23 November 2024',
      kbli: 'Aktivitas Telekomunikasi Satelit',
      status: 'Ditolak',
    },
    {
      id: 4,
      penyelenggara: 'BCTech',
      nib: '987654321',
      layanan:
        'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Fiber Optik Sistem Komunikasi Kabel Laut (SKKL)',
      nomorIzin: '333422',
      tanggalPengajuan: '21 November 2024',
      tanggalSubmit: '21 November 2024',
      tanggalBerlaku: '22 November 2024',
      kbli: 'Aktivitas Telekomunikasi dengan Kabel',
      status: 'Ditolak',
    },
    {
      id: 5,
      penyelenggara: 'BCTech',
      nib: '987654321',
      layanan: 'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Satelit',
      nomorIzin: '123',
      tanggalPengajuan: '22 November 2024',
      tanggalSubmit: '22 November 2024',
      tanggalBerlaku: '21 November 2024',
      kbli: 'Aktivitas Telekomunikasi Satelit',
      status: 'Permohonan Baru',
    },
  ];
  const names = [
    'NUSANTARA NET',
    'GARUDA LINK',
    'SATELIT INDO',
    'FIBER OPTIKA INDONESIA',
    'MEGA JARINGAN TEKNO',
    'PRIMA KABEL NUSANTARA',
    'GLOBALWIRE',
    'SINERGI TELEKOM',
    'ANDALAN NETWORK',
    'BORNEO CONNECT',
    'SUMATERA NET',
    'CELEBES LINK',
    'PAPUA DATA',
    'JAWA MEDIA',
    'BALI NUSA NET',
  ];
  const services = [
    'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Satelit',
    'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Serat Optik',
    'Penyelenggaraan Jaringan Tetap Tertutup melalui Media Gelombang Mikro',
    'Penyelenggaraan Jaringan Bergerak Terestrial Radio Trunking',
  ];
  const kblis = [
    'Aktivitas Telekomunikasi Satelit',
    'Aktivitas Telekomunikasi dengan Kabel',
    'Aktivitas Telekomunikasi Tanpa Kabel',
  ];
  const statuses: JaringanStatus[] = [
    'Disetujui',
    'Permohonan Baru',
    'Diproses',
    'Ditolak',
  ];
  const extras: JaringanRecord[] = [];
  for (let i = 0; i < 15; i++) {
    const id = 6 + i;
    const nm = names[i % names.length];
    const service = services[i % services.length];
    const kbli = kblis[i % kblis.length];
    const status = statuses[i % statuses.length];
    const day = 10 + (i % 14); // 10-23
    const day2 = Math.min(day + 1, 23);
    extras.push({
      id,
      penyelenggara: nm,
      nib: String(9000000000000000 + i).padStart(16, '0'),
      layanan: service,
      nomorIzin: String(100000 + i * 7),
      tanggalPengajuan: `${day} November 2024`,
      tanggalSubmit: `${day} November 2024`,
      tanggalBerlaku: `${day2} November 2024`,
      kbli,
      status,
    });
  }
  return [...base, ...extras];
})();

function StatusBadge({ value }: { value: JaringanStatus }) {
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

export default function JaringanPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const total = DUMMY_DATA.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => DUMMY_DATA.slice(start, end), [start, end]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jaringan</h1>
          <p className="text-muted-foreground">
            Daftar permohonan dan izin penyelenggaraan jaringan telekomunikasi
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
          <CardTitle>Data Jaringan</CardTitle>
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
                    <TableCell className="max-w-[420px]">{row.layanan}</TableCell>
                    <TableCell>{row.nomorIzin}</TableCell>
                    <TableCell>{row.tanggalPengajuan}</TableCell>
                    <TableCell>{row.tanggalSubmit}</TableCell>
                    <TableCell>{row.tanggalBerlaku}</TableCell>
                    <TableCell>{row.kbli}</TableCell>
                    <TableCell>
                      <StatusBadge value={row.status} />
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
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
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