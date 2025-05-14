// stat.routes.js
const express = require('express');
const router = express.Router();
const statController = require('../controllers/stat.controller');

// Thống kê tiền trọ (đã thanh toán, còn nợ)
router.get('/payment/:ma_day/:thang', statController.getPaymentStats);

// Thống kê lợi nhuận điện nước
router.get('/utility-profit/:ma_day/:thang', statController.getUtilityProfitStats);

// Thống kê lịch sử sử dụng điện nước theo phòng
router.get('/utility-history/:ma_phong/:tu_thang/:den_thang', statController.getRoomUtilityHistory);

// Thống kê định kỳ (tháng, quý, năm)
router.get('/periodic/:ma_day/:tu_thang/:den_thang/:loai_thong_ke', statController.getPeriodicStats);

module.exports = router;