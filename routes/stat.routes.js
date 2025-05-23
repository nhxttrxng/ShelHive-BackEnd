// stat.route.js
const express = require('express');
const router = express.Router();
const StatController = require('../controllers/stat.controller');

// GET: Tổng tiền trọ
router.get('/total-rent', StatController.getTotalRent);

// GET: Trạng thái thanh toán phòng
router.get('/room-payment-status', StatController.getRoomPaymentStatus);

// GET: Doanh thu chênh lệch tiền điện/nước
router.get('/electric-water-difference', StatController.getElectricWaterRevenueDifference);

// GET: Tiền điện và nước theo tháng của một năm
router.get('/electric-water-by-month/:year', StatController.getElectricWaterByMonth);

// GET: Tháng dùng điện/nước nhiều nhất và ít nhất trong năm
router.get('/max-min-electric-water/:year', StatController.getMaxMinElectricWaterUsage);

module.exports = router;
