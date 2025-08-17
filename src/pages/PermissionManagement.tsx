import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Shield, Save, RefreshCw } from "lucide-react";

interface Module {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Permission {
  id: string;
  role: string;
  module_id: string;
  module_code: string;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'internal_admin', label: 'Internal Admin' },
  { value: 'pengolah_data', label: 'Data Processor' },
  { value: 'pelaku_usaha', label: 'Business User' },
  { value: 'internal_group', label: 'Internal Group' },
  { value: 'guest', label: 'Guest' },
];

const PermissionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('pelaku_usaha');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions();
    }
  }, [selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load modules data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select(`
          *,
          modules!inner(code, name)
        `)
        .eq('role', selectedRole as any)
        .is('field_id', null);

      if (error) throw error;

      const formattedPermissions = (data || []).map(p => ({
        id: p.id,
        role: p.role,
        module_id: p.module_id,
        module_code: (p.modules as any).code,
        module_name: (p.modules as any).name,
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
      }));

      setPermissions(formattedPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handlePermissionChange = (moduleId: string, action: string, value: boolean) => {
    setPermissions(prev => prev.map(p => 
      p.module_id === moduleId 
        ? { ...p, [action]: value }
        : p
    ));
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      
      const updates = permissions.map(p => ({
        id: p.id,
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('permissions')
          .update(update)
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-red-500',
      internal_admin: 'bg-orange-500',
      pengolah_data: 'bg-blue-500',
      pelaku_usaha: 'bg-green-500',
      internal_group: 'bg-purple-500',
      guest: 'bg-gray-500',
    };

    return (
      <Badge className={`${colors[role as keyof typeof colors]} text-white`}>
        {ROLES.find(r => r.value === role)?.label}
      </Badge>
    );
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
    <PermissionGuard 
      moduleCode="user_management" 
      action="update"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-muted-foreground">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">You don't have permission to manage permissions.</p>
          </div>
        </div>
      }
      showFallback
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
            <p className="text-muted-foreground">
              Configure role-based permissions for modules and actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPermissions}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={savePermissions} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions Matrix
            </CardTitle>
            <CardDescription>
              Select a role and configure permissions for each module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-64 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Permissions for {getRoleBadge(selectedRole)}
              </h3>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Create</TableHead>
                    <TableHead className="text-center">Read</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => {
                    const permission = permissions.find(p => p.module_id === module.id);
                    
                    return (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {module.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_create || false}
                            onCheckedChange={(value) => 
                              handlePermissionChange(module.id, 'can_create', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_read || false}
                            onCheckedChange={(value) => 
                              handlePermissionChange(module.id, 'can_read', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_update || false}
                            onCheckedChange={(value) => 
                              handlePermissionChange(module.id, 'can_update', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_delete || false}
                            onCheckedChange={(value) => 
                              handlePermissionChange(module.id, 'can_delete', value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default PermissionManagement;