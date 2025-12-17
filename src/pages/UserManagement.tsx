import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, UserPlus, Settings, Edit, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Role =
  | 'super_admin'
  | 'internal_admin'
  | 'pelaku_usaha'
  | 'pengolah_data'
  | 'internal_group'
  | 'guest';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  is_validated: boolean;
  created_at: string;
  roles: Role[];
}

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum([
    'super_admin',
    'internal_admin',
    'pelaku_usaha',
    'pengolah_data',
    'internal_group',
    'guest',
  ]),
});

const editUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<Role | ''>('');

  const queryClient = useQueryClient();

  const createForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      company_name: '',
      phone: '',
      role: 'guest',
    },
  });

  const editForm = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      company_name: '',
      phone: '',
    },
  });

  // Fetch all users with their profiles and roles
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const token = localStorage.getItem('app.jwt.token');
  const authHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const resp = await fetch(`${API_BASE}/panel/api/admin/users`, {
        headers: authHeader(),
      });
      if (!resp.ok) throw new Error('Failed to load users');
      const json = await resp.json();
      return json.users || [];
    },
  });

  // Create new user (save metadata and enforce single role)
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userSchema>) => {
      interface RegisterResponse {
        user?: { id: string };
      }
      // Send metadata to backend so it is saved into public.profiles
      const resp = (await apiFetch('/panel/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          company_name: userData.company_name || null,
          phone: userData.phone || null,
          // context not 'public' here; created by admin, backend will set 'guest' initially
        }),
      })) as RegisterResponse;

      const json = resp;
      const userId = json.user?.id;

      // Replace role to the selected role (if not guest)
      if (userId && userData.role && userData.role !== 'guest') {
        const assignResp = await fetch(`${API_BASE}/panel/api/admin/users/${userId}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ role: userData.role }),
        });
        if (!assignResp.ok) {
          const errJson = await assignResp.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to assign role');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create user: ${msg}`);
    },
  });

  // Update user profile
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: z.infer<typeof editUserSchema>;
    }) => {
      const resp = await fetch(
        `${API_BASE}/panel/api/admin/users/${userId}/profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            full_name: userData.full_name,
            company_name: userData.company_name || null,
            phone: userData.phone || null,
          }),
        }
      );
      if (!resp.ok) throw new Error('Failed to update user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      editForm.reset();
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const resp = await fetch(`${API_BASE}/panel/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Assign role to user
  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role:
        | 'super_admin'
        | 'internal_admin'
        | 'pelaku_usaha'
        | 'pengolah_data'
        | 'internal_group'
        | 'guest';
    }) => {
      const resp = await fetch(`${API_BASE}/panel/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ role }),
      });
      if (!resp.ok) throw new Error('Failed to assign role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role assigned successfully');
      setIsRoleDialogOpen(false);
      setNewRole('');
    },
    onError: () => {
      toast.error('Failed to assign role');
    },
  });

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role:
        | 'super_admin'
        | 'internal_admin'
        | 'pelaku_usaha'
        | 'pengolah_data'
        | 'internal_group'
        | 'guest';
    }) => {
      const resp = await fetch(
        `${API_BASE}/panel/api/admin/users/${userId}/roles/${role}`,
        { method: 'DELETE', headers: authHeader() }
      );
      if (!resp.ok) throw new Error('Failed to remove role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove role');
    },
  });

  // Toggle user validation
  const toggleValidationMutation = useMutation({
    mutationFn: async ({
      userId,
      isValidated,
    }: {
      userId: string;
      isValidated: boolean;
    }) => {
      const resp = await fetch(
        `${API_BASE}/panel/api/admin/users/${userId}/validation`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ is_validated: !isValidated }),
        }
      );
      if (!resp.ok) throw new Error('Failed to update validation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User validation status updated');
    },
    onError: () => {
      toast.error('Failed to update user validation');
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole =
      roleFilter === 'all' || user.roles.includes(roleFilter as Role);

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'internal_admin':
        return 'default';
      case 'pengolah_data':
        return 'secondary';
      case 'pelaku_usaha':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    editForm.reset({
      full_name: user.full_name,
      company_name: user.company_name || '',
      phone: user.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const onCreateSubmit = (data: z.infer<typeof userSchema>) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof editUserSchema>) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        userId: selectedUser.user_id,
        userData: data,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+62 xxx xxx xxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="super_admin">
                            Super Admin
                          </SelectItem>
                          <SelectItem value="internal_admin">
                            Internal Admin
                          </SelectItem>
                          <SelectItem value="pengolah_data">
                            Data Processor
                          </SelectItem>
                          <SelectItem value="pelaku_usaha">
                            Business User
                          </SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                onChange={e => setSearchTerm(e.target.value)}
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
                {filteredUsers?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.company_name || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role)}
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              removeRoleMutation.mutate({
                                userId: user.user_id,
                                role,
                              })
                            }
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
                            isValidated: user.is_validated,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={
                            isRoleDialogOpen && selectedUser?.id === user.id
                          }
                          onOpenChange={setIsRoleDialogOpen}
                        >
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
                              <DialogTitle>
                                Assign Role to {user.full_name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Select Role</Label>
                                <Select
                                  value={newRole}
                                  onValueChange={(value: Role) =>
                                    setNewRole(value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="super_admin">
                                      Super Admin
                                    </SelectItem>
                                    <SelectItem value="internal_admin">
                                      Internal Admin
                                    </SelectItem>
                                    <SelectItem value="pengolah_data">
                                      Data Processor
                                    </SelectItem>
                                    <SelectItem value="pelaku_usaha">
                                      Business User
                                    </SelectItem>
                                    <SelectItem value="guest">Guest</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() =>
                                  newRole &&
                                  assignRoleMutation.mutate({
                                    userId: user.user_id,
                                    role: newRole,
                                  })
                                }
                                disabled={
                                  !newRole || user.roles.includes(newRole)
                                }
                                className="w-full"
                              >
                                Assign Role
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            deleteUserMutation.mutate(user.user_id)
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+62 xxx xxx xxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
