const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/profiles', authController.getProfiles);
router.get('/profiles/:id', authController.getProfileById);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
