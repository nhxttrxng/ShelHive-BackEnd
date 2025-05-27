// routes/vnpay.routes.js
const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');

router.post('/create_payment', vnpayController.createPayment);
router.get('/return', vnpayController.returnUrl);
router.get('/test_return', vnpayController.testReturnUrl);

module.exports = router;
