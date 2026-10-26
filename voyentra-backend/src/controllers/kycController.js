const { query, logAudit } = require('../config/supabase');

// GET /api/kyc/:userId
exports.getKycByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query('SELECT * FROM kyc_documents WHERE user_id = $1', [userId]);
    return res.json({ status: 'success', data: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/kyc
exports.submitKyc = async (req, res) => {
  const { user_id, pan_number, aadhaar_number } = req.body;

  try {
    let validUserId = user_id;
    if (!validUserId) {
      const firstProf = await query('SELECT id FROM profiles LIMIT 1');
      validUserId = firstProf.rows[0]?.id;
    }

    const result = await query(
      `INSERT INTO kyc_documents (user_id, pan_number, aadhaar_number, status, submitted_at)
       VALUES ($1, $2, $3, 'Pending Review', NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET pan_number = EXCLUDED.pan_number,
           aadhaar_number = EXCLUDED.aadhaar_number,
           status = 'Pending Review',
           submitted_at = NOW()
       RETURNING *`,
      [validUserId, pan_number, aadhaar_number]
    );

    await logAudit(validUserId, 'SUBMIT_KYC', `kyc_documents:${validUserId}`, req.ip);

    res.status(200).json({
      status: 'success',
      message: 'KYC documents recorded in live Supabase database!',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/kyc/:id/status
exports.verifyKyc = async (req, res) => {
  const { id } = req.params;
  const { status, actor_id } = req.body;

  try {
    const result = await query(
      'UPDATE kyc_documents SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    await logAudit(actor_id || null, `KYC_${status.toUpperCase()}`, `kyc_documents:${id}`, req.ip);
    res.json({ status: 'success', message: `KYC status changed to ${status}`, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
