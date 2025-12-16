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
  id: string; // Changed from number to string as it's a UUID
  penyelenggara: string;
  nib: string;
  alamat: string;
  alamatKorespondensi: string;
  tahun: string;
  status: LKOStatus;
}

interface LKOApiResponse {
  data: LKORecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Removed hardcoded DUMMY_DATA array - will fetch from API instead

function StatusLabel({ value }: { value: LKOStatus }) {
  const cls = value === 'Sudah menyampaikan' ? 'text-emerald-600' : 'text-rose-600';
  return <span className={`font-medium ${cls}`}>{value}</span>;
}

const PAGE_SIZES = [10, 20, 50];

export default function LKOPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LKORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Fetch LKO data from API
  const fetchLKOData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/lko?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: LKOApiResponse = await response.json();
      
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch LKO data:', err);
      setError('Failed to load LKO data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchLKOData();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => data.slice(start, end), [data, start, end]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLKOData();
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
            Tabel data Laporan Kegiatan Operasional dari database
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