const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

router.get('/leads', crmController.getLeads);
router.patch('/leads/:id', crmController.updateLead);

module.exports = router;
