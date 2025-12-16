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
import { Eye, RotateCcw } from 'lucide-react';

interface ISRRecord {
  id: string; // Changed from number to string as it's a UUID
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

interface ISRResponse {
  data: ISRRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Remove the duplicate useEffect import from the middle of the file
// useEffect is already imported at the top with other React hooks

export default function ISRPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ISRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Fetch ISR data from API
  const fetchISRData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/isr?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ISRResponse = await response.json();
      
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch ISR data:', err);
      setError('Failed to load ISR data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when pagination changes
  useEffect(() => {
    fetchISRData();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => data.slice(start, end), [data, start, end]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchISRData();
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
            Tabel data Izin Stasiun Radio dari database
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