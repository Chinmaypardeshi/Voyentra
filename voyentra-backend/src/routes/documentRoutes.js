const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.get('/', documentController.getDocuments);
router.post('/', documentController.uploadDocument);
router.patch('/:id/verify', documentController.verifyDocument);

module.exports = router;
