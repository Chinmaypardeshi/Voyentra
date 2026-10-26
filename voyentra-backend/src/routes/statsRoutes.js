const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/stats/overview - High level metrics for dashboards
router.get('/overview', async (req, res) => {
  try {
    const mock = db.getMockDb();
    let totalApps = mock.applications.length;
    let totalAmount = mock.applications.reduce((acc, a) => acc + (Number(a.requested_amount) || 0), 0);
    let totalProducts = mock.financial_products.length;
    let pendingKyc = mock.kyc_documents.filter(k => k.status === 'Pending Review').length;
    let totalLeads = mock.leads_crm.length;
    let sharedWithBanks = mock.partner_share.length;

    const supabase = db.getSupabaseClient();
    if (supabase) {
      try {
        const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
        const { count: prodCount } = await supabase.from('financial_products').select('*', { count: 'exact', head: true });
        const { count: kycCount } = await supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'Pending Review');
        const { count: leadCount } = await supabase.from('leads_crm').select('*', { count: 'exact', head: true });
        const { count: shareCount } = await supabase.from('partner_share').select('*', { count: 'exact', head: true });

        if (appCount !== null) totalApps = appCount;
        if (prodCount !== null) totalProducts = prodCount;
        if (kycCount !== null) pendingKyc = kycCount;
        if (leadCount !== null) totalLeads = leadCount;
        if (shareCount !== null) sharedWithBanks = shareCount;
      } catch (e) {
        console.warn('Supabase stats fetch error:', e.message);
      }
    }

    res.json({
      status: 'success',
      data: {
        total_applications: totalApps,
        total_requested_amount: totalAmount,
        active_products: totalProducts,
        pending_kyc: pendingKyc,
        total_leads: totalLeads,
        shared_with_banks: sharedWithBanks,
        database: {
          mode: db.getMode(),
          message: db.getStatusMessage(),
          is_cloud_supabase: db.getMode() === 'supabase'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/stats/db-health - Detailed DB connection diagnostics
router.get('/db-health', (req, res) => {
  res.json({
    status: 'success',
    mode: db.getMode(),
    message: db.getStatusMessage(),
    env: {
      has_supabase_url: Boolean(process.env.SUPABASE_URL),
      has_supabase_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
      has_database_url: Boolean(process.env.DATABASE_URL),
      has_db_host: Boolean(process.env.DB_HOST)
    }
  });
});

module.exports = router;
