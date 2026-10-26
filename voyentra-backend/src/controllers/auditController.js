const { query } = require('../config/supabase');

// GET /api/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*, u.full_name as actor_name, u.role as actor_role
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const [appRes, prodRes, kycRes, leadRes, shareRes] = await Promise.all([
      query('SELECT count(*) as count, COALESCE(SUM(requested_amount), 0) as total_volume FROM applications'),
      query('SELECT count(*) as count FROM financial_products'),
      query("SELECT count(*) as count FROM kyc_documents WHERE status = 'Pending Review'"),
      query('SELECT count(*) as count FROM leads_crm'),
      query('SELECT count(*) as count FROM partner_share')
    ]);

    res.json({
      status: 'success',
      data: {
        total_applications: Number(appRes.rows[0]?.count || 0),
        total_requested_amount: Number(appRes.rows[0]?.total_volume || 0),
        active_products: Number(prodRes.rows[0]?.count || 0),
        pending_kyc: Number(kycRes.rows[0]?.count || 0),
        total_leads: Number(leadRes.rows[0]?.count || 0),
        shared_with_banks: Number(shareRes.rows[0]?.count || 0),
        is_live_supabase: true,
        database: {
          host: 'db.zexqcbyyosuzmhodyaxk.supabase.co',
          status: 'CONNECTED_LIVE'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
