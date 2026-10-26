const { pool, query, isLive } = require('./db');
const crypto = require('crypto');

// In-memory fallback in case network drops
const mockStore = {
  users: [],
  profiles: [],
  financial_products: [],
  applications: [],
  kyc_documents: [],
  documents: [],
  leads_crm: [],
  partner_share: [],
  audit_logs: []
};

// Audit log recorder into live Supabase audit_logs table
async function logAudit(actorId, action, targetEntity, ipAddress = '127.0.0.1') {
  const entry = {
    id: crypto.randomUUID(),
    actor_id: actorId || null,
    action_performed: action,
    target_entity: targetEntity,
    ip_address: ipAddress,
    timestamp: new Date().toISOString()
  };

  try {
    await query(
      `INSERT INTO audit_logs (id, actor_id, action_performed, target_entity, ip_address, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entry.id, entry.actor_id, entry.action_performed, entry.target_entity, entry.ip_address, entry.timestamp]
    );
  } catch (err) {
    // If foreign key constraint triggers on actor_id not existing in users table, insert with null actor_id
    if (err.message && err.message.includes('foreign key constraint')) {
      try {
        await query(
          `INSERT INTO audit_logs (id, actor_id, action_performed, target_entity, ip_address, timestamp)
           VALUES ($1, NULL, $2, $3, $4, $5)`,
          [entry.id, entry.action_performed, entry.target_entity, entry.ip_address, entry.timestamp]
        );
      } catch (innerErr) {
        console.warn('[Audit] Secondary insert failed:', innerErr.message);
      }
    } else {
      console.warn('[Audit] Insert error:', err.message);
    }
  }

  mockStore.audit_logs.unshift(entry);
  return entry;
}

module.exports = {
  pool,
  query,
  isLive,
  getMockStore: () => mockStore,
  logAudit
};
