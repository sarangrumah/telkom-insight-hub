import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle,
  Settings2, Play, Loader2, Globe, Database, Radio, FileText, BarChart3, Plug,
  Plus, Trash2, Eye, EyeOff
} from 'lucide-react';

interface Integration {
  id: string;
  system_name: string;
  display_name: string | null;
  description: string | null;
  adapter_class: string;
  api_base_url: string | null;
  auth_type: string | null;
  auth_config: Record<string, string> | null;
  sync_interval_minutes: number;
  is_active: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_record_count: number | null;
  last_error_message: string | null;
}

// Fallback icon mapping by system_name
const ICON_MAP: Record<string, typeof Globe> = {
  etelekomunikasi: Globe,
  bps: BarChart3,
  kominfo_tarif: FileText,
  oss: Database,
  postel: FileText,
  sdppi: Radio,
};

function getIcon(systemName: string) {
  return ICON_MAP[systemName] || Plug;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary">Never synced</Badge>;
  switch (status) {
    case 'success':
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case 'running':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
    case 'not_configured':
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Not configured</Badge>;
    case 'delegated':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Delegated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Auth config fields component
function AuthConfigFields({
  authType,
  authConfig,
  onChange,
}: {
  authType: string;
  authConfig: Record<string, string>;
  onChange: (config: Record<string, string>) => void;
}) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const toggleVisibility = (field: string) => {
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    onChange({ ...authConfig, [field]: value });
  };

  const renderPasswordField = (field: string, label: string, placeholder?: string) => (
    <div className="space-y-2" key={field}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={visibility[field] ? 'text' : 'password'}
          value={authConfig[field] || ''}
          onChange={e => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => toggleVisibility(field)}
        >
          {visibility[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  switch (authType) {
    case 'api_key':
      return (
        <>
          {renderPasswordField('api_key', 'API Key', 'Enter API key')}
          <div className="space-y-2">
            <Label>Header Name</Label>
            <Input
              value={authConfig.header_name || 'X-API-Key'}
              onChange={e => handleChange('header_name', e.target.value)}
              placeholder="X-API-Key"
            />
          </div>
        </>
      );
    case 'oauth2':
      return (
        <>
          {renderPasswordField('client_id', 'Client ID', 'Enter client ID')}
          {renderPasswordField('client_secret', 'Client Secret', 'Enter client secret')}
          <div className="space-y-2">
            <Label>Token URL</Label>
            <Input
              value={authConfig.token_url || ''}
              onChange={e => handleChange('token_url', e.target.value)}
              placeholder="https://auth.example.com/oauth/token"
            />
          </div>
        </>
      );
    case 'basic':
      return (
        <>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={authConfig.username || ''}
              onChange={e => handleChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>
          {renderPasswordField('password', 'Password', 'Enter password')}
        </>
      );
    case 'none':
    default:
      return null;
  }
}

export default function IntegrationsDashboard() {
  const [configs, setConfigs] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Edit dialog state
  const [editingSystem, setEditingSystem] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    api_base_url: '',
    auth_type: 'api_key',
    sync_interval_minutes: 60,
    auth_config: {} as Record<string, string>,
  });

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    system_name: '',
    display_name: '',
    description: '',
    api_base_url: '',
    auth_type: 'none',
    sync_interval_minutes: 60,
    auth_config: {} as Record<string, string>,
  });
  const [creating, setCreating] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Integration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await apiFetch('/v2/panel/api/integrations');
      setConfigs(data.data || []);
    } catch (e: any) {
      console.error('Failed to fetch integrations:', e);
      setLoadError(e.message || 'Failed to load integrations');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
    const interval = setInterval(fetchConfigs, 30000);
    return () => clearInterval(interval);
  }, [fetchConfigs]);

  // Toggle active/inactive
  const handleToggle = async (systemName: string, isActive: boolean) => {
    try {
      await apiFetch(`/v2/panel/api/integrations/${systemName}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      });
      toast({ title: `${systemName} ${isActive ? 'activated' : 'deactivated'}` });
      fetchConfigs();
    } catch {
      toast({ title: 'Failed to toggle', variant: 'destructive' });
    }
  };

  // Trigger sync
  const handleSync = async (systemName: string) => {
    setSyncing(prev => ({ ...prev, [systemName]: true }));
    try {
      const data = await apiFetch(`/v2/panel/api/integrations/${systemName}/sync`, {
        method: 'POST',
      });
      toast({
        title: `Sync ${data.data?.status || 'complete'}`,
        description: data.data?.message || `${data.data?.records || 0} records`,
      });
      fetchConfigs();
    } catch (e: any) {
      toast({ title: 'Sync failed', description: e.message, variant: 'destructive' });
    } finally {
      setSyncing(prev => ({ ...prev, [systemName]: false }));
    }
  };

  // Open edit dialog
  const openEditDialog = (config: Integration) => {
    setEditingSystem(config.system_name);
    setEditForm({
      api_base_url: config.api_base_url || '',
      auth_type: config.auth_type || 'api_key',
      sync_interval_minutes: config.sync_interval_minutes,
      auth_config: config.auth_config || {},
    });
    setEditDialogOpen(true);
  };

  // Save edit config
  const handleSaveConfig = async () => {
    if (!editingSystem) return;
    try {
      await apiFetch(`/v2/panel/api/integrations/${editingSystem}`, {
        method: 'PATCH',
        body: JSON.stringify({
          api_base_url: editForm.api_base_url,
          auth_type: editForm.auth_type,
          sync_interval_minutes: editForm.sync_interval_minutes,
          auth_config: editForm.auth_config,
        }),
      });
      toast({ title: 'Configuration saved' });
      setEditDialogOpen(false);
      setEditingSystem(null);
      fetchConfigs();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  // Create new integration
  const handleCreate = async () => {
    if (!createForm.system_name.trim()) {
      toast({ title: 'System Name is required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      await apiFetch('/v2/panel/api/integrations', {
        method: 'POST',
        body: JSON.stringify({
          system_name: createForm.system_name.trim(),
          display_name: createForm.display_name.trim() || createForm.system_name.trim(),
          description: createForm.description.trim(),
          api_base_url: createForm.api_base_url.trim(),
          auth_type: createForm.auth_type,
          auth_config: createForm.auth_type !== 'none' ? createForm.auth_config : undefined,
          sync_interval_minutes: createForm.sync_interval_minutes,
        }),
      });
      toast({ title: 'Integration created' });
      setCreateDialogOpen(false);
      setCreateForm({
        system_name: '',
        display_name: '',
        description: '',
        api_base_url: '',
        auth_type: 'none',
        sync_interval_minutes: 60,
        auth_config: {},
      });
      fetchConfigs();
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // Delete integration
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/v2/panel/api/integrations/${deleteTarget.system_name}`, {
        method: 'DELETE',
      });
      toast({ title: `${deleteTarget.display_name || deleteTarget.system_name} deleted` });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchConfigs();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // Summary stats
  const activeCount = configs.filter(c => c.is_active).length;
  const failedCount = configs.filter(c => c.last_sync_status === 'failed').length;
  const totalSynced = configs.reduce((acc, c) => acc + (c.last_sync_record_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">External Integrations</h1>
          <p className="text-muted-foreground">
            Manage data synchronization with external KOMDIGI systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConfigs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {loadError}. The integration configurations may not be initialized yet. Try refreshing.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{configs.length}</p>
                <p className="text-xs text-muted-foreground">Total Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{failedCount}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalSynced}</p>
                <p className="text-xs text-muted-foreground">Records Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {configs.length === 0 && !loadError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No integrations configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first integration.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Integration Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {configs.map(config => {
            const Icon = getIcon(config.system_name);
            const label = config.display_name || config.system_name;
            const desc = config.description || config.adapter_class;
            const isSyncing = syncing[config.system_name];

            return (
              <Card key={config.id} className={!config.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{label}</CardTitle>
                        <CardDescription className="text-xs">{desc}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDeleteTarget(config);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(checked) => handleToggle(config.system_name, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={config.last_sync_status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span>{timeAgo(config.last_sync_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Records</span>
                    <span>{config.last_sync_record_count ?? '\u2014'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Interval</span>
                    <span>{config.sync_interval_minutes}min</span>
                  </div>

                  {config.last_error_message && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{config.last_error_message}</AlertDescription>
                    </Alert>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={!config.is_active || isSyncing}
                      onClick={() => handleSync(config.system_name)}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      Sync Now
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(config)}>
                      <Settings2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configure {configs.find(c => c.system_name === editingSystem)?.display_name || editingSystem}
            </DialogTitle>
            <DialogDescription>
              Update API connection settings for {editingSystem}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <Input
                value={editForm.api_base_url}
                onChange={e => setEditForm({ ...editForm, api_base_url: e.target.value })}
                placeholder="https://api.example.go.id/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>Auth Type</Label>
              <Select
                value={editForm.auth_type}
                onValueChange={v => setEditForm({ ...editForm, auth_type: v, auth_config: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AuthConfigFields
              authType={editForm.auth_type}
              authConfig={editForm.auth_config}
              onChange={authConfig => setEditForm({ ...editForm, auth_config: authConfig })}
            />

            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={1440}
                value={editForm.sync_interval_minutes}
                onChange={e => setEditForm({ ...editForm, sync_interval_minutes: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConfig}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Configure a new external system integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>System Name <span className="text-destructive">*</span></Label>
              <Input
                value={createForm.system_name}
                onChange={e => setCreateForm({ ...createForm, system_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                placeholder="my_system"
              />
              <p className="text-xs text-muted-foreground">Unique slug identifier (lowercase, underscores only)</p>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={createForm.display_name}
                onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })}
                placeholder="My System"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Brief description of this integration"
              />
            </div>
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <Input
                value={createForm.api_base_url}
                onChange={e => setCreateForm({ ...createForm, api_base_url: e.target.value })}
                placeholder="https://api.example.go.id/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>Auth Type</Label>
              <Select
                value={createForm.auth_type}
                onValueChange={v => setCreateForm({ ...createForm, auth_type: v, auth_config: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AuthConfigFields
              authType={createForm.auth_type}
              authConfig={createForm.auth_config}
              onChange={authConfig => setCreateForm({ ...createForm, auth_config: authConfig })}
            />

            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={1440}
                value={createForm.sync_interval_minutes}
                onChange={e => setCreateForm({ ...createForm, sync_interval_minutes: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.display_name || deleteTarget?.system_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
