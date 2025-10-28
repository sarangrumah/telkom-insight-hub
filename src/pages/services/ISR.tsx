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
import { Eye, RotateCcw } from 'lucide-react';

interface ISRRecord {
  id: number;
  penyelenggara: string;
  nib: string; // tampil kecil pada baris kedua
  layanan: string;
  stasiun: string;
  area: string;
  frequency: string;
  koordinat: string; // "lat, lon"
  tanggalIzin: string;
  tanggalValid: string;
}

// Contoh 5 data dasar + 15 data ter-generate untuk total 20
const DUMMY_DATA: ISRRecord[] = (() => {
  const base: ISRRecord[] = [
    {
      id: 1,
      penyelenggara: 'PT SATELITA NUSANTARA',
      nib: '9120309763416',
      layanan: 'Stasiun Bumi VSAT',
      stasiun: 'Earth Station',
      area: 'Jakarta Pusat',
      frequency: '14.25 GHz',
      koordinat: '-6.2000, 106.8166',
      tanggalIzin: '02 Jan 2024',
      tanggalValid: '02 Jan 2025',
    },
    {
      id: 2,
      penyelenggara: 'PT GARUDA LINK',
      nib: '9120001172944',
      layanan: 'Mikrogelombang Terestrial',
      stasiun: 'Repeater',
      area: 'Bandung',
      frequency: '7.5 GHz',
      koordinat: '-6.9175, 107.6191',
      tanggalIzin: '15 Feb 2024',
      tanggalValid: '15 Feb 2025',
    },
    {
      id: 3,
      penyelenggara: 'PT ANDALAN CYBERINDO',
      nib: '8120312071474',
      layanan: 'Telemetri',
      stasiun: 'Base Station',
      area: 'Surabaya',
      frequency: '410 MHz',
      koordinat: '-7.2575, 112.7521',
      tanggalIzin: '10 Mar 2024',
      tanggalValid: '10 Mar 2025',
    },
    {
      id: 4,
      penyelenggara: 'PT BORNEO DATA',
      nib: '2803230056199',
      layanan: 'Radio Komunikasi Maritim',
      stasiun: 'Coastal Station',
      area: 'Balikpapan',
      frequency: '156.8 MHz',
      koordinat: '-1.2635, 116.8279',
      tanggalIzin: '28 Mar 2024',
      tanggalValid: '28 Mar 2025',
    },
    {
      id: 5,
      penyelenggara: 'PT PAPUA DIGITAL',
      nib: '9120502762746',
      layanan: 'Radio Trunking',
      stasiun: 'Repeater',
      area: 'Jayapura',
      frequency: '450 MHz',
      koordinat: '-2.5916, 140.6690',
      tanggalIzin: '30 Apr 2024',
      tanggalValid: '30 Apr 2025',
    },
  ];

  const names = [
    'PT NUSANTARA HUB',
    'PT SUMATERA TELEMEDIA',
    'PT BALI NUSA NET',
    'PT CELEBES LINK',
    'PT JAWA MEDIA',
    'PT METRO CIPTA DATA',
    'PT SINERGI TELEMATIKA',
    'PT MAJU MUNDUR NET',
    'PT QUATTRO INTERNATIONAL',
    'PT ANGKASA PERSADA NUSANTARA',
    'PT PRIMA KOM',
    'PT GARUDA NET SOLUSI',
    'PT SAMUDRA DIGITAL',
    'PT GLOBAL NUSANTARA LINK',
    'PT BORNEO ENERGI DATA',
  ];
  const layanan = [
    'Stasiun Bumi VSAT',
    'Mikrogelombang Terestrial',
    'Radio Trunking',
    'Telemetri',
  ];
  const stasiun = ['Earth Station', 'Base Station', 'Repeater'];
  const area = [
    'Medan',
    'Padang',
    'Palembang',
    'Semarang',
    'Yogyakarta',
    'Malang',
    'Denpasar',
    'Makassar',
    'Manado',
    'Pontianak',
    'Samarinda',
    'Banjarmasin',
    'Pekanbaru',
    'Balikpapan',
    'Mataram',
  ];
  const freqs = ['2.4 GHz', '5.8 GHz', '7.5 GHz', '410 MHz', '450 MHz', '14.25 GHz'];

  const extras: ISRRecord[] = [];
  for (let i = 0; i < 15; i++) {
    const idx = i % names.length;
    const lat = (-11 + Math.random() * 16).toFixed(4); // approx Indonesia lat range
    const lon = (95 + Math.random() * 25).toFixed(4); // approx Indonesia lon range
    const day = String(5 + (i % 24)).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[i % 12];
    extras.push({
      id: 6 + i,
      penyelenggara: names[idx],
      nib: String(9120316012345000 + i + 1),
      layanan: layanan[i % layanan.length],
      stasiun: stasiun[i % stasiun.length],
      area: area[i % area.length],
      frequency: freqs[i % freqs.length],
      koordinat: `${lat}, ${lon}`,
      tanggalIzin: `${day} ${month} 2024`,
      tanggalValid: `${day} ${month} 2025`,
    });
  }
  return [...base, ...extras];
})();

const PAGE_SIZES = [10, 20, 50];

export default function ISRPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">ISR</h1>
          <p className="text-muted-foreground">
            Daftar perizinan ISR (Izin Stasiun Radio)
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
          <CardTitle>Data ISR</CardTitle>
          <CardDescription>
            Tabel dengan 20 data dummy untuk uji pagination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">ACTION</TableHead>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>PENYELENGGARA</TableHead>
                  <TableHead>LAYANAN</TableHead>
                  <TableHead>STASIUN</TableHead>
                  <TableHead>AREA</TableHead>
                  <TableHead>FREQUENCY</TableHead>
                  <TableHead>KOORDINAT</TableHead>
                  <TableHead>TANGGAL IZIN</TableHead>
                  <TableHead>TANGGAL VALID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => console.log('view', row.id)}
                        aria-label="Lihat detail"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {start + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{row.penyelenggara}</div>
                      <div className="text-xs text-muted-foreground">({row.nib})</div>
                    </TableCell>
                    <TableCell className="max-w-[320px]">{row.layanan}</TableCell>
                    <TableCell>{row.stasiun}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>{row.frequency}</TableCell>
                    <TableCell>{row.koordinat}</TableCell>
                    <TableCell>{row.tanggalIzin}</TableCell>
                    <TableCell>{row.tanggalValid}</TableCell>
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