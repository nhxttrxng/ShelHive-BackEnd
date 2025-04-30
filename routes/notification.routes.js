const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Lấy tất cả thông báo
router.get('/', notificationController.getAll);

// GET theo mã dãy (URL cũ)
router.get('/day/:ma_day', notificationController.getByMaDay);

// GET theo mã dãy (URL mới)
router.get('/motel/:ma_day', notificationController.getByMaDay);

// Lấy thông báo theo user_id
router.get('/:user_id', notificationController.getByUserId);

// Tạo mới thông báo
router.post('/', notificationController.create);

// Cập nhật thông báo
router.put('/:id', notificationController.update);

// Xóa thông báo
router.delete('/:id', notificationController.remove);

module.exports = router;
