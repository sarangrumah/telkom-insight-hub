import React, { useState } from 'react';
import { useThirdPartyAPI } from '@/hooks/useThirdPartyAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface APICallData {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: string;
  apiName: string;
}

type APITestResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
  apiName?: string;
  timestamp?: string;
} | null;

export const APIIntegrationDialog = () => {
  const [formData, setFormData] = useState<APICallData>({
    endpoint: '',
    method: 'GET',
    parameters: '{}',
    apiName: 'example-api'
  });
  const [response, setResponse] = useState<APITestResponse>(null);
  const { callAPIWithToast, loading, error } = useThirdPartyAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: endpoint harus absolute URL http/https
    if (!/^https?:\/\//i.test(formData.endpoint)) {
      toast.error('Endpoint harus berupa URL absolute (http/https)');
      return;
    }

    let parsedParams: unknown;
    try {
      parsedParams = JSON.parse(formData.parameters);
    } catch (parseError) {
      console.error('Invalid JSON in parameters:', parseError);
      toast.error('Parameters harus berupa JSON yang valid');
      return;
    }

    const result = await callAPIWithToast(
      {
        endpoint: formData.endpoint,
        method: formData.method,
        parameters: parsedParams
      },
      {
        apiName: formData.apiName,
        timeout: 30000,
        retries: 2
      }
    );

    setResponse(result);
  };

  const handleInputChange = (field: keyof APICallData, value: string) => {
    setFormData(prev => {
      if (field === 'method') {
        return { ...prev, method: value as APICallData['method'] };
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Test API Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API Integration Testing</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>API Request</CardTitle>
              <CardDescription>
                Configure and test external API integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiName">API Name</Label>
                  <Select 
                    value={formData.apiName} 
                    onValueChange={(value) => handleInputChange('apiName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="example-api">Example API</SelectItem>
                      <SelectItem value="payment-api">Payment API</SelectItem>
                      <SelectItem value="email-api">Email API</SelectItem>
                      <SelectItem value="sms-api">SMS API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => handleInputChange('endpoint', e.target.value)}
                    placeholder="https://httpbin.org/get"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select 
                    value={formData.method} 
                    onValueChange={(value) => handleInputChange('method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parameters">Parameters (JSON)</Label>
                  <Textarea
                    id="parameters"
                    value={formData.parameters}
                    onChange={(e) => handleInputChange('parameters', e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Calling API...
                    </>
                  ) : (
                    'Call API'
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
              <CardDescription>
                View the response from your API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {response.success ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge variant="default">Success</Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <Badge variant="destructive">Error</Badge>
                      </>
                    )}
                    {response.timestamp && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Response Data</Label>
                    <div className="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <div className="text-center">
                    <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No response yet</p>
                    <p className="text-sm">Submit a request to see the response</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};