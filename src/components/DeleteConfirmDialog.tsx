import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeleteTelekomData } from '@/hooks/useTelekomData';

interface TelekomDataMinimal {
  id: string;
  company_name: string;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TelekomDataMinimal | null;
  onSuccess: () => void;
}

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  data,
  onSuccess,
}: DeleteConfirmDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const deleteMutation = useDeleteTelekomData();

  const handleDelete = async () => {
    if (!data) return;

    setLoading(true);
    try {
      await deleteMutation.mutateAsync(data.id);
      toast({
        title: 'Success',
        description: 'Telecommunications data deleted successfully',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting data:', error);
      let message = 'Failed to delete telecommunications data';
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            telecommunications data entry for{' '}
            <strong>{data?.company_name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading || deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
