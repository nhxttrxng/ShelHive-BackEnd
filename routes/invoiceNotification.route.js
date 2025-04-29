/* const express = require('express');
const router = express.Router();
const invoiceNotificationController = require('../controllers/invoiceNotification.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Lấy tất cả thông báo hóa đơn - Chỉ admin có quyền
router.get('/', verifyToken, checkRole(['admin']), invoiceNotificationController.getAllNotifications);

// Lấy thông báo hóa đơn theo ID
router.get('/:id', verifyToken, invoiceNotificationController.getNotificationById);

// Lấy thông báo hóa đơn theo mã hóa đơn
router.get('/invoice/:invoiceId', verifyToken, invoiceNotificationController.getNotificationsByInvoiceId);

// Lấy thông báo hóa đơn theo mã phòng
router.get('/room/:roomId', verifyToken, invoiceNotificationController.getNotificationsByRoomId);

// Lấy thông báo hóa đơn theo mã dãy trọ
router.get('/motel/:motelId', verifyToken, checkRole(['admin', 'chu_tro']), invoiceNotificationController.getNotificationsByMotelId);

// Tạo thông báo hóa đơn mới
router.post('/', verifyToken, checkRole(['admin', 'chu_tro']), invoiceNotificationController.createNotification);

// Tạo thông báo hóa đơn tự động
router.post('/automatic', verifyToken, checkRole(['admin', 'chu_tro']), invoiceNotificationController.createAutomaticNotification);

// Cập nhật thông báo hóa đơn
router.put('/:id', verifyToken, checkRole(['admin', 'chu_tro']), invoiceNotificationController.updateNotification);

// Xóa thông báo hóa đơn
router.delete('/:id', verifyToken, checkRole(['admin', 'chu_tro']), invoiceNotificationController.deleteNotification);

module.exports = router; */