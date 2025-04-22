const db = require('../db/database'); // Đảm bảo đã kết nối với Database

// **1. Thêm OTP cho User hoặc Admin**
function addOTP(email, otp, expiration_time, role) {
  const stmt = db.prepare(`
    INSERT INTO OTP (email, otp, expiration_time, role)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(email, otp, expiration_time, role);
  return result;
}

// **2. Kiểm tra OTP cho User hoặc Admin**
function checkOTP(email, otp, role) {
  const stmt = db.prepare("SELECT * FROM OTP WHERE email = ? AND otp = ? AND role = ?");
  const otpRecord = stmt.get(email, otp, role);
  return otpRecord;
}

// **3. Xóa OTP sau khi sử dụng hoặc hết hạn**
function deleteOTP(email, otp, role) {
  const stmt = db.prepare("DELETE FROM OTP WHERE email = ? AND otp = ? AND role = ?");
  const result = stmt.run(email, otp, role);
  return result;
}

// **4. Xóa OTP đã hết hạn**
function deleteExpiredOTP(currentTime) {
  const stmt = db.prepare("DELETE FROM OTP WHERE expiration_time < ?");
  const result = stmt.run(currentTime);
  return result;
}

// **5. Kiểm tra xem OTP đã hết hạn hay chưa**
function isOTPExpired(expiration_time, currentTime) {
  return expiration_time < currentTime;
}

module.exports = {
  addOTP,
  checkOTP,
  deleteOTP,
  deleteExpiredOTP,
  isOTPExpired
};
