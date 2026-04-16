import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { emitter } from './events.js';

export async function listTickets(req, res) {
  try {
    // Determine roles for current user
    const { rows: roleRows } = await query(
      `SELECT role FROM public.user_roles WHERE user_id = $1`,
      [req.user?.sub || null]
    );
    const roles = roleRows.map(r => r.role);
    const isAdmin =
      roles.includes('super_admin') ||
      roles.includes('internal_admin') ||
      roles.includes('pengolah_data');

    let rows;
    if (isAdmin) {
      ({ rows } = await query(
        `SELECT * FROM public.tickets ORDER BY created_at DESC`
      ));
    } else {
      ({ rows } = await query(
        `SELECT * FROM public.tickets WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user?.sub || null]
      ));
    }
    return res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
}

export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    // Batasi hanya kolom yang aman/valid untuk di-update
    const allowed = new Set([
      'title',
      'description',
      'status',
      'priority',
      'category',
      'assigned_to',
      'assignment_status',
      'file_url',
      'internal_notes',
      'due_date',
      'escalated_at',
      'escalation_level',
      'first_response_at',
      'resolved_at', // izinkan set otomatis/manual saat resolved/closed
    ]);

    // Validasi status jika ada
    if (typeof payload.status === 'string') {
      const allowedStatus = new Set(['open', 'in_progress', 'resolved', 'closed']);
      if (!allowedStatus.has(payload.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    // Bangun SET list hanya dari kolom yang diizinkan
    for (const [k, v] of Object.entries(payload)) {
      if (!allowed.has(k)) continue;
      fields.push(`${k} = $${idx++}`);
      values.push(v);
    }

    // Auto set resolved_at jika status menjadi resolved/closed dan client tidak mengirimkan resolved_at
    const willCloseOrResolve =
      typeof payload.status === 'string' &&
      (payload.status === 'resolved' || payload.status === 'closed');
    if (willCloseOrResolve && !('resolved_at' in payload)) {
      // Tidak pakai parameter agar tidak menimpa nilai existing jika sudah ada
      fields.push(`resolved_at = COALESCE(resolved_at, now())`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const { rows } = await query(
      `UPDATE public.tickets
         SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    const updated = rows[0];
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    try {
      emitter.emit('ticketUpdated', { ticket: updated });
      if (updated.status === 'closed') {
        emitter.emit('ticketClosed', { ticket: updated });
      }
    } catch {}

    return res.json(updated);
  } catch (e) {
    console.error('updateTicket error:', {
      message: e.message,
      code: e.code,
      detail: e.detail,
      stack: e.stack,
    });
    res.status(500).json({ error: 'Failed to update ticket' });
  }
}

export async function createTicket(req, res) {
  try {
    const {
      title,
      description,
      priority = 'medium',
      category = 'general',
      file_url = null,
    } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: 'Missing title/description' });
    const id = uuidv4();
    await query(
      `INSERT INTO public.tickets (id, title, description, priority, status, created_at, updated_at, user_id, file_url, category)
                 VALUES ($1,$2,$3,$4,'open', now(), now(), $5, $6, $7)`,
      [id, title, description, priority, req.user?.sub || null, file_url, category]
    );
    const { rows } = await query('SELECT * FROM public.tickets WHERE id = $1', [
      id,
    ]);
    const created = rows[0];
    try {
      emitter.emit('ticketCreated', { ticket: created });
    } catch {}
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
}
