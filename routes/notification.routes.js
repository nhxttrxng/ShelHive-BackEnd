const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Lấy tất cả thông báo
router.get('/', notificationController.getAll);

// Lấy thông báo theo mã dãy
router.get('/day/:ma_day', notificationController.getByMaDay);

// Lấy thông báo theo mã phòng
router.get('/phong/:ma_phong', notificationController.getByMaPhong);

// Lấy thông báo theo mã thông báo
router.get('/:ma_thong_bao', notificationController.getThongBaoByMaThongBao);

// Tạo mới thông báo
router.post('/', notificationController.create);

// Cập nhật thông báo
router.put('/:ma_thong_bao', notificationController.update);

// Xóa thông báo
router.delete('/:ma_thong_bao', notificationController.remove);

module.exports = router;
