const OTP = require('../models/otp.model');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const nodemailer = require('nodemailer');

// Lấy toàn bộ OTP
exports.getAllOtp = async (req, res) => {
  try {
    const rows = await OTP.getAll();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy OTP', error: err.message });
  }
};

// Xóa OTP theo email
exports.deleteOtpByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await OTP.deleteByEmail(email);

    if (result.rowCount === 0)  // Kiểm tra với PostgreSQL
      return res.status(404).json({ message: 'Không tìm thấy OTP với email này' });

    res.status(200).json({ message: 'Xóa OTP thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xóa OTP', error: err.message });
  }
};

// Xóa tất cả OTP hết hạn
exports.deleteExpiredOtps = async (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  try {
    const result = await OTP.deleteExpired(now);

    if (result.rowCount === 0)  // Kiểm tra với PostgreSQL
      return res.status(404).json({ message: 'Không có OTP hết hạn để xóa' });

    res.status(200).json({ message: 'Đã xóa OTP hết hạn' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xóa OTP hết hạn', error: err.message });
  }
};
