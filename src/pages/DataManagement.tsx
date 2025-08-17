import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TelekomDataTable } from "@/components/TelekomDataTable";
import { AddEditTelekomDataDialog } from "@/components/AddEditTelekomDataDialog";
import { ExcelImportDialog } from "@/components/ExcelImportDialog";
import { ExcelExportButton } from "@/components/ExcelExportButton";
import { LocationMigration } from "@/components/LocationMigration";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import type { Database } from "@/integrations/supabase/types";

type TelekomData = Database["public"]["Tables"]["telekom_data"]["Row"];

const DataManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCreate, canRead, canAccessModule, loading: permissionsLoading } = usePermissions('data_management');
  const [data, setData] = useState<TelekomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchData();
    fetchUserRole();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('telekom_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telekom_data'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserRole = async () => {
    if (!user?.id) return;
    
    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        // Default to guest role if no role found
        setUserRole('guest');
        return;
      }
      
      if (roleData) {
        setUserRole(roleData.role);
      } else {
        setUserRole('guest');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('guest');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: telekomData, error } = await supabase
        .from('telekom_data')
        .select(`
          *,
          province:provinces(id, name),
          kabupaten:kabupaten(id, name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(telekomData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load telecommunications data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use permission system for data access control
  const canAddData = canCreate('data_management');
  const canViewData = canRead('data_management');
  const hasModuleAccess = canAccessModule('data_management');

  console.log('Permission checks:', { canAddData, canViewData, hasModuleAccess, userRole });

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasModuleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">You don't have permission to access this module.</p>
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
        <CardContent>
          <TelekomDataTable 
            data={data} 
            onDataChange={fetchData}
            userRole={userRole}
            userId={user?.id}
          />
        </CardContent>
      </Card>

      <AddEditTelekomDataDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchData}
      />

      <ExcelImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={fetchData}
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