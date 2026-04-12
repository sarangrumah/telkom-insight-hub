import { useMemo, useState, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { RotateCcw, Search, Database, Globe } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

type PenomoranStatus = string;

interface PenomoranRecord {
  id: string;
  penyelenggara: string;
  nib: string;
  jenisPenyelenggara: string;
  jenis: string;
  jenisKode: string;
  kodeAkses: string;
  nomor: string;
  tanggalPenetapan: string;
  status: PenomoranStatus;
}

interface PenomoranApiResponse {
  data: PenomoranRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  source?: 'etelekomunikasi' | 'local';
}

function StatusBadge({ value }: { value: PenomoranStatus }) {
  const lower = value.toLowerCase();
  const cls =
    lower === 'aktif'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : lower === 'idle'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : lower === 'karantina'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : lower === 'evaluasi' || lower === 'dalam proses'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : lower === 'reserved'
      ? 'bg-gray-100 text-gray-700 border-gray-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  return (
    <Badge variant="outline" className={cls}>
      {value}
    </Badge>
  );
}

function SourceBadge({ source }: { source?: string }) {
  if (source === 'etelekomunikasi') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
        <Globe className="h-3 w-3" />
        e-Telekomunikasi
      </Badge>
    );
  }
  if (source === 'local') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
        <Database className="h-3 w-3" />
        Database Lokal
      </Badge>
    );
  }
  return null;
}

function JenisCell({ jenis, kode }: { jenis: string; kode: string }) {
  return (
    <div className="space-y-1">
      <div>{jenis}</div>
      {kode && <div className="text-xs text-muted-foreground">({kode})</div>}
    </div>
  );
}

const PAGE_SIZES = [10, 20, 50, 100];
const STATUS_OPTIONS = ['', 'Aktif', 'Idle', 'Karantina', 'Evaluasi', 'DALAM PROSES', 'Reserved'];

export default function PenomoranPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PenomoranRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [source, setSource] = useState<string | undefined>();

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPenomoranData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      const response = await apiFetch(`/v2/panel/api/penomoran?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: PenomoranApiResponse = await response.json();

      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages || Math.max(1, Math.ceil(result.total / pageSize)));
      setSource(result.source);
    } catch (err) {
      console.error('Failed to fetch Penomoran data:', err);
      setError('Gagal memuat data Penomoran');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchPenomoranData();
  }, [fetchPenomoranData]);

  const start = (page - 1) * pageSize;
  const end = Math.min(start + data.length, total);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPenomoranData();
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penomoran</h1>
          <p className="text-muted-foreground">
            Data kode akses alokasi penomoran telekomunikasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source={source} />
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
          <CardTitle>Data Kode Akses Alokasi</CardTitle>
          <CardDescription>
            Tabel data penomoran telekomunikasi dari e-Telekomunikasi (sumber utama)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Cari kode akses, perusahaan, NIB..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="max-w-sm"
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-1" />
                Cari
              </Button>
            </div>
            <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.filter(Boolean).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>PENYELENGGARA</TableHead>
                  <TableHead>JENIS PENYELENGGARA</TableHead>
                  <TableHead>JENIS PENOMORAN</TableHead>
                  <TableHead>KODE AKSES</TableHead>
                  <TableHead>NOMOR PENETAPAN</TableHead>
                  <TableHead>TANGGAL PENETAPAN</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">
                        {start + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{row.penyelenggara}</div>
                        {row.nib && (
                          <div className="text-xs text-muted-foreground">
                            NIB: {row.nib}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap">
                        {row.jenisPenyelenggara || ''}
                      </TableCell>
                      <TableCell className="max-w-[420px]">
                        <JenisCell jenis={row.jenis} kode={row.jenisKode} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">{row.kodeAkses}</span>
                      </TableCell>
                      <TableCell>{row.nomor}</TableCell>
                      <TableCell>{row.tanggalPenetapan}</TableCell>
                      <TableCell>
                        <StatusBadge value={row.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
