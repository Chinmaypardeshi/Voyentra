const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/travel/requests
router.post('/requests', async (req, res) => {
  const { organizationId, travelerId, destination, startDate, endDate, estimatedBudget, currency } = req.body;

  try {
    const MAX_POLICY_BUDGET = 50000;
    if (estimatedBudget > MAX_POLICY_BUDGET) {
      return res.status(400).json({
        status: 'error',
        message: `Policy Violation: Estimated budget (${estimatedBudget}) exceeds the standard policy limit of ${MAX_POLICY_BUDGET}.`
      });
    }

    const query = `
      INSERT INTO travel_requests (organization_id, traveler_id, destination, start_date, end_date, estimated_budget, currency, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *;
    `;
    const values = [organizationId, travelerId, destination, startDate, endDate, estimatedBudget, currency || 'USD'];
    const result = await pool.query(query, values);

    res.status(201).json({
      status: 'success',
      message: 'Travel request submitted successfully!',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// GET /api/travel/requests/:orgId
router.get('/requests/:orgId', async (req, res) => {
  const { orgId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM travel_requests WHERE organization_id = $1 ORDER BY created_at DESC',
      [orgId]
    );
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

module.exports = router;