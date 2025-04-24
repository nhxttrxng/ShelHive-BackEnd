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
    const existingAdmin = await Admin.getAdminByEmail(email);
    const existingUser = await User.getUserByEmail(email);

    if (existingAdmin || existingUser)
      return res.status(409).json({ message: 'Email đã được đăng ký' });

    const hash = await bcrypt.hash(mat_khau, 10);
    await User.addUser({ email, ho_ten, sdt, mat_khau: hash });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau)
    return res.status(400).json({ message: 'Thiếu thông tin' });

  try {
    let user = await Admin.getAdminByEmail(email);
    let role = 'admin';

    if (!user) {
      user = await User.getUserByEmail(email);
      role = 'user';
    }

    if (!user)
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

    const match = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!match)
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Gửi OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const user = await User.getUserByEmail(email);
    const admin = await Admin.getAdminByEmail(email);

    if (!user && !admin)
      return res.status(404).json({ message: 'Email không tồn tại' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Math.floor(Date.now() / 1000) + 300; // 5 phút

    await OTP.addOTP({
      email,
      otp,
      expiration_time: expires,
      role: user ? 'user' : 'admin'
    });

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
      subject: 'Mã xác thực OTP',
      text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Gửi OTP thành công' });
  } catch (err) {
    console.error('Lỗi khi gửi OTP:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
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

    if (OTP.isExpired(row.expiration_time, now))
      return res.status(410).json({ message: 'OTP đã hết hạn' });

    res.status(200).json({ message: 'OTP hợp lệ' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
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

    const now = Math.floor(Date.now() / 1000);
    if (OTP.isExpired(row.expiration_time, now))
      return res.status(410).json({ message: 'OTP đã hết hạn' });

    const hash = await bcrypt.hash(newPassword, 10);

    const user = await User.getUserByEmail(email);
    const admin = await Admin.getAdminByEmail(email);

    await OTP.deleteByEmail(email); // Xoá OTP trước để tránh lỗi lặp lại nếu cập nhật mật khẩu thất bại

    if (user) {
      await User.updatePassword(email, hash);
    } else if (admin) {
      await Admin.updatePassword(email, hash);
    } else {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Lỗi khi reset mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Gửi lại OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const user = await User.getUserByEmail(email);
    const admin = await Admin.getAdminByEmail(email);

    if (!user && !admin)
      return res.status(404).json({ message: 'Email không tồn tại' });

    // Xoá OTP cũ nếu có
    await OTP.deleteByEmail(email);

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Math.floor(Date.now() / 1000) + 300;

    await OTP.addOTP(email, otp, expires, user ? 'user' : 'admin');

    // Gửi mail
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
      subject: 'Gửi lại mã OTP',
      text: `Mã OTP mới của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Gửi lại OTP thành công' });
  } catch (err) {
    console.error('Lỗi khi gửi lại OTP:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
