// invoice.routes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Lấy tất cả hóa đơn (chỉ admin)
router.get('/', verifyToken, verifyAdmin, invoiceController.getAllInvoices);

// Lấy thống kê hóa đơn theo tháng (chỉ admin)
router.get('/stats', verifyToken, verifyAdmin, invoiceController.getMonthlyStats);

// Lấy thống kê chi tiết hóa đơn theo tháng (chỉ admin)
router.get('/detailed-stats/:year/:month', verifyToken, verifyAdmin, invoiceController.getDetailedMonthlyStats);

// Tính toán hóa đơn dựa trên chỉ số điện nước (không tạo hóa đơn thật)
router.post('/calculate', verifyToken, verifyAdmin, invoiceController.calculateInvoice);

// Tạo hóa đơn tự động từ chỉ số điện nước
router.post('/automatic', verifyToken, verifyAdmin, invoiceController.createAutomaticInvoice);

// Lấy hóa đơn theo dãy trọ
router.get('/motel/:motelId', verifyToken, invoiceController.getInvoicesByMotel);

// Lấy hóa đơn chưa thanh toán theo dãy trọ
router.get('/motel/:motelId/unpaid', verifyToken, invoiceController.getUnpaidInvoicesByMotel);

// Lấy hóa đơn theo phòng
router.get('/room/:roomId', verifyToken, invoiceController.getInvoicesByRoom);

// Lấy hóa đơn chưa thanh toán theo phòng
router.get('/room/:roomId/unpaid', verifyToken, invoiceController.getUnpaidInvoicesByRoom);

// Lấy hóa đơn theo ID
router.get('/:id', verifyToken, invoiceController.getInvoiceById);

// Tạo hóa đơn mới (chỉ admin)
router.post('/', verifyToken, verifyAdmin, invoiceController.createInvoice);

// Cập nhật hóa đơn (chỉ admin)
router.put('/:id', verifyToken, verifyAdmin, invoiceController.updateInvoice);

// Cập nhật trạng thái hóa đơn (chỉ admin)
router.patch('/:id/status', verifyToken, verifyAdmin, invoiceController.updateInvoiceStatus);

// Yêu cầu gia hạn hóa đơn
router.post('/:id/request-extension', verifyToken, invoiceController.requestExtension);

// Duyệt gia hạn hóa đơn (chỉ admin)
router.patch('/:id/approve-extension', verifyToken, verifyAdmin, invoiceController.approveExtension);

// Xóa hóa đơn (chỉ admin)
router.delete('/:id', verifyToken, verifyAdmin, invoiceController.deleteInvoice);

module.exports = router;