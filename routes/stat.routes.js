const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/stat.controller');

// Các route theo từng chức năng

// 1. Tổng tiền trọ chưa thanh toán theo dãy, tháng, năm
router.get('/unpaid-rent/:ma_day/:month/:year', thongKeController.getTotalUnpaidRentByDay);

// 2. Tiền trọ đã thanh toán theo dãy, tháng, năm
router.get('/paid-rent/:ma_day/:month/:year', thongKeController.getPaidRentByDayAndMonth);

// 3. Tổng số phòng đã thanh toán theo dãy, tháng, năm
router.get('/paid-room-count/:ma_day/:month/:year', thongKeController.getPaidRoomCountByDayAndMonth);

// 4. Tổng số phòng trễ hạn theo dãy, tháng, năm
router.get('/overdue-room-count/:ma_day/:month/:year', thongKeController.getOverdueRoomCountByDayAndMonth);

// 5. Tổng số phòng chưa đóng theo dãy, tháng, năm
router.get('/unpaid-room-count/:ma_day/:month/:year', thongKeController.getUnpaidRoomCountByDayAndMonth);

// 6. Tiền lời điện theo dãy, tháng, năm
router.get('/electric-profit/:ma_day/:month/:year', thongKeController.getElectricProfitByDayAndMonth);

// 7. Tiền lời nước theo dãy, tháng, năm
router.get('/water-profit/:ma_day/:month/:year', thongKeController.getWaterProfitByDayAndMonth);

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
