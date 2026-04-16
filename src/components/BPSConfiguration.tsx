import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiClient';
import {
  Settings,
  Key,
  MapPin,
  Database,
  Plus,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BPSConfig {
  id: number;
  config_name: string;
  api_key: string;
  base_url: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  created_at: string;
  updated_at: string;
}

interface BPSArea {
  id: number;
  area_code: string;
  area_name: string;
  area_type: 'province' | 'district';
  parent_area_code?: string;
  is_active: boolean;
  priority_level: number;
}

interface BPSVariable {
  id: number;
  variable_id: string;
  variable_name: string;
  variable_name_en?: string;
  unit?: string;
  category?: string;
  description?: string;
  is_active: boolean;
}

interface TestConnectionResult {
  success: boolean;
  message: string;
  status?: number;
  responseTime?: string;
}

export default function BPSConfiguration() {
  const [config, setConfig] = useState<BPSConfig | null>(null);
  const [areas, setAreas] = useState<BPSArea[]>([]);
  const [variables, setVariables] = useState<BPSVariable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const { toast } = useToast();

  // Form states
  const [configForm, setConfigForm] = useState({
    config_name: 'default_bps_config',
    api_key: '',
    base_url: 'https://webapi.bps.go.id/v1/api',
    rate_limit_per_hour: 1000,
  });

  const [actualApiKey, setActualApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Function to mask API key for display
  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return '';
    return '•'.repeat(apiKey.length);
  };

  // Function to handle API key input changes
  const handleApiKeyChange = (value: string) => {
    // If the value is masked (contains •), don't update the actual API key
    if (value.includes('•')) {
      setConfigForm(prev => ({ ...prev, api_key: value }));
    } else {
      // User is typing a new API key
      setActualApiKey(value);
      setConfigForm(prev => ({ ...prev, api_key: value }));
    }
  };

  const [newArea, setNewArea] = useState({
    area_code: '',
    area_name: '',
    area_type: 'province' as 'province' | 'district',
    parent_area_code: '',
    priority_level: 1,
  });

  const [newVariable, setNewVariable] = useState({
    variable_id: '',
    variable_name: '',
    variable_name_en: '',
    unit: '',
    category: '',
    description: '',
  });

  // Load configuration data
  const loadConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load config
      const configResponse = await apiFetch('/v2/panel/api/bps/config');
      if (configResponse.success && configResponse.data) {
        setConfig(configResponse.data);
        setConfigForm({
          config_name: configResponse.data.config_name,
          api_key: maskApiKey(configResponse.data.api_key), // Show masked API key
          base_url: configResponse.data.base_url,
          rate_limit_per_hour: configResponse.data.rate_limit_per_hour,
        });
        setActualApiKey(configResponse.data.api_key); // Store actual API key
      }

      // Load areas
      const areasResponse = await apiFetch('/v2/panel/api/bps/areas');
      if (areasResponse.success) {
        setAreas(areasResponse.data);
      }

      // Load variables
      const variablesResponse = await apiFetch('/v2/panel/api/bps/variables');
      if (variablesResponse.success) {
        setVariables(variablesResponse.data);
      }

    } catch (error) {
      console.error('Failed to load configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load BPS configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save configuration
  const saveConfiguration = useCallback(async () => {
    if (!configForm.api_key) {
      toast({
        title: 'Validation Error',
        description: 'API key is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await apiFetch('/v2/panel/api/bps/config', {
        method: 'POST',
        body: JSON.stringify({
          config_name: configForm.config_name,
          api_key: actualApiKey || configForm.api_key, // Use actual API key if available, otherwise use form value
          base_url: configForm.base_url,
          rate_limit_per_hour: configForm.rate_limit_per_hour
        }),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'BPS configuration saved successfully',
        });
        await loadConfiguration(); // Reload to get updated config
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to save configuration',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [configForm, toast, loadConfiguration]);

  // Test API connection
  const testConnection = useCallback(async () => {
    if (!configForm.api_key) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an API key first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTestingConnection(true);
      setTestResult(null);

      const response = await apiFetch('/v2/panel/api/bps/test/connection', {
        method: 'POST',
      });

      setTestResult(response);

      if (response.success) {
        toast({
          title: 'Connection Successful',
          description: 'BPS API connection is working properly',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: response.message || 'Failed to connect to BPS API',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to test connection:', error);
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
      setTestResult(errorResult);
      toast({
        title: 'Connection Test Failed',
        description: errorResult.message,
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [configForm.api_key, toast]);

  // Add new area
  const addArea = useCallback(async () => {
    if (!newArea.area_code || !newArea.area_name) {
      toast({
        title: 'Validation Error',
        description: 'Area code and name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('app.jwt.token');
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await apiFetch('/v2/panel/api/bps/areas', {
        method: 'POST',
        body: JSON.stringify(newArea),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Area added successfully',
        });
        setNewArea({
          area_code: '',
          area_name: '',
          area_type: 'province',
          parent_area_code: '',
          priority_level: 1,
        });
        await loadConfiguration(); // Reload areas
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to add area',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to add area:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add area',
        variant: 'destructive',
      });
    }
  }, [newArea, toast, loadConfiguration]);

  // Fetch areas from BPS API
  const fetchAreasFromAPI = useCallback(async () => {
    try {
      setIsTestingConnection(true);
      setTestResult(null);

      // Check if user is authenticated
      const token = localStorage.getItem('app.jwt.token');
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      console.log('Attempting to fetch areas with token:', token.substring(0, 20) + '...');

      // First get the configuration to get the API key
      const configResponse = await apiFetch('/v2/panel/api/bps/config');
      if (!configResponse.success || !configResponse.data?.api_key) {
        throw new Error('BPS API key not configured');
      }

      const apiKey = configResponse.data.api_key;
      
      const response = await apiFetch('/v2/panel/api/bps/areas/test', {
        method: 'GET',
      });

      console.log('Fetch areas response:', response);

      setTestResult(response);

      if (response.success) {
        toast({
          title: 'Areas Fetched Successfully',
          description: `Found ${response.data.totalAreas} areas from BPS API`,
        });
      } else {
        toast({
          title: 'Area Fetch Failed',
          description: response.error || 'Failed to fetch areas from BPS API',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to fetch areas:', error);
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Area fetch failed',
      };
      setTestResult(errorResult);
      toast({
        title: 'Area Fetch Failed',
        description: errorResult.message,
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [toast]);

  // Sync areas from BPS API to database
 const syncAreasFromAPI = useCallback(async () => {
    if (!configForm.api_key) {
      toast({
        title: 'Validation Error',
        description: 'Please configure API key first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTestingConnection(true);
      setTestResult(null);

      // Check if user is authenticated
      const token = localStorage.getItem('app.jwt.token');
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      console.log('Attempting to sync areas with token:', token.substring(0, 20) + '...');
      
      const response = await apiFetch('/v2/panel/api/bps/areas/sync', {
        method: 'POST',
      });

      console.log('Sync areas response:', response);

      setTestResult(response);

      if (response.success) {
        toast({
          title: 'Areas Synced Successfully',
          description: `Synced ${response.data.syncedCount} areas to database`,
        });
        await loadConfiguration(); // Reload areas
      } else {
        toast({
          title: 'Area Sync Failed',
          description: response.error || 'Failed to sync areas from BPS API',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to sync areas:', error);
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Area sync failed',
      };
      setTestResult(errorResult);
      toast({
        title: 'Area Sync Failed',
        description: errorResult.message,
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [toast, loadConfiguration, configForm.api_key]);

  // Add new variable
  const addVariable = useCallback(async () => {
    if (!newVariable.variable_id || !newVariable.variable_name) {
      toast({
        title: 'Validation Error',
        description: 'Variable ID and name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('app.jwt.token');
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await apiFetch('/v2/panel/api/bps/variables', {
        method: 'POST',
        body: JSON.stringify(newVariable),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Variable added successfully',
        });
        setNewVariable({
          variable_id: '',
          variable_name: '',
          variable_name_en: '',
          unit: '',
          category: '',
          description: '',
        });
        await loadConfiguration(); // Reload variables
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to add variable',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Failed to add variable:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add variable',
        variant: 'destructive',
      });
    }
  }, [newVariable, toast, loadConfiguration]);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading BPS configuration...</p>
        </div>
      </div>
    );
  }

  const provinces = areas.filter(a => a.area_type === 'province');
  const districts = areas.filter(a => a.area_type === 'district');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">BPS Configuration</h2>
          <p className="text-muted-foreground">
            Configure BPS API settings, monitored areas, and statistical variables
          </p>
        </div>
        
        <Button onClick={loadConfiguration} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* API Configuration Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                BPS API Configuration
              </CardTitle>
              <CardDescription>
                Configure your BPS Web API v1 connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input
                    id="config-name"
                    value={configForm.config_name}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, config_name: e.target.value }))}
                    placeholder="default_bps_config"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">BPS API Key *</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={configForm.api_key}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your BPS API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    value={configForm.base_url}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, base_url: e.target.value }))}
                    placeholder="https://webapi.bps.go.id/v1/api/view"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={configForm.rate_limit_per_hour}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, rate_limit_per_hour: parseInt(e.target.value) }))}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={testConnection}
                  disabled={isTestingConnection || !configForm.api_key}
                  variant="outline"
                >
                  <TestTube className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>

                <Button
                  onClick={saveConfiguration}
                  disabled={isSaving}
                >
                  <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                  Save Configuration
                </Button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Areas Management Tab */}
        <TabsContent value="areas" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={fetchAreasFromAPI}
              disabled={isTestingConnection || !configForm.api_key}
              variant="outline"
            >
              <MapPin className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
              Fetch Areas from API
            </Button>

            <Button
              onClick={syncAreasFromAPI}
              disabled={isTestingConnection || !configForm.api_key}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
              Sync Areas from API
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Area
                </CardTitle>
                <CardDescription>
                  Add provinces and districts to monitor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Area Code *</Label>
                    <Input
                      value={newArea.area_code}
                      onChange={(e) => setNewArea(prev => ({ ...prev, area_code: e.target.value }))}
                      placeholder="31 or 3171"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Area Name *</Label>
                    <Input
                      value={newArea.area_name}
                      onChange={(e) => setNewArea(prev => ({ ...prev, area_name: e.target.value }))}
                      placeholder="DKI Jakarta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Area Type</Label>
                    <Select 
                      value={newArea.area_type} 
                      onValueChange={(value: 'province' | 'district') => 
                        setNewArea(prev => ({ ...prev, area_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="province">Province</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Input
                      type="number"
                      value={newArea.priority_level}
                      onChange={(e) => setNewArea(prev => ({ ...prev, priority_level: parseInt(e.target.value) }))}
                      min="1"
                      max="3"
                    />
                  </div>
                </div>

                {newArea.area_type === 'district' && (
                  <div className="space-y-2">
                    <Label>Parent Province</Label>
                    <Select 
                      value={newArea.parent_area_code} 
                      onValueChange={(value) => setNewArea(prev => ({ ...prev, parent_area_code: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province.area_code} value={province.area_code}>
                            {province.area_name} ({province.area_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={addArea} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Area
                </Button>
              </CardContent>
            </Card>

            {/* Current Areas List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Monitored Areas
                </CardTitle>
                <CardDescription>
                  Currently configured provinces and districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Provinces ({provinces.length})</h4>
                    <div className="space-y-2">
                      {provinces.map(area => (
                        <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{area.area_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({area.area_code})</span>
                          </div>
                          <Badge variant={area.is_active ? "default" : "secondary"}>
                            Priority {area.priority_level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Districts ({districts.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {districts.map(area => (
                        <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{area.area_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({area.area_code})</span>
                          </div>
                          <Badge variant={area.is_active ? "default" : "secondary"}>
                            Priority {area.priority_level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variables Management Tab */}
        <TabsContent value="variables" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Variable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Variable
                </CardTitle>
                <CardDescription>
                  Add statistical variables to monitor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Variable ID *</Label>
                    <Input
                      value={newVariable.variable_id}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, variable_id: e.target.value }))}
                      placeholder="7101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={newVariable.unit}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="Ton"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Variable Name *</Label>
                  <Input
                    value={newVariable.variable_name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, variable_name: e.target.value }))}
                    placeholder="Produksi Padi"
                  />
                </div>

                <div className="space-y-2">
                  <Label>English Name</Label>
                  <Input
                    value={newVariable.variable_name_en}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, variable_name_en: e.target.value }))}
                    placeholder="Rice Production"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={newVariable.category}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Agriculture"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newVariable.description}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Rice production in tons"
                  />
                </div>

                <Button onClick={addVariable} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </CardContent>
            </Card>

            {/* Current Variables List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configured Variables
                </CardTitle>
                <CardDescription>
                  Currently monitored statistical variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {variables.map(variable => (
                    <div key={variable.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{variable.variable_name}</span>
                            <Badge variant="outline">{variable.variable_id}</Badge>
                          </div>
                          {variable.variable_name_en && (
                            <p className="text-sm text-muted-foreground">{variable.variable_name_en}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {variable.unit && <span>Unit: {variable.unit}</span>}
                            {variable.category && <span>Category: {variable.category}</span>}
                          </div>
                        </div>
                        <Badge variant={variable.is_active ? "default" : "secondary"}>
                          {variable.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                BPS service health and configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <span className="font-medium">Database</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connection status and schema
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <span className="font-medium">API Key</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    BPS API authentication
                  </p>
                  <Badge variant={config?.api_key ? "default" : "secondary"}>
                    {config?.api_key ? 'Configured' : 'Not Set'}
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">Coverage</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitored areas and variables
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    {areas.length} areas, {variables.length} variables
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}