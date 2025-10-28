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

type PenomoranStatus = 'Aktif' | 'Idle' | 'Nonaktif';

interface PenomoranRecord {
  id: number;
  penyelenggara: string;
  nib: string; // tampil kecil di bawah nama
  jenisPenyelenggara: string; // contoh: Penyelenggara Telekomunikasi
  jenis: string; // contoh: Kode Akses Pusat Panggilan Informasi (Call Center)
  jenisKode: string; // contoh: 150XYZ / 510XYZ
  kodeAkses: string; // contoh: 150164
  nomor: string; // contoh: 131/TEL.05.05/2020 (boleh kosong)
  tanggalPenetapan: string; // contoh: 06 Jul 2020 (boleh kosong)
  status: PenomoranStatus;
}

const DUMMY_DATA: PenomoranRecord[] = [
  {
    id: 1,
    penyelenggara: '—',
    nib: '',
    jenisPenyelenggara: '',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51086',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 2,
    penyelenggara: '—',
    nib: '',
    jenisPenyelenggara: '',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150164',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 3,
    penyelenggara: 'PT JASNITA TELEKOMINDO, TBK.',
    nib: '9120520192324',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150420',
    nomor: '131/TEL.05.05/2020',
    tanggalPenetapan: '06 Jul 2020',
    status: 'Aktif',
  },
  {
    id: 4,
    penyelenggara: '—',
    nib: '',
    jenisPenyelenggara: '',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150676',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 5,
    penyelenggara: '—',
    nib: '',
    jenisPenyelenggara: '',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150932',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 6,
    penyelenggara: 'PT INFOMEDIA NUSANTARA',
    nib: '8120213252679',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '1500188',
    nomor: '274/TEL.05.05/2019',
    tanggalPenetapan: '02 Oct 2019',
    status: 'Aktif',
  },
  {
    id: 7,
    penyelenggara: 'PT INFOMEDIA NUSANTARA',
    nib: '8120213252679',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '1500444',
    nomor: '434/TEL.05.05/2020',
    tanggalPenetapan: '02 Oct 2019',
    status: 'Aktif',
  },
  {
    id: 8,
    penyelenggara: 'PT SINERGI MEDIA SUARA',
    nib: '9201201234567001',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51011',
    nomor: '12/TEL.05.05/2021',
    tanggalPenetapan: '15 Mar 2021',
    status: 'Aktif',
  },
  {
    id: 9,
    penyelenggara: 'PT ANDALAN TELEKOM',
    nib: '9201201234567002',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150777',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 10,
    penyelenggara: 'PT GARUDA TEKNO DATA',
    nib: '9201201234567003',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51023',
    nomor: '88/TEL.05.05/2022',
    tanggalPenetapan: '02 Aug 2022',
    status: 'Aktif',
  },
  {
    id: 11,
    penyelenggara: 'PT BORNEO NET',
    nib: '9201201234567004',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150911',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 12,
    penyelenggara: 'PT METRO CIPTA DATA',
    nib: '9201201234567005',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51045',
    nomor: '12/TEL.05.05/2023',
    tanggalPenetapan: '12 Feb 2023',
    status: 'Aktif',
  },
  {
    id: 13,
    penyelenggara: 'PT JAWA MEDIA LINK',
    nib: '9201201234567006',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150123',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 14,
    penyelenggara: 'PT NUSANTARA HUB',
    nib: '9201201234567007',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51067',
    nomor: '201/TEL.05.05/2020',
    tanggalPenetapan: '28 Oct 2020',
    status: 'Aktif',
  },
  {
    id: 15,
    penyelenggara: 'PT CELEBES COMM',
    nib: '9201201234567008',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150888',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 16,
    penyelenggara: 'PT PAPUA DATA NUSANTARA',
    nib: '9201201234567009',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51099',
    nomor: '08/TEL.05.05/2024',
    tanggalPenetapan: '03 Jan 2024',
    status: 'Aktif',
  },
  {
    id: 17,
    penyelenggara: 'PT BALI NUSA NET',
    nib: '9201201234567010',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150001',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 18,
    penyelenggara: 'PT SUMATERA TELEMEDIA',
    nib: '9201201234567011',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51070',
    nomor: '45/TEL.05.05/2021',
    tanggalPenetapan: '16 May 2021',
    status: 'Aktif',
  },
  {
    id: 19,
    penyelenggara: 'PT SULAWESI DIGITAL',
    nib: '9201201234567012',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Kode Akses Pusat Panggilan Informasi (Call Center)',
    jenisKode: '150XYZ',
    kodeAkses: '150520',
    nomor: '',
    tanggalPenetapan: '',
    status: 'Idle',
  },
  {
    id: 20,
    penyelenggara: 'PT KALIMANTAN NET',
    nib: '9201201234567013',
    jenisPenyelenggara: 'Penyelenggara Telekomunikasi',
    jenis: 'Public Land Mobile Network Identity (PLMNID)',
    jenisKode: '510XYZ',
    kodeAkses: '51012',
    nomor: '300/TEL.05.05/2019',
    tanggalPenetapan: '22 Sep 2019',
    status: 'Aktif',
  },
];

function StatusBadge({ value }: { value: PenomoranStatus }) {
  const cls =
    value === 'Aktif'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : value === 'Idle'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  return (
    <Badge variant="outline" className={cls}>
      {value}
    </Badge>
  );
}

function JenisCell({ jenis, kode }: { jenis: string; kode: string }) {
  return (
    <div className="space-y-1">
      <div>{jenis}</div>
      <div className="text-xs text-muted-foreground">({kode})</div>
    </div>
  );
}

const PAGE_SIZES = [10, 20, 50];

export default function PenomoranPage() {
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
    // saat terhubung API: ganti dengan refetch data
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penomoran</h1>
          <p className="text-muted-foreground">
            Daftar penomoran telekomunikasi (kode akses dan identitas jaringan)
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
          <CardTitle>Data Penomoran</CardTitle>
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
                  <TableHead>JENIS PENYELENGGARA</TableHead>
                  <TableHead>JENIS</TableHead>
                  <TableHead>KODE AKSES</TableHead>
                  <TableHead>NOMOR</TableHead>
                  <TableHead>TANGGAL PENETAPAN</TableHead>
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
                      {row.nib ? (
                        <div className="text-xs text-muted-foreground">
                          ({row.nib})
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">( )</div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap">
                      {row.jenisPenyelenggara || ''}
                    </TableCell>
                    <TableCell className="max-w-[420px]">
                      <JenisCell jenis={row.jenis} kode={row.jenisKode} />
                    </TableCell>
                    <TableCell>{row.kodeAkses}</TableCell>
                    <TableCell>{row.nomor}</TableCell>
                    <TableCell>{row.tanggalPenetapan}</TableCell>
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