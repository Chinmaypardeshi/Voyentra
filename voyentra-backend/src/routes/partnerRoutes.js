const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

router.get('/', partnerController.getPartnerShares);
router.post('/', partnerController.shareWithBank);
router.patch('/:id/offer', partnerController.submitOffer);

module.exports = router;
