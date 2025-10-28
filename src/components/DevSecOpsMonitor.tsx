import { useState, useEffect } from 'react';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useAPIMonitoring } from '@/hooks/useAPIMonitoring';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { APIIntegrationDialog } from './APIIntegrationDialog';

interface SecurityMetrics {
  totalAuditLogs: number;
  recentSecurityEvents: number;
  authFailures: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export function DevSecOpsMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAuditLogs: 0,
    recentSecurityEvents: 0,
    authFailures: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const { logUserAction } = useMonitoring();
  const { metrics: apiMetrics, loading: apiLoading } = useAPIMonitoring();
  const { token } = useAuth();
  const backendUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      try {
        if (!token()) {
          console.log('No auth token, skipping security metrics fetch');
          setLoading(false);
          return;
        }

        console.log('Fetching security metrics from backend...');
        
        const response = await fetch(`${backendUrl}/api/devsecops/security-metrics`, {
          headers: {
            'Authorization': `Bearer ${token()}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.metrics) {
          setMetrics({
            totalAuditLogs: data.metrics.totalAuditLogs,
            recentSecurityEvents: data.metrics.recentSecurityEvents,
            authFailures: data.metrics.authFailures,
            systemHealth: data.metrics.systemHealth
          });

          logUserAction('view_security_metrics', { metrics: data.metrics });
        }
        
      } catch (error) {
        console.error('Failed to fetch security metrics:', error);
        // Set default values on error
        setMetrics({
          totalAuditLogs: 0,
          recentSecurityEvents: 0,
          authFailures: 0,
          systemHealth: 'healthy'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchSecurityMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [logUserAction, token, backendUrl]);

  const getHealthBadge = () => {
    switch (metrics.systemHealth) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            DevSecOps Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading security metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          DevSecOps Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">System Health</span>
          {getHealthBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Audit Logs</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalAuditLogs}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Recent Events</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{metrics.recentSecurityEvents}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Auth Failures (24h)</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{metrics.authFailures}</div>
        </div>

        {/* API Integration Metrics */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            API Integration Monitoring
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Calls (24h)</span>
              <div className="text-lg font-semibold">{apiLoading ? '...' : apiMetrics.totalCalls}</div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <div className="text-lg font-semibold">{apiLoading ? '...' : `${apiMetrics.successRate.toFixed(1)}%`}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Recent Failures: {apiLoading ? '...' : apiMetrics.recentFailures}</span>
            <APIIntegrationDialog />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}