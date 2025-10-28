import { useEffect, useMemo, useState } from 'react';
import { getTarifRows, type TarifRow, type PelaporanStatus } from '@/lib/tarifData';
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

/* Data sekarang di-load dari JSON melalui getTarifRows di src/lib/tarifData.ts */

function EmailCell({ email, status }: { email: string; status: string }) {
  const s = (status || '').toLowerCase();
  const color = s.includes('sudah') ? 'text-emerald-600' : 'text-muted-foreground';
  const label = s || 'status tidak diketahui';
  return (
    <div className="space-y-1">
      <div className="font-medium break-all">{email}</div>
      <div className={`text-xs ${color}`}>({label})</div>
    </div>
  );
}

function JenisKategoriCell({ jenis, sub }: { jenis: string; sub: string }) {
  return (
    <div className="space-y-1">
      <div>{jenis}</div>
      <div className="text-xs text-muted-foreground">( {sub} )</div>
    </div>
  );
}

function StatusLabel({ value }: { value: PelaporanStatus }) {
  const cls =
    value === 'Sudah Melaporkan'
      ? 'text-emerald-600'
      : 'text-rose-600';
  return <span className={`font-medium ${cls}`}>{value}</span>;
}

const PAGE_SIZES = [10, 20, 50];

export default function TarifPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<TarifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getTarifRows();
        if (active) {
          setRows(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Gagal memuat data tarif:', err);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => rows.slice(start, end), [rows, start, end]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getTarifRows();
      setRows(data);
    } catch (err) {
      console.error('Gagal refresh data tarif:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarif</h1>
          <p className="text-muted-foreground">
            Daftar pelaporan tarif penyelenggara telekomunikasi
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
          <CardTitle>Data Pelaporan Tarif</CardTitle>
          <CardDescription>
            Data diambil dari sumber JSON dan mendukung pagination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>PENYELENGGARA</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>TANGGAL</TableHead>
                  <TableHead>JENIS LAPORAN</TableHead>
                  <TableHead>JENIS LAPORAN</TableHead>
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
                    </TableCell>
                    <TableCell>{row.pic}</TableCell>
                    <TableCell className="max-w-[320px]">
                      <EmailCell email={row.email} status={row.statusEmail} />
                    </TableCell>
                    <TableCell>{row.tanggal || '-'}</TableCell>
                    <TableCell className="max-w-[260px]">
                      <JenisKategoriCell jenis={row.jenis} sub={row.sub} />
                    </TableCell>
                    <TableCell>{row.periode}</TableCell>
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