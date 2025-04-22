const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const OTP = require('../models/otp.model');

// Đăng ký người dùng
exports.register = async (req, res) => {
  const { email, ho_ten, sdt, mat_khau } = req.body;

  if (!email || !ho_ten || !sdt || !mat_khau)
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });

  try {
    const user = await User.getByEmail(email);
    if (user) return res.status(409).json({ message: 'Email đã được đăng ký' });

    const hash = await bcrypt.hash(mat_khau, 10);
    await User.create({ email, ho_ten, sdt, mat_khau: hash });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đăng nhập user & admin
exports.login = async (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau)
    return res.status(400).json({ message: 'Thiếu thông tin' });

  const table = email.endsWith('@admin.com') ? Admin : User;

  try {
    const user = await table.getByEmail(email);
    if (!user) return res.status(401).json({ message: 'Email không tồn tại' });

    const match = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ email, role: table.name.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token, role: table.name.toLowerCase() });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Gửi OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const user = await User.getByEmail(email);
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Math.floor(Date.now() / 1000) + 300;

    await OTP.create({ email, otp, expiration_time: expires });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Mã OTP đổi mật khẩu',
      text: `Mã OTP của bạn là: ${otp} (có hiệu lực 5 phút)`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return res.status(500).json({ message: 'Gửi mail thất bại' });
      res.status(200).json({ message: 'Đã gửi mã OTP' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xác thực OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Thiếu email hoặc OTP' });

  const now = Math.floor(Date.now() / 1000);

  try {
    const row = await OTP.getByEmailAndOtp(email, otp);
    if (!row) return res.status(404).json({ message: 'OTP sai hoặc không tồn tại' });
    if (row.expiration_time < now)
      return res.status(410).json({ message: 'OTP đã hết hạn' });

    res.status(200).json({ message: 'OTP hợp lệ' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đổi mật khẩu 
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Thiếu thông tin' });

  try {
    const row = await OTP.getByEmailAndOtp(email, otp);
    if (!row) return res.status(404).json({ message: 'OTP không đúng' });

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(email, hash);
    await OTP.deleteByEmail(email); // Xóa OTP sau khi đổi mật khẩu

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
