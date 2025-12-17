import { useMemo, useState, useEffect } from 'react';
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
  id: string; // Changed from number to string as it's a UUID
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

interface JaringanApiResponse {
  data: JaringanRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

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

const PAGE_SIZES = [10, 20, 50];

export default function JaringanPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<JaringanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Fetch Jaringan data from API
  const fetchJaringanData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/panel/api/jaringan?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: JaringanApiResponse = await response.json();
      
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch Jaringan data:', err);
      setError('Failed to load Jaringan data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchJaringanData();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => data.slice(start, end), [data, start, end]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJaringanData();
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
            Tabel data jaringan telekomunikasi dari database
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