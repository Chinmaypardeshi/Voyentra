const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/documents
exports.getDocuments = async (req, res) => {
  const { application_id, user_id } = req.query;

  try {
    let sql = 'SELECT * FROM documents';
    const conds = [];
    const params = [];
    if (application_id) {
      params.push(application_id);
      conds.push(`application_id = $${params.length}`);
    }
    if (user_id) {
      params.push(user_id);
      conds.push(`user_id = $${params.length}`);
    }
    if (conds.length > 0) sql += ` WHERE ${conds.join(' AND ')}`;
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/documents
exports.uploadDocument = async (req, res) => {
  const { application_id, user_id, document_type, file_url, raw_text } = req.body;
  const id = crypto.randomUUID();

  let simulatedOcr = {
    detected_type: document_type || 'Identity Proof',
    extraction_date: new Date().toISOString(),
    confidence_score: 0.98
  };

  if ((document_type || '').toLowerCase().includes('pan')) {
    simulatedOcr.extracted_pan = (raw_text && raw_text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)) ? raw_text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)[0] : 'BNZPK9876Q';
    simulatedOcr.status = 'AUTHENTIC';
  } else if ((document_type || '').toLowerCase().includes('aadhaar')) {
    simulatedOcr.aadhaar_last4 = '4821';
    simulatedOcr.dob = '1990-11-20';
    simulatedOcr.status = 'AUTHENTIC';
  } else {
    simulatedOcr.verified_income_monthly = 95000;
    simulatedOcr.status = 'VERIFIED_SALARY_SLIP';
  }

  try {
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

    const result = await query(
      `INSERT INTO documents (id, application_id, user_id, document_type, file_url, verification_status, ocr_data)
       VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
       RETURNING *`,
      [
        id,
        application_id || null,
        validUserId || null,
        document_type || 'General Proof',
        file_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        JSON.stringify(simulatedOcr)
      ]
    );

    await logAudit(validUserId, 'UPLOAD_DOCUMENT', `documents:${id}`, req.ip);

    res.status(201).json({
      status: 'success',
      message: 'Document and OCR stored in live Supabase database!',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/documents/:id/verify
exports.verifyDocument = async (req, res) => {
  const { id } = req.params;
  const { verification_status, actor_id } = req.body;

  try {
    const result = await query(
      'UPDATE documents SET verification_status = $1 WHERE id = $2 RETURNING *',
      [verification_status, id]
    );
    await logAudit(actor_id || null, `DOC_${verification_status.toUpperCase()}`, `documents:${id}`, req.ip);
    res.json({ status: 'success', message: `Document verification set to ${verification_status}`, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
