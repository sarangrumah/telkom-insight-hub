import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { emitter } from './events.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function isAdminRoles(roles) {
  return (
    roles.includes('super_admin') ||
    roles.includes('internal_admin') ||
    roles.includes('pengolah_data')
  );
}

async function fetchUserRoles(userId) {
  try {
    const { rows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [userId]
    );
    return rows.map((r) => r.role);
  } catch {
    return [];
  }
}

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    try {
      const rawUrl = req.url || '';
      const qs = rawUrl.includes('?') ? rawUrl.substring(rawUrl.indexOf('?') + 1) : '';
      const params = new URLSearchParams(qs);
      const token = params.get('token');

      if (!token) {
        ws.close(4401, 'Unauthorized');
        return;
      }

      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        ws.close(4401, 'Unauthorized');
        return;
      }

      const userId = payload.sub;
      if (!userId) {
        ws.close(4401, 'Unauthorized');
        return;
      }

      const roles = await fetchUserRoles(userId);
      const adminFlag = isAdminRoles(roles);

      // Attach context to socket instance
      ws.userId = userId;
      ws.isAdmin = adminFlag;

      // Simple keepalive
      let pingInterval = setInterval(() => {
        try {
          if (ws.readyState === ws.OPEN) ws.ping();
        } catch {
          // ignore
        }
      }, 30000);

      ws.on('close', () => {
        if (pingInterval) clearInterval(pingInterval);
      });

      ws.on('error', () => {
        // swallow socket errors
      });

      // Optional: client-to-server messages (noop)
      ws.on('message', (_msg) => {
        // could handle client pings or subscriptions in future
      });

      // Acknowledge connection
      try {
        ws.send(JSON.stringify({ type: 'connected' }));
      } catch {}

    } catch {
      try {
        ws.close(1011, 'Internal error');
      } catch {}
    }
  });

  function broadcast(predicate, payload) {
    const data = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState !== client.OPEN) continue;
      try {
        if (predicate(client)) {
          client.send(data);
        }
      } catch {
        // ignore send errors
      }
    }
  }

  // Forward app events to connected clients
  emitter.on('ticketCreated', ({ ticket }) => {
    broadcast(
      (c) => c.isAdmin || (ticket?.user_id && c.userId === ticket.user_id),
      { type: 'ticketCreated', ticket }
    );
  });

  emitter.on('ticketUpdated', ({ ticket }) => {
    broadcast(
      (c) => c.isAdmin || (ticket?.user_id && c.userId === ticket.user_id),
      { type: 'ticketUpdated', ticket }
    );
  });

  emitter.on('ticketClosed', ({ ticket }) => {
    broadcast(
      (c) => c.isAdmin || (ticket?.user_id && c.userId === ticket.user_id),
      { type: 'ticketClosed', ticket }
    );
  });

  emitter.on('messageCreated', ({ message, ticket }) => {
    // Send to admins and the ticket owner
    broadcast(
      (c) => c.isAdmin || (ticket?.user_id && c.userId === ticket.user_id),
      { type: 'messageCreated', message, ticket }
    );
  });
}