import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TelekomDataTable } from "@/components/TelekomDataTable";
import { AddEditTelekomDataDialog } from "@/components/AddEditTelekomDataDialog";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TelekomData = Database["public"]["Tables"]["telekom_data"]["Row"];

const DataManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<TelekomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleData) {
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: telekomData, error } = await supabase
        .from('telekom_data')
        .select('*')
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

  const canAddData = userRole === 'pelaku_usaha' || userRole === 'super_admin' || userRole === 'internal_admin' || userRole === 'pengolah_data';

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
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Manage telecommunications data entries
          </p>
        </div>
        {canAddData && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Data
          </Button>
        )}
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
    </div>
  );
};

export default DataManagement;