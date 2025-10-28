import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  Edit,
  Trash2,
  MoreHorizontal,
  File,
  Download,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddEditTelekomDataDialog } from './AddEditTelekomDataDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { PDFPreviewModal } from './PDFPreviewModal';
import { TableActionButton } from './TableActionButton';
import { ConditionalField } from './PermissionGuard';
import { format } from 'date-fns';
// Lightweight type representing the shape returned by backend list endpoint.
// Using index signature to avoid tight coupling while ensuring known fields.
interface TelekomData {
  id: string;
  company_name: string;
  status?: string | null;
  license_date?: string | null;
  license_number?: string | null;
  region?: string | null;
  service_type?: string | null;
  sub_service_type?: string | null;
  sub_service?: {
    id: string;
    name: string;
    service?: { id: string; name: string; code?: string | null } | null;
  } | null;
  file_url?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  province_id?: string | null;
  kabupaten_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  province?: { id: string; name: string } | null;
  kabupaten?: { id: string; name: string; type?: string } | null;
  [key: string]: unknown; // allow future extension
}

interface TelekomDataTableProps {
  data: TelekomData[];
  onDataChange: () => void;
  userRole: string;
  userId?: string;
}

export const TelekomDataTable = ({
  data,
  onDataChange,
  userRole,
  userId,
}: TelekomDataTableProps) => {
  const [editingData, setEditingData] = useState<TelekomData | null>(null);
  const [deletingData, setDeletingData] = useState<TelekomData | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const safeFormatDate = (
    value: string | Date | null | undefined,
    pattern = 'MMM dd, yyyy'
  ) => {
    if (!value) return 'N/A';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return 'N/A';
    try {
      return format(d, pattern);
    } catch {
      return 'N/A';
    }
  };

  // Remove hard-coded permission logic - now handled by TableActionButton

  const getStatusBadge = (status: string) => {
    const variant =
      status === 'active'
        ? 'default'
        : status === 'inactive'
        ? 'secondary'
        : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getServiceTypeBadge = (serviceType: string) => {
    const colors = {
      jasa: 'bg-blue-500',
      jaringan: 'bg-green-500',
      telekomunikasi_khusus: 'bg-purple-500',
      isr: 'bg-orange-500',
      tarif: 'bg-yellow-500',
      sklo: 'bg-red-500',
      lko: 'bg-indigo-500',
    };

    const labels = {
      jasa: 'Jasa',
      jaringan: 'Jaringan',
      telekomunikasi_khusus: 'Telekomunikasi Khusus',
      isr: 'ISR',
      tarif: 'Tarif',
      sklo: 'SKLO',
      lko: 'LKO',
    };

    return (
      <Badge
        variant="outline"
        className={`${
          colors[serviceType as keyof typeof colors] || 'bg-gray-500'
        } text-white border-0`}
      >
        {labels[serviceType as keyof typeof labels] || serviceType}
      </Badge>
    );
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('-').slice(1).join('-'); // Remove timestamp prefix
  };

  const handlePreview = (fileUrl: string) => {
    const fileName = getFileName(fileUrl);
    setPreviewFile({ url: fileUrl, name: fileName });
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No telecommunications data found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first entry to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Sub Service</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Kabupaten/Kota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>License Date</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.id}>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="company_name"
                >
                  <TableCell className="font-medium">
                    {item.company_name}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="service_type"
                >
                  <TableCell>
                    {getServiceTypeBadge(item.service_type)}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="sub_service_type"
                >
                  <TableCell>
                    {item.sub_service_type ? (
                      <span
                        className="text-sm text-muted-foreground truncate max-w-[200px] block"
                        title={item.sub_service_type}
                      >
                        {item.sub_service_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="license_number"
                >
                  <TableCell>{item.license_number || 'N/A'}</TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="province_id"
                >
                  <TableCell>
                    {item.province?.name || item.region || 'N/A'}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="kabupaten_id"
                >
                  <TableCell>
                    {item.kabupaten
                      ? `${item.kabupaten.name}${
                          item.kabupaten.type ? ` (${item.kabupaten.type})` : ''
                        }`
                      : 'N/A'}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="status"
                >
                  <TableCell>
                    {getStatusBadge(item.status || 'active')}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="license_date"
                >
                  <TableCell>{safeFormatDate(item.license_date)}</TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="file_url"
                >
                  <TableCell>
                    {item.file_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-md">
                            <FileText className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate max-w-[120px]">
                              {getFileName(item.file_url)}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <File className="h-3 w-3" />
                                PDF Document
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {safeFormatDate(item.created_at, 'MMM dd')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(item.file_url!)}
                            className="h-8 px-3 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDownload(item.file_url!)}
                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                          <File className="h-4 w-4" />
                        </div>
                        <span className="text-sm">No document</span>
                      </div>
                    )}
                  </TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="created_at"
                >
                  <TableCell>{safeFormatDate(item.created_at)}</TableCell>
                </ConditionalField>
                <ConditionalField
                  moduleCode="data_management"
                  fieldCode="updated_at"
                >
                  <TableCell>{safeFormatDate(item.updated_at)}</TableCell>
                </ConditionalField>
                <TableCell>
                  <TableActionButton
                    moduleCode="data_management"
                    recordId={item.id}
                    userId={userId}
                    createdBy={item.created_by || ''}
                    onEdit={() => setEditingData(item)}
                    onDelete={() => setDeletingData(item)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddEditTelekomDataDialog
        open={!!editingData}
        onOpenChange={open => !open && setEditingData(null)}
        data={editingData}
        onSuccess={() => {
          setEditingData(null);
          onDataChange();
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingData}
        onOpenChange={open => !open && setDeletingData(null)}
        data={deletingData}
        onSuccess={() => {
          setDeletingData(null);
          onDataChange();
        }}
      />

      <PDFPreviewModal
        open={!!previewFile}
        onOpenChange={open => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || ''}
        fileName={previewFile?.name || ''}
      />
    </>
  );
};
