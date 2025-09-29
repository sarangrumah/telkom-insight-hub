import { query } from './db.js';

export async function getProfile(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = req.user.sub;
    const rolesRes = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [userId]
    );
    const profileRes = await query(
      `SELECT full_name, company_name, phone, is_validated, maksud_tujuan
         FROM public.profiles WHERE user_id = $1`,
      [userId]
    );
    const profile = profileRes.rows[0] || {};
    return res.json({
      id: userId,
      email: req.user.email,
      roles: rolesRes.rows.map(r => r.role),
      full_name: profile.full_name || null,
      company_name: profile.company_name || null,
      phone: profile.phone || null,
      is_validated: profile.is_validated ?? false,
      maksud_tujuan: profile.maksud_tujuan || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
}
