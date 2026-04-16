import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface TableActionButtonProps {
  moduleCode: string;
  recordId: string;
  userId?: string;
  createdBy?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  showView?: boolean;
  className?: string;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({
  moduleCode,
  recordId,
  userId,
  createdBy,
  onEdit,
  onDelete,
  onView,
  showView = false,
  className,
}) => {
  const { canUpdate, canDelete, loading } = usePermissions(moduleCode);

  if (loading) {
    return <Button variant="ghost" className="h-8 w-8 p-0" disabled />;
  }

  // Check if user can edit/delete their own records
  const canEditRecord = canUpdate(moduleCode) && (
    userId === createdBy || 
    canUpdate(moduleCode) // Admin users can edit all records
  );

  const canDeleteRecord = canDelete(moduleCode) && (
    userId === createdBy || 
    canDelete(moduleCode) // Admin users can delete all records
  );

  // If no actions available, don't show the button
  if (!canEditRecord && !canDeleteRecord && !showView) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`h-8 w-8 p-0 ${className}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showView && onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {canEditRecord && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canDeleteRecord && onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};