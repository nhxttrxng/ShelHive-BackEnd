const express = require('express');
const router = express.Router();
const invoiceNotificationController = require('../controllers/invoiceNotification.controller');

// Lấy tất cả thông báo
router.get('/', invoiceNotificationController.getAllNotifications);

// Lấy thông báo theo ID
router.get('/:id', invoiceNotificationController.getNotificationById);

// Lấy thông báo theo mã hóa đơn
router.get('/by-invoice/:invoiceId', invoiceNotificationController.getNotificationsByInvoiceId);

// Lấy thông báo theo mã phòng
router.get('/by-room/:roomId', invoiceNotificationController.getNotificationsByRoomId);

// Lấy thông báo theo mã dãy trọ
router.get('/by-motel/:motelId', invoiceNotificationController.getNotificationsByMotelId);

// Tạo thông báo mới
router.post('/', invoiceNotificationController.createNotification);

// Tạo thông báo tự động
router.post('/auto', invoiceNotificationController.createAutomaticNotification);

// Cập nhật thông báo
router.put('/:id', invoiceNotificationController.updateNotification);

// Xóa thông báo
router.delete('/:id', invoiceNotificationController.deleteNotification);

module.exports = router;
