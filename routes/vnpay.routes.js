const express = require('express');
const router = express.Router();
const vnpay = require('../controllers/vnpay.controller');

// 1. Tạo link thanh toán (POST)
router.post('/create', vnpay.createPayment);

// 2. Nhận callback sau thanh toán (GET)
router.get('/return', vnpay.returnUrl);

module.exports = router;
