import { useEffect, useMemo, useState } from 'react';
import { mapRawToRow, type TarifRow, type PelaporanStatus } from '@/lib/tarifData';
import { TarifAPI } from '@/lib/apiClient';
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
import { Input } from '@/components/ui/input';
import { RotateCcw, RefreshCw, Database, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* Data sekarang di-load dari API melalui TarifAPI.getAll di src/lib/apiClient.ts */

// Sync status types
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

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

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  switch (status) {
    case 'syncing':
      return (
        <Badge variant="secondary" className="text-blue-600">
          <Clock className="w-3 h-3 mr-1" />
          Syncing...
        </Badge>
      );
    case 'success':
      return (
        <Badge variant="secondary" className="text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Database className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      );
  }
}

const PAGE_SIZES = [10, 20, 50];

export default function TarifPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<TarifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<{
    totalRecords: number;
    insertedRecords: number;
    updatedRecords: number;
    errorRecords: number;
  } | null>(null);
  
  // New state for year selection and filtering
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PelaporanStatus>('all');
  const [jenisFilter, setJenisFilter] = useState<'all' | 'voice' | 'sms' | 'data' | 'paket'>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await TarifAPI.getAll();
        const rawData = response.data || [];
        const data = mapRawToRow(rawData);
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

  // Filtered rows based on search and filter criteria
  const filteredRows = useMemo(() => {
    let filtered = rows;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.penyelenggara.toLowerCase().includes(term) ||
        row.pic.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.jenis.toLowerCase().includes(term) ||
        row.sub.toLowerCase().includes(term) ||
        (row.tanggal && row.tanggal.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(row => row.status === statusFilter);
    }
    
    // Apply jenis filter
    if (jenisFilter !== 'all') {
      filtered = filtered.filter(row =>
        row.jenis.toLowerCase().includes(jenisFilter)
      );
    }
    
    return filtered;
  }, [rows, searchTerm, statusFilter, jenisFilter]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, jenisFilter]);
  
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = useMemo(() => filteredRows.slice(start, end), [filteredRows, start, end]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await TarifAPI.getAll();
      const rawData = response.data || [];
      const data = mapRawToRow(rawData);
      setRows(data);
    } catch (err) {
      console.error('Gagal refresh data tarif:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch('/v2/panel/api/kominfo-sync/sync/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tahun: selectedYear,
          periode: 'bulanan'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus('success');
        setSyncStats(result.data);
        setLastSyncTime(new Date().toLocaleString('id-ID'));
        toast.success('Data berhasil disinkronkan dari Kominfo API');
        
        // Refresh data after successful sync
        await handleRefresh();
        
        // Reset status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        toast.error('Gagal menyinkronkan data: ' + result.message);
        
        // Reset status after 5 seconds
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync error:', error);
      toast.error('Terjadi kesalahan saat sinkronisasi data');
      
      // Reset status after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000);
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
        <div className="flex gap-2 items-center">
          <SyncStatusBadge status={syncStatus} />
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
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
          <Button
            variant="default"
            onClick={handleManualSync}
            disabled={syncStatus === 'syncing'}
            aria-label="Manual Sync"
            title="Sinkronisasi manual dengan Kominfo API"
          >
            <RefreshCw className={'mr-2 h-4 w-4' + (syncStatus === 'syncing' ? ' animate-spin' : '')} />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Manual'}
          </Button>
        </div>
      </div>

      {/* Sync Statistics */}
      {syncStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last Sync Results</CardTitle>
            <CardDescription>
              Sync completed at {lastSyncTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStats.totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncStats.insertedRecords}</div>
                <div className="text-sm text-muted-foreground">Inserted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{syncStats.updatedRecords}</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{syncStats.errorRecords}</div>
                <div className="text-sm text-2xl font-bold text-red-600">{syncStats.errorRecords}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Pelaporan Tarif</CardTitle>
          <CardDescription>
            Data diambil dari sumber API dan mendukung pagination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: 'all' | PelaporanStatus) => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Sudah Melaporkan">Sudah Melaporkan</SelectItem>
                  <SelectItem value="Belum Melaporkan">Belum Melaporkan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jenisFilter} onValueChange={(value: 'all' | 'voice' | 'sms' | 'data' | 'paket') => setJenisFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Jenis Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="paket">Paket</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setJenisFilter('all');
                  setPage(1);
                }}
                title="Clear filters"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredRows.length} of {rows.length} records
            </div>
          </div>

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
              Menampilkan {filteredRows.length === 0 ? 0 : start + 1}–{end} dari {filteredRows.length} data
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