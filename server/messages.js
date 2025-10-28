import { query } from './db.js';
import { emitter } from './events.js';

async function fetchUserRoles(userId) {
  const { rows } = await query(
    'SELECT role FROM public.user_roles WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.role);
}

function isAdminFromRoles(roles) {
  return (
    roles.includes('super_admin') ||
    roles.includes('internal_admin') ||
    roles.includes('pengolah_data')
  );
}

async function assertTicketAccess(ticketId, userId, isAdmin) {
  const { rows } = await query(
    'SELECT id, user_id FROM public.tickets WHERE id = $1 LIMIT 1',
    [ticketId]
  );
  if (rows.length === 0) {
    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  }
  const ticket = rows[0];
  if (!isAdmin && ticket.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return ticket;
}

// GET /api/tickets/:id/messages
export async function listTicketMessages(req, res) {
  try {
    const ticketId = req.params.id;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const roles = await fetchUserRoles(req.user.sub);
    const isAdmin = isAdminFromRoles(roles);

    await assertTicketAccess(ticketId, req.user.sub, isAdmin);

    const { rows } = await query(
      `SELECT id, ticket_id, user_id, message, is_admin_message, file_url, is_read, created_at, updated_at
         FROM public.ticket_messages
        WHERE ticket_id = $1
        ORDER BY created_at ASC`,
      [ticketId]
    );

    return res.json({ messages: rows });
  } catch (e) {
    const status = e.status || 500;
    if (status !== 500) {
      return res.status(status).json({ error: e.message });
    }
    console.error('listTicketMessages error:', e);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}

// POST /api/tickets/:id/messages
// body: { message: string, file_url?: string | null }
export async function createTicketMessage(req, res) {
  try {
    const ticketId = req.params.id;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { message, file_url = null } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const roles = await fetchUserRoles(req.user.sub);
    const isAdmin = isAdminFromRoles(roles);

    const ticket = await assertTicketAccess(ticketId, req.user.sub, isAdmin);

    const { rows } = await query(
      `INSERT INTO public.ticket_messages
         (id, ticket_id, user_id, message, is_admin_message, file_url, is_read, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false, now(), now())
       RETURNING id, ticket_id, user_id, message, is_admin_message, file_url, is_read, created_at, updated_at`,
      [ticketId, req.user.sub, String(message).trim(), isAdmin, file_url]
    );

    const created = rows[0];

    // Optionally update ticket's updated_at for sorting
    try {
      await query(`UPDATE public.tickets SET updated_at = now() WHERE id = $1`, [ticketId]);
    } catch {}

    // Emit realtime event
    try {
      emitter.emit('messageCreated', { message: created, ticket });
    } catch {}

    return res.status(201).json({ message: created });
  } catch (e) {
    const status = e.status || 500;
    if (status !== 500) {
      return res.status(status).json({ error: e.message });
    }
    console.error('createTicketMessage error:', e);
    return res.status(500).json({ error: 'Failed to create message' });
  }
}

// POST /api/tickets/:id/messages/read
// Marks messages from the opposite party as read
export async function markMessagesRead(req, res) {
  try {
    const ticketId = req.params.id;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const roles = await fetchUserRoles(req.user.sub);
    const isAdmin = isAdminFromRoles(roles);

    const ticket = await assertTicketAccess(ticketId, req.user.sub, isAdmin);

    // If actor is admin -> mark user messages as read (is_admin_message = false)
    // If actor is user  -> mark admin messages as read (is_admin_message = true)
    const targetIsAdminMessage = !isAdmin;

    const result = await query(
      `UPDATE public.ticket_messages
          SET is_read = true, updated_at = now()
        WHERE ticket_id = $1
          AND is_admin_message = $2
          AND is_read = false`,
      [ticketId, targetIsAdminMessage]
    );

    return res.json({ success: true, updated: result.rowCount || 0, ticket_id: ticket.id });
  } catch (e) {
    const status = e.status || 500;
    if (status !== 500) {
      return res.status(status).json({ error: e.message });
    }
    console.error('markMessagesRead error:', e);
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}