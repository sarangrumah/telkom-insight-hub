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
import { apiFetch } from '@/lib/apiClient';

type SKLOStatus = 'Disetujui' | 'Permohonan Baru' | 'Ditolak' | 'Diproses';

interface SKLORecord {
  id: string; // Changed from number to string as it's a UUID
  perusahaan: string;
  perusahaanAlt?: string; // teks kecil di bawah nama (dalam kurung)
  izinLayanan: string;
  nomorSKLO: string;
  tanggalBerlaku: string;
  status: SKLOStatus;
}

interface SKLOApiResponse {
  data: SKLORecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

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
  const [skloData, setSkloData] = useState<SKLORecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch SKLO data from API
  const fetchSKLOData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data: SKLOApiResponse = await apiFetch(`/panel/api/sklo?page=${page}&pageSize=${pageSize}`);
      
      setSkloData(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch SKLO data:', err);
      setError('Failed to load SKLO data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchSKLOData();
  }, [page, pageSize]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSKLOData();
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  
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
            disabled={refreshing || loading}
            aria-label="Refresh"
            title="Refresh"
          >
            <RotateCcw className={'mr-2 h-4 w-4' + (refreshing || loading ? ' animate-spin' : '')} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data SKLO</CardTitle>
          <CardDescription>
            Tabel data SKLO dari database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 p-2 bg-red-50 rounded-md">
              Error: {error}
            </div>
          )}
          
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : skloData.length > 0 ? (
                  skloData.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">
                        {start + idx - 1}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Menampilkan {total === 0 ? 0 : start}–{end} dari {total} data
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
                      disabled={page === 1}
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
                      disabled={page === totalPages}
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