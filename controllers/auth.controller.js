const bcrypt = require('bcryptjs');
const db = require('../db/database');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Đăng ký người dùng
exports.register = async (req, res) => {
  const { email, ho_ten, sdt, mat_khau } = req.body;

  if (!email || !ho_ten || !sdt || !mat_khau)
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });

  db.get(`SELECT * FROM USER WHERE email = ?`, [email], async (err, user) => {
    if (user) return res.status(409).json({ message: 'Email đã được đăng ký' });

    const hash = await bcrypt.hash(mat_khau, 10);

    db.run(
      `INSERT INTO USER (email, ho_ten, sdt, mat_khau) VALUES (?, ?, ?, ?)`,
      [email, ho_ten, sdt, hash],
      (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        return res.status(201).json({ message: 'Đăng ký thành công' });
      }
    );
  });
};

// Đăng nhập user & admin
exports.login = (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau)
    return res.status(400).json({ message: 'Thiếu thông tin' });

  const table = email.endsWith('@admin.com') ? 'ADMIN' : 'USER';

  db.get(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, user) => {
    if (!user) return res.status(401).json({ message: 'Email không tồn tại' });

    const match = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ email, role: table.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token, role: table.toLowerCase() });
  });
};

// Gửi OTP
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  db.get(`SELECT * FROM USER WHERE email = ?`, [email], (err, user) => {
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Math.floor(Date.now() / 1000) + 300;

    db.run(`INSERT INTO OTP (email, otp, expiration_time) VALUES (?, ?, ?)`, [email, otp, expires]);

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
  });
};

// Xác thực OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Thiếu email hoặc OTP' });

  const now = Math.floor(Date.now() / 1000);

  db.get(`SELECT * FROM OTP WHERE email = ? AND otp = ?`, [email, otp], (err, row) => {
    if (!row) return res.status(404).json({ message: 'OTP sai hoặc không tồn tại' });
    if (row.expiration_time < now)
      return res.status(410).json({ message: 'OTP đã hết hạn' });

    res.status(200).json({ message: 'OTP hợp lệ' }); // Sau bước này frontend cho phép bước đổi mật khẩu
  });
};


// Đổi mật khẩu 
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Thiếu thông tin' });

  db.get(`SELECT * FROM OTP WHERE email = ? AND otp = ?`, [email, otp], async (err, row) => {
    if (!row) return res.status(404).json({ message: 'OTP không đúng' });

    const hash = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE USER SET mat_khau = ? WHERE email = ?`, [hash, email]);
    db.run(`DELETE FROM OTP WHERE email = ?`, [email]); // Xóa OTP sau khi đổi

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  });
};
