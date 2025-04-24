const pool = require('../db/postgres'); // Kết nối PostgreSQL

// CREATE - Thêm OTP cho User hoặc Admin
async function addOTP({ email, otp, expiration_time, role }) {
  const query = `
    INSERT INTO OTP (email, otp, expiration_time, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [email, otp, expiration_time, role];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// READ - Lấy OTP theo email và mã OTP (xác thực người dùng)
async function getByEmailAndOtp(email, otp) {
  const res = await pool.query(`
    SELECT * FROM OTP
    WHERE email = $1 AND otp = $2
  `, [email, otp]);
  return res.rows[0];
}

// READ - Lấy OTP theo email
async function getByEmail(email) {
  const res = await pool.query(`
    SELECT * FROM OTP
    WHERE email = $1
  `, [email]);
  return res.rows[0];
}

// UPDATE - Cập nhật mã OTP (nếu cần, thường không dùng nhưng để đầy đủ CRUD)
async function updateOTP({ email, otp, expiration_time }) {
  const query = `
    UPDATE OTP
    SET otp = $1, expiration_time = $2
    WHERE email = $3
    RETURNING *
  `;
  const values = [otp, expiration_time, email];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// DELETE - Xóa OTP theo email
async function deleteByEmail(email) {
  const res = await pool.query(`
    DELETE FROM OTP
    WHERE email = $1
    RETURNING *
  `, [email]);
  return res.rows[0];
}

// DELETE - Xóa OTP đã hết hạn
async function deleteExpired(currentTime) {
  const res = await pool.query(`
    DELETE FROM OTP
    WHERE expiration_time < $1
    RETURNING *
  `, [currentTime]);
  return res.rows;
}

// CHECK - OTP hết hạn chưa?
function isExpired(expiration_time, currentTime) {
  return expiration_time < currentTime;
}

// Lấy toàn bộ bản ghi OTP
async function getAll() {
  const res = await pool.query("SELECT * FROM OTP");
  return res.rows;
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
