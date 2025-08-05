import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, UserPlus, Settings } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  is_validated: boolean;
  created_at: string;
  roles: string[];
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'super_admin' | 'internal_admin' | 'pelaku_usaha' | 'pengolah_data' | 'internal_group' | 'guest' | ''>('');
  
  const queryClient = useQueryClient();

  // Fetch all users with their profiles and roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            roles: roles?.map(r => r.role) || []
          };
        })
      );

      return usersWithRoles;
    }
  });

  // Toggle user validation
  const toggleValidationMutation = useMutation({
    mutationFn: async ({ userId, isValidated }: { userId: string; isValidated: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_validated: !isValidated })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User validation status updated');
    },
    onError: () => {
      toast.error('Failed to update user validation');
    }
  });

  // Assign role to user
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'super_admin' | 'internal_admin' | 'pelaku_usaha' | 'pengolah_data' | 'internal_group' | 'guest' }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role assigned successfully');
      setIsRoleDialogOpen(false);
      setNewRole('');
    },
    onError: () => {
      toast.error('Failed to assign role');
    }
  });

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'super_admin' | 'internal_admin' | 'pelaku_usaha' | 'pengolah_data' | 'internal_group' | 'guest' }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove role');
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as any);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'internal_admin': return 'default';
      case 'pengolah_data': return 'secondary';
      case 'pelaku_usaha': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users & Roles</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="internal_admin">Internal Admin</SelectItem>
                <SelectItem value="pengolah_data">Data Processor</SelectItem>
                <SelectItem value="pelaku_usaha">Business User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Validated</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.company_name || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role} 
                            variant={getRoleBadgeVariant(role)}
                            className="text-xs cursor-pointer"
                            onClick={() => removeRoleMutation.mutate({ userId: user.user_id, role })}
                            title="Click to remove role"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_validated}
                        onCheckedChange={() => 
                          toggleValidationMutation.mutate({ 
                            userId: user.user_id, 
                            isValidated: user.is_validated 
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog open={isRoleDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsRoleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Role to {user.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Select Role</Label>
                              <Select value={newRole} onValueChange={(value) => setNewRole(value as any)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                  <SelectItem value="internal_admin">Internal Admin</SelectItem>
                                  <SelectItem value="pengolah_data">Data Processor</SelectItem>
                                  <SelectItem value="pelaku_usaha">Business User</SelectItem>
                                  <SelectItem value="guest">Guest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={() => newRole && assignRoleMutation.mutate({ userId: user.user_id, role: newRole as any })}
                              disabled={!newRole || user.roles.includes(newRole)}
                              className="w-full"
                            >
                              Assign Role
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}