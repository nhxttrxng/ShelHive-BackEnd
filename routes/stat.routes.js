const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/stat.controller');

// Các route theo từng chức năng

// 1. Tổng tiền trọ chưa thanh toán theo dãy, tháng, năm
router.get('/rent-money/:ma_day/:month/:year', thongKeController.getRentStatsByDayMonthYear);

// 3. Tổng số phòng đã thanh toán theo dãy, tháng, năm
router.get('/room_count/:ma_day/:month/:year', thongKeController.getRoomStatusCountByDayMonthYear);

// 10. Route tiền lời điện theo tháng và dãy
router.get('/electric-profit/:ma_day/:fromMonth/:fromYear/:toMonth/:toYear', thongKeController.getElectricProfitByMonthAndDay);

// 11. Route tiền lời nước theo tháng và dãy
router.get('/water-profit/:ma_day/:fromMonth/:fromYear/:toMonth/:toYear', thongKeController.getWaterProfitByMonthAndDay);

// 8. Tiền điện theo tháng và phòng
router.get('/electric-money/:ma_phong/:fromMonth/:fromYear/:toMonth/:toYear', thongKeController.getElectricMoneyByMonthAndRoom);

// 9. Tiền nước theo tháng và phòng
router.get('/water-money/:ma_phong/:fromMonth/:fromYear/:toMonth/:toYear', thongKeController.getWaterMoneyByMonthAndRoom);

// 10. Tháng có tiền điện cao nhất theo phòng
router.get('/max-electric-month/:ma_phong', thongKeController.getMaxElectricMonthByRoom);

// 11. Tháng có tiền nước cao nhất theo phòng
router.get('/max-water-month/:ma_phong', thongKeController.getMaxWaterMonthByRoom);

// 12. Tháng có tiền điện thấp nhất theo phòng
router.get('/min-electric-month/:ma_phong', thongKeController.getMinElectricMonthByRoom);

// 13. Tháng có tiền nước thấp nhất theo phòng
router.get('/min-water-month/:ma_phong', thongKeController.getMinWaterMonthByRoom);

module.exports = router;
