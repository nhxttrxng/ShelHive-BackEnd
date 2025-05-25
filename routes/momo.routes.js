const express = require('express');
const router = express.Router();
const momo = require('../controllers/momo.controller');

// Tạo yêu cầu thanh toán
router.post('/create-payment', momo.createPayment);

// MoMo gọi lại IPN/Callback khi thanh toán
router.post('/callback', momo.paymentCallback);

module.exports = router;
