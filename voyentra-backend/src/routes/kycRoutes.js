const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');

router.get('/:userId', kycController.getKycByUser);
router.post('/', kycController.submitKyc);
router.patch('/:id/status', kycController.verifyKyc);

module.exports = router;
