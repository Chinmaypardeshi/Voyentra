const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/crm/leads
exports.getLeads = async (req, res) => {
  try {
    const result = await query(`
      SELECT l.*, a.product_name, a.requested_amount, a.status as app_status,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM leads_crm l
      LEFT JOIN applications a ON l.application_id = a.id
      LEFT JOIN users u ON l.customer_id = u.id
      ORDER BY l.created_at DESC
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/crm/leads/:id
exports.updateLead = async (req, res) => {
  const { id } = req.params;
  const { lead_status, call_logs, follow_up_date, actor_id } = req.body;

  try {
    const result = await query(
      `UPDATE leads_crm
       SET lead_status = COALESCE($1, lead_status),
           call_logs = COALESCE($2, call_logs),
           follow_up_date = COALESCE($3, follow_up_date)
       WHERE id = $4
       RETURNING *`,
      [lead_status || null, call_logs || null, follow_up_date || null, id]
    );

    await logAudit(actor_id || null, 'UPDATE_LEAD_CRM', `leads_crm:${id}`, req.ip);

    res.json({ status: 'success', message: 'Lead updated successfully in Supabase', data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
