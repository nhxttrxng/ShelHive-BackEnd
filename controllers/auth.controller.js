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

  // Regex kiểm tra định dạng email đơn giản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: 'Email không hợp lệ' });

  try {
    const existingAdmin = await Admin.getAdminByEmail(email);
    const existingUser = await User.getUserByEmail(email);

    if (existingAdmin || existingUser)
      return res.status(409).json({ message: 'Email đã được đăng ký' });

    const hash = await bcrypt.hash(mat_khau, 10);
    
    // Thêm user với trạng thái chưa xác thực
    await User.addUser({ email, ho_ten, sdt, mat_khau: hash, is_verified: false });

    // Tạo token xác thực
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Gửi email xác thực
    const transporter = nodemailer.createTransport({
      service: 'gmail', // hoặc SMTP khác
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const verifyLink = `https://shelhive-backend.onrender.com/api/auth/verify?token=${token}`;

    const mailOptions = {
      from: `"ShelBee 🐝" <${process.env.MAIL_USER}>`,
      to: email,
      subject: '🐝 ShelBee - Xác Thực Tài Khoản Của Bạn',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fffbee; border: 1px solid #ffcc00; border-radius: 10px;">
          <h2 style="color: #ff9900;">Chào ${ho_ten}! 🐝</h2>
          <p style="font-size: 16px; color: #333;">
            Cảm ơn bạn đã đăng ký tài khoản với ShelHive! 
            Hãy xác thực tài khoản của bạn bằng cách nhấn vào liên kết dưới đây:
          </p>
          <div style="margin: 20px 0;">
            <a href="${verifyLink}" style="display: inline-block; background-color: #ffcc00; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Xác Thực Tài Khoản
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu liên kết không hoạt động, bạn cũng có thể sao chép và dán link sau vào trình duyệt:
          </p>
          <p style="word-break: break-all; color: #0066cc;">${verifyLink}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.<br/>
            <strong>ShelBee - Chú ong đồng hành cùng bạn 🐝</strong>
          </p>
        </div>
      `
    };
    

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực.' });
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xác thực mail
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(renderHTML('Thiếu token xác thực', false));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(404).send(renderHTML('Người dùng không tồn tại', false));
    }

    if (user.is_verified) {
      return res.status(400).send(renderHTML('Tài khoản đã xác thực trước đó rồi', false));
    }

    await User.updateUser(email, { is_verified: true });

    res.status(200).send(renderHTML('🎉 Xác thực tài khoản thành công! Bạn có thể đăng nhập.', true));
  } catch (err) {
    console.error('Lỗi xác thực email:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).send(renderHTML('Token đã hết hạn, vui lòng đăng ký lại.', false));
    }
    return res.status(400).send(renderHTML('Token không hợp lệ.', false));
  }
};

function renderHTML(message, success) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${success ? 'Thành Công' : 'Thất Bại'}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: ${success ? '#e0ffe0' : '#ffe0e0'};
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        h1 {
          color: ${success ? '#28a745' : '#dc3545'};
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          margin-top: 0.5rem;
          font-size: 1.2rem;
          color: #555;
        }
        .bee {
          width: 50px;
          height: 50px;
          background: url('https://images.emojiterra.com/google/android-12l/512px/1f41d.png') no-repeat center/contain;
          position: absolute;
          top: 10%;
          animation: fly 10s linear infinite;
        }
        @keyframes fly {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(50vw, 20vh) rotate(30deg);
          }
          50% {
            transform: translate(100vw, 40vh) rotate(0deg);
          }
          75% {
            transform: translate(50vw, 60vh) rotate(-30deg);
          }
          100% {
            transform: translate(0, 80vh) rotate(0deg);
          }
        }
        .flowers {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100px;
          background: url('https://images.emojiterra.com/google/noto-emoji/unicode-15/color/512px/1f33c.png') repeat-x bottom/contain;
        }
      </style>
      <script>
        setTimeout(() => {
          window.close();
          window.location.href = "/";
        }, 10000);
      </script>
    </head>
    <body>
      <div class="bee"></div>
      <h1>${message}</h1>
      <p>Trang sẽ tự động đóng sau 10 giây...</p>
      <div class="flowers"></div>
    </body>
    </html>
  `;
}

// Kiểm tra xác thực email
exports.checkVerify = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Thiếu email' });
  }

  try {
    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.is_verified) {
      return res.status(200).json({ verified: true });
    } else {
      return res.status(200).json({ verified: false });
    }
  } catch (err) {
    console.error('Lỗi khi kiểm tra xác thực:', err);
    res.status(500).json({ message: 'Lỗi server' });
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
      
      // Nếu là user thì kiểm tra xác thực email
      if (user && !user.is_verified) {
        return res.status(403).json({ message: 'Vui lòng xác thực email trước khi đăng nhập' });
      }
    }

    if (!user)
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

    const match = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!match)
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });

    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token, role });
    
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
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
      from: `"ShelBee 🐝" <${process.env.MAIL_USER}>`,
      to: email,
      subject: '🐝 ShelBee - Mã OTP Đổi Mật Khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fffbee; border: 1px solid #ffcc00; border-radius: 10px;">
          <h2 style="color: #ff9900;">Xin chào từ ShelBee! 🐝</h2>
          <p style="font-size: 16px; color: #333;">
            Bạn vừa yêu cầu đổi mật khẩu cho tài khoản của mình. 
            Đây là mã OTP xác thực để hoàn tất quá trình đổi mật khẩu:
          </p>
          <div style="font-size: 28px; font-weight: bold; color: #ff6600; margin: 20px 0;">${otp}</div>
          <p style="font-size: 14px; color: #666;">
            Mã OTP sẽ <strong>hết hạn sau 5 phút</strong> vì lý do bảo mật. 
            Vui lòng không chia sẻ mã này với bất kỳ ai nhé!
          </p>
          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ ngay với đội ShelHive để được hỗ trợ.
          </p>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Thân ái,<br/>
            <strong>ShelBee - Chú ong đồng hành cùng bạn 🐝</strong>
          </p>
        </div>
      `
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
