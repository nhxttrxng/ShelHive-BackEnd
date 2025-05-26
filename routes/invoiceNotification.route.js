const express = require('express');
const router = express.Router();
const invoiceNotificationController = require('../controllers/invoiceNotification.controller');

// GET tất cả thông báo hóa đơn
router.get('/', invoiceNotificationController.getAllNotifications);

// GET thông báo hóa đơn theo ID
router.get('/:id', invoiceNotificationController.getNotificationById);

// GET thông báo hóa đơn theo mã hóa đơn
router.get('/mahoadon/:ma_hoa_don', invoiceNotificationController.getNotificationsByHoaDonId);

// GET thông báo hóa đơn theo mã dãy trọ
router.get('/daytro/:ma_day', invoiceNotificationController.getInvoiceNotificationsByMaDay);

// GET thông báo hóa đơn theo mã phòng trọ
router.get('/phong/:ma_phong', invoiceNotificationController.getInvoiceNotificationsByMaPhong);

// POST tạo thông báo mới
router.post('/', invoiceNotificationController.createNotification);

// PUT cập nhật thông báo
router.put('/:ma_thong_bao_hoa_don', invoiceNotificationController.updateNotification);

// DELETE xóa thông báo
router.delete('/:ma_thong_bao_hoa_don', invoiceNotificationController.deleteNotification);

module.exports = router;
