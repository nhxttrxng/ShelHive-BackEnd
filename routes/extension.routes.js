const express = require('express');
const router = express.Router();
const extensionController = require('../controllers/extension.controller');

// Lấy tất cả yêu cầu gia hạn 
router.get('/', extensionController.getAllExtensions);

// Lấy yêu cầu gia hạn theo mã gia hạn
router.get('/:id', extensionController.getExtensionById);

// Lấy yêu cầu gia hạn theo mã hóa đơn
router.get('/invoice/:invoiceId', extensionController.getExtensionsByInvoiceId);

// Lấy lịch sử gia hạn của hóa đơn
router.get('/invoice/:invoiceId/history', extensionController.getExtensionHistoryByInvoice);

// Tính toán tiền lãi dự kiến
router.post('/calculate', extensionController.calculateExpectedInterest);

// Tạo yêu cầu gia hạn mới
router.post('/', extensionController.createExtension);

// Cập nhật yêu cầu gia hạn
router.put('/:id', extensionController.updateExtension);

// Duyệt yêu cầu gia hạn 
router.patch('/:id/approve', extensionController.approveExtension);

// Từ chối yêu cầu gia hạn 
router.patch('/:id/reject', extensionController.rejectExtension);

// Xóa yêu cầu gia hạn
router.delete('/:id', extensionController.deleteExtension);

router.get('/latest-approved/:invoiceId', extensionController.getLatestApprovedExtensionByInvoiceId);
router.get('/pending-by-room/:roomId', extensionController.getPendingExtensionsByRoomId);

module.exports = router; 