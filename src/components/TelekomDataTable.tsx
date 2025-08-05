import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreHorizontal, File, Download, Eye, FileText, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddEditTelekomDataDialog } from "./AddEditTelekomDataDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { PDFPreviewModal } from "./PDFPreviewModal";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TelekomData = Database["public"]["Tables"]["telekom_data"]["Row"];

interface TelekomDataTableProps {
  data: TelekomData[];
  onDataChange: () => void;
  userRole: string;
  userId?: string;
}

export const TelekomDataTable = ({ data, onDataChange, userRole, userId }: TelekomDataTableProps) => {
  const [editingData, setEditingData] = useState<TelekomData | null>(null);
  const [deletingData, setDeletingData] = useState<TelekomData | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const canEdit = (item: TelekomData) => {
    if (userRole === 'super_admin' || userRole === 'internal_admin' || userRole === 'pengolah_data') {
      return true;
    }
    if (userRole === 'pelaku_usaha' && item.created_by === userId) {
      return true;
    }
    return false;
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getServiceTypeBadge = (serviceType: string) => {
    const colors = {
      'jasa': 'bg-blue-500',
      'jaringan': 'bg-green-500',
      'telekomunikasi_khusus': 'bg-purple-500',
      'isr': 'bg-orange-500',
      'tarif': 'bg-yellow-500',
      'sklo': 'bg-red-500',
      'lko': 'bg-indigo-500'
    };
    
    const labels = {
      'jasa': 'Jasa',
      'jaringan': 'Jaringan',
      'telekomunikasi_khusus': 'Telekomunikasi Khusus',
      'isr': 'ISR',
      'tarif': 'Tarif',
      'sklo': 'SKLO',
      'lko': 'LKO'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${colors[serviceType as keyof typeof colors] || 'bg-gray-500'} text-white border-0`}
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
        <p className="text-muted-foreground">No telecommunications data found</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first entry to get started</p>
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
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.company_name}</TableCell>
                <TableCell>{getServiceTypeBadge(item.service_type)}</TableCell>
                <TableCell>
                  {item.sub_service_type ? (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={item.sub_service_type}>
                      {item.sub_service_type}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell>{item.license_number || 'N/A'}</TableCell>
                <TableCell>
                  {(item as any).province?.name || item.region || 'N/A'}
                </TableCell>
                <TableCell>
                  {(item as any).kabupaten ? 
                    `${(item as any).kabupaten.name} (${(item as any).kabupaten.type})` : 
                    'N/A'
                  }
                </TableCell>
                <TableCell>{getStatusBadge(item.status || 'active')}</TableCell>
                <TableCell>
                  {item.license_date ? format(new Date(item.license_date), 'MMM dd, yyyy') : 'N/A'}
                </TableCell>
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
                              {format(new Date(item.created_at), 'MMM dd')}
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
                <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {canEdit(item) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingData(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingData(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddEditTelekomDataDialog
        open={!!editingData}
        onOpenChange={(open) => !open && setEditingData(null)}
        data={editingData}
        onSuccess={() => {
          setEditingData(null);
          onDataChange();
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingData}
        onOpenChange={(open) => !open && setDeletingData(null)}
        data={deletingData}
        onSuccess={() => {
          setDeletingData(null);
          onDataChange();
        }}
      />

      <PDFPreviewModal
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || ""}
        fileName={previewFile?.name || ""}
      />
    </>
  );
};