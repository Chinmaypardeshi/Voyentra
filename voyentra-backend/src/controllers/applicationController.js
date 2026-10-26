const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/applications
exports.getApplications = async (req, res) => {
  const { user_id, status } = req.query;

  try {
    let sql = `
      SELECT a.*, p.full_name as applicant_name, p.email as applicant_email, p.phone_number,
             fp.title as product_title, fp.interest_rate
      FROM applications a
      LEFT JOIN profiles p ON a.user_id = p.id
      LEFT JOIN financial_products fp ON a.product_id = fp.id
    `;
    const conds = [];
    const params = [];
    if (user_id) {
      params.push(user_id);
      conds.push(`a.user_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conds.push(`a.status = $${params.length}`);
    }
    if (conds.length > 0) sql += ` WHERE ${conds.join(' AND ')}`;
    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/applications
exports.createApplication = async (req, res) => {
  const { user_id, product_id, requested_amount, tenure_months, product_name, category, assigned_staff_id } = req.body;
  const id = crypto.randomUUID();

  try {
    // 1. Ensure user exists in profiles and users
    let validUserId = user_id;
    if (!validUserId) {
      const firstProf = await query('SELECT id FROM profiles LIMIT 1');
      validUserId = firstProf.rows[0]?.id;
    }

    if (validUserId) {
      try {
        await query(
          `INSERT INTO users (id, email, full_name, role)
           SELECT id, COALESCE(email, id || '@voyentra.com'), COALESCE(full_name, 'Customer'), 'Customer'
           FROM profiles WHERE id = $1
           ON CONFLICT (id) DO NOTHING`,
          [validUserId]
        );
      } catch (uErr) {
        // ignore conflict
      }
    }

    // 2. Insert into applications
    const appRes = await query(
      `INSERT INTO applications (id, user_id, product_id, status, requested_amount, tenure_months, product_name, category, assigned_staff_id)
       VALUES ($1, $2, $3, 'submitted', $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        validUserId || null,
        product_id || null,
        requested_amount ? Number(requested_amount) : 200000,
        tenure_months ? Number(tenure_months) : 24,
        product_name || 'Credit Facility',
        category || 'Personal Loan',
        assigned_staff_id || null
      ]
    );

    // 3. Auto-insert into leads_crm queue
    try {
      const leadId = crypto.randomUUID();
      await query(
        `INSERT INTO leads_crm (id, application_id, customer_id, assigned_agent_id, lead_status, call_logs, follow_up_date)
         VALUES ($1, $2, $3, $4, 'New', $5, NOW() + INTERVAL '1 day')`,
        [
          leadId,
          id,
          validUserId || null,
          assigned_staff_id || null,
          `Application submitted for ${product_name || 'Loan'} ($${requested_amount || 0}). Auto-routed to CRM pipeline.`
        ]
      );
    } catch (crmErr) {
      console.warn('CRM auto-lead insert note:', crmErr.message);
    }

    await logAudit(validUserId, 'SUBMIT_APPLICATION', `applications:${id}`, req.ip);

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully to live Supabase database!',
      data: appRes.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/applications/:id/status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, actor_id } = req.body;

  try {
    const result = await query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    await logAudit(actor_id || null, `APP_STATUS_${status.toUpperCase()}`, `applications:${id}`, req.ip);
    res.json({ status: 'success', message: `Application status updated to ${status}`, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
