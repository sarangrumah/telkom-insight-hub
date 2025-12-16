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

type PenomoranStatus = 'Aktif' | 'Idle' | 'Nonaktif';

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
}

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
  const [data, setData] = useState<PenomoranRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Fetch Penomoran data from API
  const fetchPenomoranData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tarif?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: PenomoranApiResponse = await response.json();
      
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch Penomoran data:', err);
      setError('Failed to load Penomoran data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchPenomoranData();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => data.slice(start, end), [data, start, end]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPenomoranData();
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
            Tabel data penomoran telekomunikasi dari database
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