const db = require('../db/database');

// CREATE - Thêm OTP cho User hoặc Admin
function addOTP({ email, otp, expiration_time, role }) {
  const stmt = db.prepare(`
    INSERT INTO OTP (email, otp, expiration_time, role)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(email, otp, expiration_time, role);
}

// READ - Lấy OTP theo email và mã OTP (xác thực người dùng)
function getByEmailAndOtp(email, otp) {
  const stmt = db.prepare(`
    SELECT * FROM OTP
    WHERE email = ? AND otp = ?
  `);
  return stmt.get(email, otp);
}

// READ - Lấy OTP theo email
function getByEmail(email) {
  const stmt = db.prepare(`
    SELECT * FROM OTP
    WHERE email = ?
  `);
  return stmt.get(email);
}

// UPDATE - Cập nhật mã OTP (nếu cần, thường không dùng nhưng để đầy đủ CRUD)
function updateOTP({ email, otp, expiration_time }) {
  const stmt = db.prepare(`
    UPDATE OTP
    SET otp = ?, expiration_time = ?
    WHERE email = ?
  `);
  return stmt.run(otp, expiration_time, email);
}

// DELETE - Xóa OTP theo email
function deleteByEmail(email) {
  const stmt = db.prepare(`
    DELETE FROM OTP
    WHERE email = ?
  `);
  return stmt.run(email);
}

// DELETE - Xóa OTP đã hết hạn
function deleteExpired(currentTime) {
  const stmt = db.prepare(`
    DELETE FROM OTP
    WHERE expiration_time < ?
  `);
  return stmt.run(currentTime);
}

// CHECK - OTP hết hạn chưa?
function isExpired(expiration_time, currentTime) {
  return expiration_time < currentTime;
}

// Lấy toàn bộ bản ghi OTP
function getAll() {
  const stmt = db.prepare("SELECT * FROM OTP");
  const rows = stmt.all();
  return rows;
}

module.exports = {
  addOTP,
  getByEmailAndOtp,
  getByEmail,
  updateOTP,
  deleteByEmail,
  deleteExpired,
  isExpired,
  getAll
};
