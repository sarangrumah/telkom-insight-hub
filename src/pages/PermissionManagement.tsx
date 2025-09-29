import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Loader2, RefreshCw, Save, Eye, EyeOff } from 'lucide-react';

type AppRole =
  | 'super_admin'
  | 'internal_admin'
  | 'pengolah_data'
  | 'pelaku_usaha'
  | 'internal_group'
  | 'guest';

interface Module {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Field {
  id: string;
  name: string;
  code: string;
  field_type: string;
  is_system_field: boolean;
  module_id: string;
}

interface Permission {
  id: string;
  role: string;
  module_id: string;
  field_id?: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  field_access?: string;
  module?: {
    name: string;
    code: string;
  };
  field?: {
    name: string;
    code: string;
  };
}

interface FieldPermission {
  field_id: string;
  field_name: string;
  field_code: string;
  field_access: 'hidden' | 'read_only' | 'editable';
  is_system_field: boolean;
}

const PermissionManagement: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermission[]>(
    []
  );
  const [selectedRole, setSelectedRole] = useState<AppRole>('super_admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  // Konsistensi: token disimpan sebagai app.jwt.token (lihat useAuth & apiClient)
  const token = localStorage.getItem('app.jwt.token');
  const authHeader = React.useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  interface RawPermission {
    id: string;
    role: string;
    module_id: string;
    field_id?: string | null;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    field_access?: string | null;
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [modulesResp, fieldsResp] = await Promise.all([
        fetch(`${API_BASE}/api/admin/metadata/modules`, {
          headers: authHeader(),
        }),
        fetch(`${API_BASE}/api/admin/metadata/fields`, {
          headers: authHeader(),
        }),
      ]);
      if (!modulesResp.ok) throw new Error('Failed to load modules');
      if (!fieldsResp.ok) throw new Error('Failed to load fields');
      const modulesJson = await modulesResp.json();
      const fieldsJson = await fieldsResp.json();
      setModules(modulesJson.modules || []);
      setFields(fieldsJson.fields || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE, toast, authHeader]);

  const fetchPermissions = useCallback(async () => {
    if (!selectedRole) return;

    try {
      const resp = await fetch(
        `${API_BASE}/api/admin/permissions?role=${selectedRole}`,
        { headers: authHeader() }
      );
      if (!resp.ok) throw new Error('Failed to load permissions');
      const json = await resp.json();
      const all: RawPermission[] = json.permissions || [];
      const modulePerms = all.filter(p => !p.field_id);
      const mapped = modulePerms.map(p => ({
        id: p.id,
        role: p.role,
        module_id: p.module_id,
        field_id: p.field_id || undefined,
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
        field_access: p.field_access || undefined,
        module: undefined,
        field: undefined,
      }));
      setPermissions(mapped);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive',
      });
    }
  }, [API_BASE, selectedRole, toast, authHeader]);

  const fetchFieldPermissions = useCallback(async () => {
    if (!selectedRole) return;

    try {
      const resp = await fetch(
        `${API_BASE}/api/admin/permissions?role=${selectedRole}`,
        { headers: authHeader() }
      );
      if (!resp.ok) throw new Error('Failed to load field permissions');
      const json = await resp.json();
      const all: RawPermission[] = json.permissions || [];
      const fieldPerms = all
        .filter(p => p.field_id)
        .map(fp => {
          const field = fields.find(f => f.id === fp.field_id);
          return {
            field_id: fp.field_id!,
            field_name: field?.name || '',
            field_code: field?.code || '',
            field_access:
              (fp.field_access as 'hidden' | 'read_only' | 'editable') ||
              'read_only',
            is_system_field: field?.is_system_field || false,
          };
        });
      setFieldPermissions(fieldPerms);
    } catch (error) {
      console.error('Error fetching field permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load field permissions',
        variant: 'destructive',
      });
    }
  }, [API_BASE, selectedRole, fields, toast, authHeader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (selectedRole) {
      fetchPermissions();
      fetchFieldPermissions();
    }
  }, [selectedRole, fetchPermissions, fetchFieldPermissions]);

  const handlePermissionChange = (
    moduleId: string,
    permission: keyof Pick<
      Permission,
      'can_create' | 'can_read' | 'can_update' | 'can_delete'
    >,
    value: boolean
  ) => {
    setPermissions(prev =>
      prev.map(p =>
        p.module_id === moduleId ? { ...p, [permission]: value } : p
      )
    );
  };

  const handleFieldPermissionChange = (
    fieldId: string,
    access: 'hidden' | 'read_only' | 'editable'
  ) => {
    setFieldPermissions(prev => {
      const existing = prev.find(fp => fp.field_id === fieldId);
      if (existing) {
        return prev.map(fp =>
          fp.field_id === fieldId ? { ...fp, field_access: access } : fp
        );
      } else {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
          return [
            ...prev,
            {
              field_id: fieldId,
              field_name: field.name,
              field_code: field.code,
              field_access: access,
              is_system_field: field.is_system_field,
            },
          ];
        }
      }
      return prev;
    });
  };

  const savePermissions = async () => {
    try {
      setSaving(true);

      const modulePermissions = permissions.map(p => ({
        role: p.role,
        module_id: p.module_id,
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
      }));
      const fieldPerms = fieldPermissions.map(fp => {
        const field = fields.find(f => f.id === fp.field_id);
        return {
          role: selectedRole,
          module_id: field?.module_id,
          field_id: fp.field_id,
          field_access: fp.field_access,
          can_create: false,
          can_read: fp.field_access !== 'hidden',
          can_update: fp.field_access === 'editable',
          can_delete: false,
        };
      });
      const resp = await fetch(`${API_BASE}/api/admin/permissions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          modulePermissions,
          fieldPermissions: fieldPerms,
        }),
      });
      if (!resp.ok) throw new Error('Failed to save permissions');

      toast({
        title: 'Success',
        description: 'Permissions saved successfully',
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save permissions',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      super_admin: 'bg-red-500 text-white',
      internal_admin: 'bg-orange-500 text-white',
      pengolah_data: 'bg-blue-500 text-white',
      pelaku_usaha: 'bg-green-500 text-white',
      internal_group: 'bg-purple-500 text-white',
      guest: 'bg-gray-500 text-white',
    };

    const roleLabels = {
      super_admin: 'Super Admin',
      internal_admin: 'Internal Admin',
      pengolah_data: 'Data Processor',
      pelaku_usaha: 'Business User',
      internal_group: 'Internal Group',
      guest: 'Guest',
    };

    return (
      <Badge
        className={
          roleColors[role as keyof typeof roleColors] ||
          'bg-gray-500 text-white'
        }
      >
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    );
  };

  const getFieldAccess = (
    fieldId: string
  ): 'hidden' | 'read_only' | 'editable' => {
    const fieldPerm = fieldPermissions.find(fp => fp.field_id === fieldId);
    return fieldPerm?.field_access || 'read_only';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground animate-fade-in">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard moduleCode="user_management" action="update">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Permission Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage module and field-level permissions for different roles
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                fetchData();
                if (selectedRole) {
                  fetchPermissions();
                  fetchFieldPermissions();
                }
              }}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              onClick={savePermissions}
              disabled={saving || !selectedRole}
              size="sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  Configure module and field-level permissions for the selected
                  role
                </CardDescription>
              </div>
              <Select
                value={selectedRole}
                onValueChange={value => setSelectedRole(value as AppRole)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="internal_admin">Internal Admin</SelectItem>
                  <SelectItem value="pengolah_data">Pengolah Data</SelectItem>
                  <SelectItem value="pelaku_usaha">Pelaku Usaha</SelectItem>
                  <SelectItem value="internal_group">Internal Group</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Module Permissions</TabsTrigger>
                <TabsTrigger value="fields">Field Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="modules" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Create</TableHead>
                      <TableHead className="text-center">Read</TableHead>
                      <TableHead className="text-center">Update</TableHead>
                      <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map(module => {
                      const permission = permissions.find(
                        p => p.module_id === module.id
                      );
                      const role = selectedRole;

                      return (
                        <TableRow key={module.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{module.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {module.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(role)}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission?.can_create || false}
                              onCheckedChange={checked =>
                                handlePermissionChange(
                                  module.id,
                                  'can_create',
                                  checked
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission?.can_read || false}
                              onCheckedChange={checked =>
                                handlePermissionChange(
                                  module.id,
                                  'can_read',
                                  checked
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission?.can_update || false}
                              onCheckedChange={checked =>
                                handlePermissionChange(
                                  module.id,
                                  'can_update',
                                  checked
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission?.can_delete || false}
                              onCheckedChange={checked =>
                                handlePermissionChange(
                                  module.id,
                                  'can_delete',
                                  checked
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                {modules.map(module => {
                  const moduleFields = fields.filter(
                    f => f.module_id === module.id
                  );

                  if (moduleFields.length === 0) return null;

                  return (
                    <Card key={module.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <CardDescription>{module.code}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {moduleFields.map(field => {
                            const fieldAccess = getFieldAccess(field.id);

                            return (
                              <div
                                key={field.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium">
                                      {field.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      {field.code}
                                      {field.is_system_field && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          System
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {field.field_type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Select
                                    value={fieldAccess}
                                    onValueChange={(
                                      value: 'hidden' | 'read_only' | 'editable'
                                    ) =>
                                      handleFieldPermissionChange(
                                        field.id,
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hidden">
                                        <div className="flex items-center">
                                          <EyeOff className="h-4 w-4 mr-2" />
                                          Hidden
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="read_only">
                                        <div className="flex items-center">
                                          <Eye className="h-4 w-4 mr-2" />
                                          Read Only
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="editable">
                                        Editable
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default PermissionManagement;
