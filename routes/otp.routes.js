const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

// API lấy tất cả OTP (dành cho admin hoặc kiểm tra)
router.get('/all', otpController.getAllOtp);

// API xóa OTP hết hạn
router.delete('/expired', otpController.deleteExpiredOtps);

// API xóa OTP theo email
router.delete('/:email', otpController.deleteOtpByEmail);

module.exports = router;
