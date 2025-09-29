import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { TelekomDataTable } from '@/components/TelekomDataTable';
import { AddEditTelekomDataDialog } from '@/components/AddEditTelekomDataDialog';
import { ExcelImportDialog } from '@/components/ExcelImportDialog';
import { ExcelExportButton } from '@/components/ExcelExportButton';
import { LocationMigration } from '@/components/LocationMigration';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTelekomDataList } from '@/hooks/useTelekomData';
import type { TelekomDataRecord } from '@/hooks/useTelekomData';
import { useLocationData } from '@/hooks/useLocationData';

const DataManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    canCreate,
    canRead,
    canAccessModule,
    loading: permissionsLoading,
  } = usePermissions('data_management');

  // Filters & pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [kabupatenFilter, setKabupatenFilter] = useState<string>('all');

  // Province/Kabupaten sources
  const { provinces, allKabupaten } = useLocationData();
  const kabupatenOptions = useMemo(
    () =>
      provinceFilter !== 'all'
        ? allKabupaten.filter(k => k.province_id === provinceFilter)
        : allKabupaten,
    [allKabupaten, provinceFilter]
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when filters change (except page/pageSize)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, serviceTypeFilter, provinceFilter, kabupatenFilter]);

  const {
    data: listResp,
    isLoading: listLoading,
    isError,
    error,
    refetch,
  } = useTelekomDataList(
    {
      page,
      pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      service_type: serviceTypeFilter !== 'all' ? serviceTypeFilter : undefined,
      province_id: provinceFilter !== 'all' ? provinceFilter : undefined,
      kabupaten_id: kabupatenFilter !== 'all' ? kabupatenFilter : undefined,
    },
    true
  );
  const data = (listResp?.data || []) as TelekomDataRecord[];
  const total = listResp?.total ?? data.length;
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total || 0);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setServiceTypeFilter('all');
    setProvinceFilter('all');
    setKabupatenFilter('all');
    setPage(1);
  };
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  // Role resolution placeholder: backend should embed roles in user profile (already available via useAuth.user?.roles)
  // Fallback to first role or guest
  if (!userRole && user?.roles && user.roles.length > 0) {
    setUserRole(user.roles[0]);
  }

  // Use permission system for data access control
  const canAddData = canCreate('data_management');
  const canViewData = canRead('data_management');
  const hasModuleAccess = canAccessModule('data_management');

  console.log('Permission checks:', {
    canAddData,
    canViewData,
    hasModuleAccess,
    userRole,
  });

  if (listLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">
          Failed to load data{error?.message ? `: ${error.message}` : ''}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!hasModuleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access this module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Manage telecommunications data entries
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard moduleCode="data_management" action="read">
            <ExcelExportButton />
          </PermissionGuard>
          <PermissionGuard moduleCode="data_management" action="create">
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              Import Excel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Data
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telecommunications Data</CardTitle>
          <CardDescription>
            View and manage all telecommunications service data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-[260px]">
              <Input
                placeholder="Search company or license..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={serviceTypeFilter}
              onValueChange={v => setServiceTypeFilter(v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                <SelectItem value="jasa">Jasa</SelectItem>
                <SelectItem value="jaringan">Jaringan</SelectItem>
                <SelectItem value="telekomunikasi_khusus">
                  Telekomunikasi Khusus
                </SelectItem>
                <SelectItem value="isr">ISR</SelectItem>
                <SelectItem value="tarif">Tarif</SelectItem>
                <SelectItem value="sklo">SKLO</SelectItem>
                <SelectItem value="lko">LKO</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={provinceFilter}
              onValueChange={v => {
                setProvinceFilter(v);
                setKabupatenFilter('all');
              }}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {provinces.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={kabupatenFilter}
              onValueChange={v => setKabupatenFilter(v)}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Kabupaten/Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All kabupaten/kota</SelectItem>
                {kabupatenOptions.map(k => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name} {k.type ? `(${k.type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          <TelekomDataTable
            data={data}
            onDataChange={() => refetch()}
            userRole={userRole}
            userId={user?.id}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {total === 0
                ? 'No records found'
                : `Showing ${startItem}–${endItem} of ${total} records`}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={v => {
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
                      onClick={e => {
                        e.preventDefault();
                        setPage(p => Math.max(1, p - 1));
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
                      onClick={e => {
                        e.preventDefault();
                        setPage(p => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddEditTelekomDataDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />

      <ExcelImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => {
          setIsImportDialogOpen(false);
          refetch();
        }}
      />

      {/* Show migration tool for admin users */}
      <PermissionGuard moduleCode="user_management" action="update">
        <div className="flex justify-center">
          <LocationMigration />
        </div>
      </PermissionGuard>
    </div>
  );
};

export default DataManagement;
