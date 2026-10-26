const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/profiles
exports.getProfiles = async (req, res) => {
  try {
    const result = await query('SELECT * FROM profiles ORDER BY created_at DESC');
    return res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/profiles/:id
exports.getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (result.rows.length > 0) return res.json({ status: 'success', data: result.rows[0] });
    res.status(404).json({ status: 'error', message: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/profiles/register
exports.register = async (req, res) => {
  const { full_name, phone_number, monthly_income, employment_type, email, role } = req.body;
  const id = crypto.randomUUID();
  const userRole = role || 'Customer';

  try {
    // 1. Insert into profiles
    const profRes = await query(
      `INSERT INTO profiles (id, full_name, phone_number, monthly_income, employment_type, role, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, full_name, phone_number, monthly_income ? Number(monthly_income) : 0, employment_type, userRole, email]
    );

    // 2. Insert into users table to maintain foreign key consistency across tables
    try {
      await query(
        `INSERT INTO users (id, email, full_name, phone, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone`,
        [id, email || `${id}@domain.com`, full_name, phone_number, userRole]
      );
    } catch (uErr) {
      console.warn('User table sync note:', uErr.message);
    }

    await logAudit(id, 'USER_REGISTERED', `profiles:${id}`, req.ip);

    res.status(201).json({
      status: 'success',
      message: 'Profile registered successfully in Supabase',
      data: profRes.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// POST /api/profiles/login
exports.login = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.json({ status: 'success', data: result.rows[0] });
    }
    // Return first profile as active default
    const all = await query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1');
    return res.json({ status: 'success', data: all.rows[0] || null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
