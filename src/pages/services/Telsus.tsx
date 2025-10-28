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

type TelsusStatus = 'Permohonan Baru' | 'Disetujui' | 'Ditolak' | 'Diproses';

interface TelsusRecord {
  id: number;
  penyelenggara: string;
  nib: string; // identitas kecil di bawah nama
  layanan: string;
  nomorIzin: string;
  tanggalPengajuan: string;
  tanggalSubmit: string;
  tanggalBerlaku: string;
  kbli: string;
  status: TelsusStatus;
}

const DUMMY_DATA: TelsusRecord[] = [
  {
    id: 1,
    penyelenggara: 'BCTech',
    nib: '987654321',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: '999999',
    tanggalPengajuan: '22 November 2024',
    tanggalSubmit: '22 November 2024',
    tanggalBerlaku: '22 November 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Permohonan Baru',
  },
  {
    id: 2,
    penyelenggara:
      'BADAN PENANGGULANGAN BENCANA DAERAH KOTA YOGYAKARTA',
    nib: 'BPBD KOTA YOGYAKARTA',
    layanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorIzin: '1/TEL.03.02/2024',
    tanggalPengajuan: '26 June 2024',
    tanggalSubmit: '26 June 2024',
    tanggalBerlaku: '26 June 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 3,
    penyelenggara: 'AMSL DELTA MAS',
    nib: '02201042613490004',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: '02201042613490004',
    tanggalPengajuan: '04 June 2024',
    tanggalSubmit: '04 June 2024',
    tanggalBerlaku: '04 June 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 4,
    penyelenggara: 'UNIVERSITAS MAJU MUNDUR',
    nib: '002202019990001',
    layanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorIzin: 'IP-2024-004',
    tanggalPengajuan: '14 May 2024',
    tanggalSubmit: '14 May 2024',
    tanggalBerlaku: '15 May 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Diproses',
  },
  {
    id: 5,
    penyelenggara: 'PT NUSANTARA STEEL',
    nib: '1906202012340001',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-015',
    tanggalPengajuan: '10 May 2024',
    tanggalSubmit: '11 May 2024',
    tanggalBerlaku: '11 May 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 6,
    penyelenggara: 'KEMENTERIAN CONTOH',
    nib: 'INSTANSI PEMERINTAH',
    layanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorIzin: 'IP-2024-016',
    tanggalPengajuan: '02 May 2024',
    tanggalSubmit: '03 May 2024',
    tanggalBerlaku: '03 May 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 7,
    penyelenggara: 'PT BORNEO ENERGI',
    nib: '2001202011110002',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-018',
    tanggalPengajuan: '25 April 2024',
    tanggalSubmit: '26 April 2024',
    tanggalBerlaku: '26 April 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Permohonan Baru',
  },
  {
    id: 8,
    penyelenggara: 'DINAS KOMINFO KOTA CONTOH',
    nib: 'PEMDA KOTA CONTOH',
    layanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorIzin: 'IP-2024-021',
    tanggalPengajuan: '18 April 2024',
    tanggalSubmit: '18 April 2024',
    tanggalBerlaku: '18 April 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 9,
    penyelenggara: 'PT METRO CIPTA DATA',
    nib: '3101202211110003',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-023',
    tanggalPengajuan: '10 April 2024',
    tanggalSubmit: '11 April 2024',
    tanggalBerlaku: '11 April 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Diproses',
  },
  {
    id: 10,
    penyelenggara: 'PT ANDALAN CYBERINDO',
    nib: '0101202414140008',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-030',
    tanggalPengajuan: '03 April 2024',
    tanggalSubmit: '03 April 2024',
    tanggalBerlaku: '03 April 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Ditolak',
  },
  {
    id: 11,
    penyelenggara: 'PT GLOBAL NUSANTARA LINK',
    nib: '0202202415150009',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-033',
    tanggalPengajuan: '28 March 2024',
    tanggalSubmit: '29 March 2024',
    tanggalBerlaku: '29 March 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 12,
    penyelenggara: 'PT SINERGI TELEMATIKA',
    nib: '0303202416160010',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-040',
    tanggalPengajuan: '15 March 2024',
    tanggalSubmit: '15 March 2024',
    tanggalBerlaku: '15 March 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 13,
    penyelenggara: 'PT MAJU MUNDUR NET',
    nib: '0404202417170011',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-044',
    tanggalPengajuan: '20 March 2024',
    tanggalSubmit: '21 March 2024',
    tanggalBerlaku: '21 March 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Diproses',
  },
  {
    id: 14,
    penyelenggara: 'PT GARUDA NET SOLUSI',
    nib: '3101202211110003',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-051',
    tanggalPengajuan: '05 March 2024',
    tanggalSubmit: '06 March 2024',
    tanggalBerlaku: '06 March 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 15,
    penyelenggara: 'PT PRIMA KOM',
    nib: '0606202212120006',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-059',
    tanggalPengajuan: '26 February 2024',
    tanggalSubmit: '26 February 2024',
    tanggalBerlaku: '26 February 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 16,
    penyelenggara: 'PT JAWA MEDIA',
    nib: '2108202012340002',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-067',
    tanggalPengajuan: '18 February 2024',
    tanggalSubmit: '18 February 2024',
    tanggalBerlaku: '18 February 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Permohonan Baru',
  },
  {
    id: 17,
    penyelenggara: 'DINAS X PROVINSI Y',
    nib: 'PEMERINTAH DAERAH',
    layanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorIzin: 'IP-2024-072',
    tanggalPengajuan: '12 February 2024',
    tanggalSubmit: '12 February 2024',
    tanggalBerlaku: '12 February 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 18,
    penyelenggara: 'PT BALI NUSA NET',
    nib: '0707202420200014',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-081',
    tanggalPengajuan: '06 February 2024',
    tanggalSubmit: '06 February 2024',
    tanggalBerlaku: '06 February 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
  {
    id: 19,
    penyelenggara: 'PT PAPUA DATA',
    nib: '0606202419190013',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-089',
    tanggalPengajuan: '28 January 2024',
    tanggalSubmit: '28 January 2024',
    tanggalBerlaku: '28 January 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Ditolak',
  },
  {
    id: 20,
    penyelenggara: 'PT SUMATERA TELEMEDIA',
    nib: '0505202418180012',
    layanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorIzin: 'TS-2024-095',
    tanggalPengajuan: '20 January 2024',
    tanggalSubmit: '21 January 2024',
    tanggalBerlaku: '21 January 2024',
    kbli: 'Aktivitas Telekomunikasi Khusus Untuk Keperluan Sendiri',
    status: 'Disetujui',
  },
];

function StatusBadge({ value }: { value: TelsusStatus }) {
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

const PAGE_SIZES = [10, 20, 50];

export default function TelsusPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Telsus</h1>
          <p className="text-muted-foreground">
            Daftar perizinan dan izin prinsip Telekomunikasi Khusus
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
          <CardTitle>Data Telekomunikasi Khusus</CardTitle>
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
                      <div className="text-xs text-muted-foreground">
                        ({row.nib})
                      </div>
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