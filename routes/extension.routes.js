const express = require('express');
const router = express.Router();
const extensionController = require('../controllers/extension.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Lấy tất cả yêu cầu gia hạn (chỉ admin)
router.get('/', verifyToken, verifyAdmin, extensionController.getAllExtensions);

// Lấy yêu cầu gia hạn theo mã gia hạn
router.get('/:id', verifyToken, extensionController.getExtensionById);

// Lấy yêu cầu gia hạn theo mã hóa đơn
router.get('/invoice/:invoiceId', verifyToken, extensionController.getExtensionsByInvoiceId);

// Lấy lịch sử gia hạn của hóa đơn
router.get('/invoice/:invoiceId/history', verifyToken, extensionController.getExtensionHistoryByInvoice);

// Tính toán tiền lãi dự kiến
router.post('/calculate', verifyToken, extensionController.calculateExpectedInterest);

// Tạo yêu cầu gia hạn mới
router.post('/', verifyToken, extensionController.createExtension);

// Cập nhật yêu cầu gia hạn
router.put('/:id', verifyToken, extensionController.updateExtension);

// Duyệt yêu cầu gia hạn (chỉ admin)
router.patch('/:id/approve', verifyToken, verifyAdmin, extensionController.approveExtension);

// Từ chối yêu cầu gia hạn (chỉ admin)
router.patch('/:id/reject', verifyToken, verifyAdmin, extensionController.rejectExtension);

// Xóa yêu cầu gia hạn
router.delete('/:id', verifyToken, extensionController.deleteExtension);

module.exports = router; 