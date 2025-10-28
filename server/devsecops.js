import { query } from './db.js';

// Get security metrics for DevSecOps monitor
export async function getSecurityMetrics(req, res) {
  try {
    console.log('Fetching security metrics...');
    
    // Get audit logs count
    const auditCountResult = await query('SELECT COUNT(*) as count FROM public.audit_logs');
    const totalAuditLogs = parseInt(auditCountResult.rows[0]?.count || 0);

    // Get recent security events (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentEventsResult = await query(
      'SELECT COUNT(*) as count FROM public.audit_logs WHERE created_at >= $1',
      [yesterday.toISOString()]
    );
    const recentSecurityEvents = parseInt(recentEventsResult.rows[0]?.count || 0);

    // Get auth failures from login attempts (if table exists)
    let authFailures = 0;
    try {
      const authFailuresResult = await query(
        'SELECT COUNT(*) as count FROM public.login_attempts WHERE success = false AND created_at >= $1',
        [yesterday.toISOString()]
      );
      authFailures = parseInt(authFailuresResult.rows[0]?.count || 0);
    } catch (e) {
      console.log('login_attempts table not found, using default value');
    }

    // Determine system health
    let systemHealth = 'healthy';
    if (authFailures > 10) systemHealth = 'critical';
    else if (authFailures > 5 || recentSecurityEvents > 100) systemHealth = 'warning';

    const metrics = {
      totalAuditLogs,
      recentSecurityEvents,
      authFailures,
      systemHealth
    };

    console.log('Security metrics:', metrics);
    res.json({ metrics });

  } catch (error) {
    console.error('Error fetching security metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch security metrics',
      metrics: {
        totalAuditLogs: 0,
        recentSecurityEvents: 0,
        authFailures: 0,
        systemHealth: 'healthy'
      }
    });
  }
}

// Get API integration metrics
export async function getAPIMetrics(req, res) {
  try {
    console.log('Fetching API metrics...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get API integration logs from last 24 hours
    const apiLogsResult = await query(
      `SELECT 
         COUNT(*) as total_calls,
         COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_calls,
         COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_calls,
         AVG(CASE WHEN response_time_ms IS NOT NULL THEN response_time_ms END) as avg_response_time
       FROM public.api_integration_logs 
       WHERE created_at >= $1`,
      [yesterday.toISOString()]
    );

    const stats = apiLogsResult.rows[0];
    const totalCalls = parseInt(stats?.total_calls || 0);
    const successfulCalls = parseInt(stats?.successful_calls || 0);
    const failedCalls = parseInt(stats?.failed_calls || 0);
    const averageResponseTime = parseFloat(stats?.avg_response_time || 0);

    // Get recent failures (last 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recentFailuresResult = await query(
      'SELECT COUNT(*) as count FROM public.api_integration_logs WHERE status = $1 AND created_at >= $2',
      ['error', oneHourAgo.toISOString()]
    );
    const recentFailures = parseInt(recentFailuresResult.rows[0]?.count || 0);

    const metrics = {
      totalCalls,
      successfulCalls,
      failedCalls,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 100,
      recentFailures
    };

    console.log('API metrics:', metrics);
    res.json({ metrics });

  } catch (error) {
    console.error('Error fetching API metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch API metrics',
      metrics: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        successRate: 100,
        recentFailures: 0
      }
    });
  }
}

// Log user activity
export async function logActivity(req, res) {
  try {
    const { action, details, resource_type = 'system', resource_id = null } = req.body;
    const userId = req.user?.sub; // From auth middleware

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    await query(
      `INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [userId, action, resource_type, resource_id, JSON.stringify(details || {})]
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
}

// Log API integration call
export async function logAPICall(req, res) {
  try {
    const { api_name, status, request_data, response_data, response_time_ms, error_message } = req.body;
    const userId = req.user?.sub; // From auth middleware

    if (!api_name || !status) {
      return res.status(400).json({ error: 'API name and status are required' });
    }

    await query(
      `INSERT INTO public.api_integration_logs 
       (user_id, api_name, status, request_data, response_data, response_time_ms, error_message, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
      [
        userId, 
        api_name, 
        status, 
        JSON.stringify(request_data || {}),
        JSON.stringify(response_data || {}),
        response_time_ms,
        error_message
      ]
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Error logging API call:', error);
    res.status(500).json({ error: 'Failed to log API call' });
  }
}

// Get recent audit logs
export async function getAuditLogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT id, user_id, action, details, created_at 
       FROM public.audit_logs 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ logs: result.rows });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs', logs: [] });
  }
}

// Create audit log entry
export async function createAuditLog(req, res) {
  try {
    const { action, details } = req.body;
    const userId = req.user?.sub; // From auth middleware

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const result = await query(
      `INSERT INTO public.audit_logs (user_id, action, details, created_at) 
       VALUES ($1, $2, $3, now()) 
       RETURNING id`,
      [userId, action, JSON.stringify(details || {})]
    );

    res.json({ success: true, id: result.rows[0].id });

  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
}