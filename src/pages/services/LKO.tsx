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

type LKOStatus = 'Sudah menyampaikan' | 'Belum menyampaikan';

interface LKORecord {
  id: number;
  penyelenggara: string;
  nib: string;
  alamat: string;
  alamatKorespondensi: string;
  tahun: string;
  status: LKOStatus;
}

const DUMMY_DATA: LKORecord[] = [
  {
    id: 1,
    penyelenggara: 'GNET BIARO AKSES',
    nib: '8120313140358',
    alamat:
      'Jl. Raya Koto Marapak - Lambah Depan SMAN 1 IV Angkat, Kec. Angkat Kab. Agam, Sumatera Barat',
    alamatKorespondensi:
      'Jl. Raya Koto Marapak - Lambah Depan SMAN 1 IV Angkat, Kec. Angkat Kab. Agam, Sumatera Barat',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 2,
    penyelenggara: 'TELEMEDIA KOMUNIKASI PRATAMA',
    nib: '1233000320797',
    alamat:
      'RUKO CBP GALUH BLOK D NO.6C, KEL. SUKAHARJA, KEC. TELUKJAMBE TIMUR',
    alamatKorespondensi:
      'RUKO CBP GALUH BLOK D NO.6C, KEL. SUKAHARJA, KEC. TELUKJAMBE TIMUR',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 3,
    penyelenggara: 'FAHASA TRI DATA',
    nib: '1244000402113',
    alamat:
      'JL. PANDEAN RT. 004 RW. 003, DESA JEKULO, KEC. JEKULO, KAB. KUDUS',
    alamatKorespondensi:
      'JL. PANDEAN RT. 004 RW. 003, DESA JEKULO, KEC. JEKULO, KAB. KUDUS',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 4,
    penyelenggara: 'PANCA DEWATA UTAMA',
    nib: '8120314041765',
    alamat: 'Graha Kapital 1 Lt. 3, Jl. Kemang Raya No. 4, Jakarta Selatan',
    alamatKorespondensi:
      'Graha Kapital 1 Lt. 3, Jl. Kemang Raya No. 4, Jakarta Selatan 12730',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  // Tambahan 16 data dummy
  {
    id: 5,
    penyelenggara: 'BORNEO DATA NUSANTARA',
    nib: '9120316012345001',
    alamat: 'Jl. S. Parman No.12, Balikpapan Tengah, Kalimantan Timur',
    alamatKorespondensi:
      'Komplek Niaga Balikpapan Blok B2 No.8, Balikpapan, Kalimantan Timur',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 6,
    penyelenggara: 'METRO CIPTA MEDIA',
    nib: '9120316012345002',
    alamat: 'Jl. Jenderal Sudirman No.88, Bandung, Jawa Barat',
    alamatKorespondensi: 'Ruko Sudirman Plaza Blok A-5, Bandung, Jawa Barat',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 7,
    penyelenggara: 'SAMUDRA DIGITAL',
    nib: '9120316012345003',
    alamat: 'Jl. Kertajaya Indah Timur, Surabaya, Jawa Timur',
    alamatKorespondensi: 'Gedung Samudra Lt. 2, Surabaya, Jawa Timur',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 8,
    penyelenggara: 'GARUDA NET SOLUSI',
    nib: '9120316012345004',
    alamat: 'Jl. Palagan Tentara Pelajar No.99, Sleman, DIY',
    alamatKorespondensi: 'Ruko Palagan Square A-2, Sleman, DIY',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 9,
    penyelenggara: 'PRIMA KOM',
    nib: '9120316012345005',
    alamat: 'Jl. Veteran No.10, Makassar, Sulawesi Selatan',
    alamatKorespondensi: 'Graha Prima Lt. 3, Jl. Veteran No.10, Makassar',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 10,
    penyelenggara: 'ANDALAN CYBERINDO',
    nib: '9120316012345006',
    alamat: 'Jl. Asia Afrika No. 100, Jakarta Pusat',
    alamatKorespondensi: 'Menara Andalan Lt. 12, Jakarta Pusat',
    tahun: '2024',
    status: 'Sudah menyampaikan',
  },
  {
    id: 11,
    penyelenggara: 'GLOBAL NUSANTARA LINK',
    nib: '9120316012345007',
    alamat: 'Jl. Diponegoro No. 2, Denpasar, Bali',
    alamatKorespondensi:
      'Ruko Diponegoro Square Blok C-7, Denpasar, Bali',
    tahun: '2024',
    status: 'Sudah menyampaikan',
  },
  {
    id: 12,
    penyelenggara: 'SINERGI TELEMATIKA',
    nib: '9120316012345008',
    alamat: 'Jl. Ahmad Yani No. 5, Pontianak, Kalimantan Barat',
    alamatKorespondensi: 'Komplek A. Yani Business Park A-3, Pontianak',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 13,
    penyelenggara: 'MAJU MUNDUR NET',
    nib: '9120316012345009',
    alamat: 'Jl. Sisingamangaraja No. 77, Medan, Sumatera Utara',
    alamatKorespondensi:
      'Gedung MMN Lt. 6, Jl. Sisingamangaraja 77, Medan',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 14,
    penyelenggara: 'BALI NUSA NET',
    nib: '9120316012345010',
    alamat: 'Jl. Gatot Subroto Barat, Badung, Bali',
    alamatKorespondensi: 'Ruko Gatsu Center B-1, Badung, Bali',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 15,
    penyelenggara: 'SUMATERA TELEMEDIA',
    nib: '9120316012345011',
    alamat: 'Jl. Jend. Sudirman No. 10, Pekanbaru, Riau',
    alamatKorespondensi:
      'Sudirman Business Park A-10, Pekanbaru, Riau',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
  {
    id: 16,
    penyelenggara: 'CELEBES LINK',
    nib: '9120316012345012',
    alamat: 'Jl. Sam Ratulangi No. 8, Manado, Sulawesi Utara',
    alamatKorespondensi:
      'Ruko Sam Ratulangi Kav. 12, Manado, Sulawesi Utara',
    tahun: '2024',
    status: 'Sudah menyampaikan',
  },
  {
    id: 17,
    penyelenggara: 'PAPUA DATA',
    nib: '9120316012345013',
    alamat: 'Jl. Yos Sudarso No. 45, Jayapura, Papua',
    alamatKorespondensi:
      'Ruko Yos Sudarso Center A-4, Jayapura, Papua',
    tahun: '2024',
    status: 'Sudah menyampaikan',
  },
  {
    id: 18,
    penyelenggara: 'JAWA MEDIA',
    nib: '9120316012345014',
    alamat: 'Jl. Gubernur Suryo No. 11, Surabaya, Jawa Timur',
    alamatKorespondensi:
      'Gedung Jawa Media Lt. 5, Surabaya, Jawa Timur',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 19,
    penyelenggara: 'NUSANTARA HUB',
    nib: '9120316012345015',
    alamat: 'Jl. Pemuda No. 1, Semarang, Jawa Tengah',
    alamatKorespondensi: 'Ruko Pemuda Indah C-2, Semarang',
    tahun: '2023',
    status: 'Sudah menyampaikan',
  },
  {
    id: 20,
    penyelenggara: 'ALFA DIGITAL MEDIA',
    nib: '9120316012345016',
    alamat: 'Jl. Raya Juanda No. 3, Sidoarjo, Jawa Timur',
    alamatKorespondensi:
      'Juanda Business Center B-5, Sidoarjo, Jawa Timur',
    tahun: '2022',
    status: 'Sudah menyampaikan',
  },
];

function StatusLabel({ value }: { value: LKOStatus }) {
  const cls = value === 'Sudah menyampaikan' ? 'text-emerald-600' : 'text-rose-600';
  return <span className={`font-medium ${cls}`}>{value}</span>;
}

const PAGE_SIZES = [10, 20, 50];

export default function LKOPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">LKO</h1>
          <p className="text-muted-foreground">
            Daftar Laporan Kegiatan Operasional Penyelenggara Telekomunikasi
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
          <CardTitle>Data LKO</CardTitle>
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
                  <TableHead>ALAMAT</TableHead>
                  <TableHead>ALAMAT KORESPONDENSI</TableHead>
                  <TableHead>TAHUN</TableHead>
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
                    <TableCell className="max-w-[420px] whitespace-pre-wrap">
                      {row.alamat}
                    </TableCell>
                    <TableCell className="max-w-[420px] whitespace-pre-wrap">
                      {row.alamatKorespondensi}
                    </TableCell>
                    <TableCell>{row.tahun}</TableCell>
                    <TableCell>
                      <StatusLabel value={row.status} />
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