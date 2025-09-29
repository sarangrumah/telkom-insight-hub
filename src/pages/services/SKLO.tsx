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

type SKLOStatus = 'Disetujui' | 'Permohonan Baru' | 'Ditolak' | 'Diproses';

interface SKLORecord {
  id: number;
  perusahaan: string;
  perusahaanAlt?: string; // teks kecil di bawah nama (dalam kurung)
  izinLayanan: string;
  nomorSKLO: string;
  tanggalBerlaku: string;
  status: SKLOStatus;
}

const DUMMY_DATA: SKLORecord[] = [
  {
    id: 1,
    perusahaan: 'SEKRETARIAT WAKIL PRESIDEN - SEKRETARIAT NEGARA RI',
    perusahaanAlt: 'SEKRETARIAT WAKIL PRESIDEN - SEKRETARIAT NEGARA RI',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '193/DIRJEN/2010',
    tanggalBerlaku: '04 June 2010',
    status: 'Disetujui',
  },
  {
    id: 2,
    perusahaan: 'SEKRETARIAT DAERAH PEMERINTAH KABUPATEN BANTUL',
    perusahaanAlt: 'SEKRETARIAT DAERAH PEMERINTAH KABUPATEN BANTUL',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '230/DIRJEN/2010',
    tanggalBerlaku: '06 July 2010',
    status: 'Disetujui',
  },
  {
    id: 3,
    perusahaan:
      'SATUAN KERJA KHUSUS USAHA HULU MINYAK DAN GAS BUMI (SKK MIGAS) - BP INDONESIA',
    perusahaanAlt:
      'SATUAN KERJA KHUSUS USAHA HULU MINYAK DAN GAS BUMI (SKK MIGAS) - BP INDONESIA',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '001/TEL.03.02/2020',
    tanggalBerlaku: '03 April 2020',
    status: 'Disetujui',
  },
  {
    id: 4,
    perusahaan:
      'SATUAN KERJA KHUSUS PELAKSANA KEGIATAN USAHA HULU MINYAK DAN GAS BUMI (SKK MIGAS) – PETROCHINA INTERNATIONAL JABUNG LTD',
    perusahaanAlt:
      'SATUAN KERJA KHUSUS PELAKSANA KEGIATAN USAHA HULU MINYAK DAN GAS BUMI (SKK MIGAS) – PETROCHINA INTERNATIONAL JABUNG LTD',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '113/TEL.03.02/2022',
    tanggalBerlaku: '04 October 2022',
    status: 'Disetujui',
  },
  // Tambahan 16 data dummy
  {
    id: 5,
    perusahaan: 'DINAS KOMUNIKASI DAN INFORMATIKA KABUPATEN SLEMAN',
    perusahaanAlt:
      'DINAS KOMUNIKASI DAN INFORMATIKA KABUPATEN SLEMAN',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '205/TEL.03.02/2021',
    tanggalBerlaku: '12 May 2021',
    status: 'Disetujui',
  },
  {
    id: 6,
    perusahaan: 'PT NUSANTARA MINERAL PRIMA',
    perusahaanAlt: 'PT NUSANTARA MINERAL PRIMA',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2021-045',
    tanggalBerlaku: '20 May 2021',
    status: 'Disetujui',
  },
  {
    id: 7,
    perusahaan: 'DINAS PERHUBUNGAN PROVINSI JAWA BARAT',
    perusahaanAlt: 'DINAS PERHUBUNGAN PROVINSI JAWA BARAT',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '306/TEL.03.02/2021',
    tanggalBerlaku: '28 June 2021',
    status: 'Disetujui',
  },
  {
    id: 8,
    perusahaan: 'PT BORNEO ENERGI PERSADA',
    perusahaanAlt: 'PT BORNEO ENERGI PERSADA',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2022-011',
    tanggalBerlaku: '05 February 2022',
    status: 'Diproses',
  },
  {
    id: 9,
    perusahaan: 'SEKRETARIAT DAERAH PROVINSI KALIMANTAN TIMUR',
    perusahaanAlt: 'SEKRETARIAT DAERAH PROVINSI KALIMANTAN TIMUR',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '017/TEL.03.02/2022',
    tanggalBerlaku: '10 March 2022',
    status: 'Disetujui',
  },
  {
    id: 10,
    perusahaan: 'PT ANDALAN CYBERINDO',
    perusahaanAlt: 'PT ANDALAN CYBERINDO',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2022-023',
    tanggalBerlaku: '20 March 2022',
    status: 'Disetujui',
  },
  {
    id: 11,
    perusahaan: 'SEKRETARIAT DAERAH KABUPATEN BADUNG',
    perusahaanAlt: 'SEKRETARIAT DAERAH KABUPATEN BADUNG',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '051/TEL.03.02/2022',
    tanggalBerlaku: '02 April 2022',
    status: 'Disetujui',
  },
  {
    id: 12,
    perusahaan: 'PT METRO CIPTA MEDIA',
    perusahaanAlt: 'PT METRO CIPTA MEDIA',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2022-041',
    tanggalBerlaku: '12 April 2022',
    status: 'Ditolak',
  },
  {
    id: 13,
    perusahaan: 'PT JAWA MEDIA DIGITAL',
    perusahaanAlt: 'PT JAWA MEDIA DIGITAL',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2022-058',
    tanggalBerlaku: '04 May 2022',
    status: 'Disetujui',
  },
  {
    id: 14,
    perusahaan: 'SEKRETARIAT DAERAH PROVINSI DIY',
    perusahaanAlt: 'SEKRETARIAT DAERAH PROVINSI DIY',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '077/TEL.03.02/2022',
    tanggalBerlaku: '15 June 2022',
    status: 'Disetujui',
  },
  {
    id: 15,
    perusahaan: 'PT BALI NUSA NET',
    perusahaanAlt: 'PT BALI NUSA NET',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2022-091',
    tanggalBerlaku: '03 July 2022',
    status: 'Disetujui',
  },
  {
    id: 16,
    perusahaan: 'PT SUMATERA TELEMEDIA',
    perusahaanAlt: 'PT SUMATERA TELEMEDIA',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2023-006',
    tanggalBerlaku: '11 January 2023',
    status: 'Diproses',
  },
  {
    id: 17,
    perusahaan: 'PT PAPUA DATA NUSANTARA',
    perusahaanAlt: 'PT PAPUA DATA NUSANTARA',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2023-014',
    tanggalBerlaku: '22 January 2023',
    status: 'Disetujui',
  },
  {
    id: 18,
    perusahaan: 'SEKRETARIAT DAERAH KOTA BANDUNG',
    perusahaanAlt: 'SEKRETARIAT DAERAH KOTA BANDUNG',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '012/TEL.03.02/2023',
    tanggalBerlaku: '02 February 2023',
    status: 'Disetujui',
  },
  {
    id: 19,
    perusahaan: 'PT NUSANTARA HUB',
    perusahaanAlt: 'PT NUSANTARA HUB',
    izinLayanan:
      'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Badan Hukum',
    nomorSKLO: 'TS-2023-025',
    tanggalBerlaku: '15 March 2023',
    status: 'Disetujui',
  },
  {
    id: 20,
    perusahaan: 'SEKRETARIAT DAERAH KABUPATEN SIDOARJO',
    perusahaanAlt: 'SEKRETARIAT DAERAH KABUPATEN SIDOARJO',
    izinLayanan:
      'Izin Prinsip Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Instansi Pemerintah',
    nomorSKLO: '023/TEL.03.02/2023',
    tanggalBerlaku: '29 March 2023',
    status: 'Disetujui',
  },
];

function StatusBadge({ value }: { value: SKLOStatus }) {
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

export default function SKLOPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">SKLO</h1>
          <p className="text-muted-foreground">
            Daftar SKLO Telecommunication Khusus (Instansi Pemerintah & Badan Hukum)
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
          <CardTitle>Data SKLO</CardTitle>
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
                  <TableHead>PERUSAHAAN</TableHead>
                  <TableHead>IZIN LAYANAN</TableHead>
                  <TableHead>NOMOR SKLO</TableHead>
                  <TableHead>TANGGAL BERLAKU</TableHead>
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
                      <div className="font-semibold">{row.perusahaan}</div>
                      <div className="text-xs text-muted-foreground">
                        ({row.perusahaanAlt || ''})
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[520px]">
                      {row.izinLayanan}
                    </TableCell>
                    <TableCell>{row.nomorSKLO}</TableCell>
                    <TableCell>{row.tanggalBerlaku}</TableCell>
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