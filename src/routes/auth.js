const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/register', authController.cadastrar);
router.post('/confirm', authController.confirmar);
router.post('/login', authController.login);


module.exports = router;