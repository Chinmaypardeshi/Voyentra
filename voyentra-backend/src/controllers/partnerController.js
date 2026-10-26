const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/partner-share
exports.getPartnerShares = async (req, res) => {
  try {
    const result = await query(`
      SELECT ps.*, a.product_name, a.requested_amount, a.status as app_status, a.user_id as applicant_id,
             u.full_name as bank_name, u.email as bank_email,
             p.full_name as applicant_name, p.monthly_income as applicant_income
      FROM partner_share ps
      LEFT JOIN applications a ON ps.application_id = a.id
      LEFT JOIN users u ON ps.partner_bank_id = u.id
      LEFT JOIN profiles p ON a.user_id = p.id
      ORDER BY ps.shared_at DESC
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/partner-share
exports.shareWithBank = async (req, res) => {
  const { application_id, partner_bank_id, consent_given, actor_id } = req.body;
  const id = crypto.randomUUID();

  const defaultOffer = {
    initial_review: 'Underwriting queue',
    tentative_terms: 'Awaiting credit appraisal'
  };

  try {
    // Ensure partner bank exists in users
    let validBankId = partner_bank_id;
    if (!validBankId) {
      const bankUser = await query("SELECT id FROM users WHERE role ILIKE '%bank%' OR role ILIKE '%partner%' LIMIT 1");
      validBankId = bankUser.rows[0]?.id;
    }

    if (!validBankId) {
      const anyUser = await query("SELECT id FROM users LIMIT 1");
      validBankId = anyUser.rows[0]?.id;
    }

    const result = await query(
      `INSERT INTO partner_share (id, application_id, partner_bank_id, consent_given, partner_status, offer_details, shared_at)
       VALUES ($1, $2, $3, $4, 'Pending Review', $5, NOW())
       RETURNING *`,
      [
        id,
        application_id,
        validBankId || null,
        consent_given !== false,
        JSON.stringify(defaultOffer)
      ]
    );

    await logAudit(actor_id || null, 'SHARE_WITH_BANK', `partner_share:${id}`, req.ip);

    res.status(201).json({
      status: 'success',
      message: 'Application shared with co-lending partner bank in Supabase!',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/partner-share/:id/offer
exports.submitOffer = async (req, res) => {
  const { id } = req.params;
  const { partner_status, offer_details, actor_id } = req.body;

  try {
    const result = await query(
      `UPDATE partner_share
       SET partner_status = COALESCE($1, partner_status),
           offer_details = COALESCE($2, offer_details)
       WHERE id = $3
       RETURNING *`,
      [partner_status || null, offer_details ? JSON.stringify(offer_details) : null, id]
    );

    await logAudit(actor_id || null, 'PARTNER_OFFER_SUBMITTED', `partner_share:${id}`, req.ip);

    res.json({
      status: 'success',
      message: 'Bank sanction offer recorded in Supabase!',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
