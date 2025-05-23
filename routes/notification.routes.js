const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Lấy tất cả thông báo
router.get('/', notificationController.getAll);

// GET theo mã dãy (URL cũ)
router.get('/day/:ma_day', notificationController.getByMaDay);

// Route lấy thông báo theo mã phòng (ĐƯA LÊN TRƯỚC)
// ...existing code...
// Route lấy thông báo theo mã phòng (ĐƯA LÊN TRƯỚC)
router.get('/phong/:ma_phong', notificationController.getByMaPhong);
// ...existing code...

// Tạo mới thông báo
router.post('/', notificationController.create);

// Cập nhật thông báo
router.put('/:id', notificationController.update);

// Xóa thông báo
router.delete('/:id', notificationController.remove);

module.exports = router;