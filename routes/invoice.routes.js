const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// Lấy tất cả hóa đơn 
router.get('/', invoiceController.getAllInvoices);

// Lấy thống kê hóa đơn theo tháng 
router.get('/stats', invoiceController.getMonthlyStats);

// Lấy thống kê chi tiết hóa đơn theo tháng 
router.get('/detailed-stats/:year/:month', invoiceController.getDetailedMonthlyStats);

// Tính toán hóa đơn dựa trên chỉ số điện nước (không tạo hóa đơn thật)
router.post('/calculate', invoiceController.calculateInvoice);

// Lấy hóa đơn theo dãy trọ
router.get('/motel/:motelId', invoiceController.getInvoicesByMotel);

// Lấy hóa đơn chưa thanh toán theo dãy trọ
router.get('/motel/:motelId/unpaid', invoiceController.getUnpaidInvoicesByMotel);

// Lấy hóa đơn theo phòng
router.get('/room/:roomId', invoiceController.getInvoicesByRoom);

// Lấy hóa đơn chưa thanh toán theo phòng
router.get('/room/:roomId/unpaid', invoiceController.getUnpaidInvoicesByRoom);

// Lấy hóa đơn theo ID
router.get('/:id', invoiceController.getInvoiceById);

// Lấy chỉ số điện, nước mới của hóa đơn gần nhất theo mã phòng
router.get('/room/:roomId/latest-meter', invoiceController.getLatestMeterIndexesByRoom);

// Tạo hóa đơn mới
router.post('/', invoiceController.createInvoice);

// Cập nhật hóa đơn 
router.put('/:id', invoiceController.updateInvoice);

// Cập nhật trạng thái hóa đơn 
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// Xóa hóa đơn
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;