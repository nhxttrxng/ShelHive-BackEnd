const pool = require('../db/postgres'); // Kết nối PostgreSQL

// 1. Lấy tất cả người dùng
async function getAllUsers() {
  const res = await pool.query('SELECT * FROM "USER"');
  return res.rows;
}

// 2. Thêm mới một User
async function addUser(user) {
  const query = `
    INSERT INTO "USER" ("email", "ho_ten", "dia_chi", "gioi_tinh", "que_quan", "mat_khau", "sdt", "cccd", "ngay_sinh", "avt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [
    user.email,
    user.ho_ten,
    user.dia_chi,
    user.gioi_tinh,
    user.que_quan,
    user.mat_khau,
    user.sdt,
    user.cccd,
    user.ngay_sinh,
    user.avt,
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// 3. Lấy thông tin User theo email
async function getUserByEmail(email) {
  const res = await pool.query('SELECT * FROM "USER" WHERE "email" = $1', [email]);
  return res.rows[0];
}

// 4. Cập nhật thông tin User
async function updateUser(email, updatedData) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in updatedData) {
    fields.push(`"${key}" = $${index}`);
    values.push(updatedData[key]);
    index++;
  }

  if (fields.length === 0) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  const query = `
    UPDATE "USER" 
    SET ${fields.join(', ')} 
    WHERE "email" = $${index}
    RETURNING *
  `;
  values.push(email);

  const res = await pool.query(query, values);
  return res.rows[0];
}

// 5. Xóa User
async function deleteUser(email) {
  const res = await pool.query('DELETE FROM "USER" WHERE "email" = $1 RETURNING *', [email]);
  return res.rows[0];
}

// 6. Cập nhật mật khẩu
async function updatePassword(email, hashedPassword) {
  const res = await pool.query('UPDATE "USER" SET "mat_khau" = $1 WHERE "email" = $2 RETURNING *', [hashedPassword, email]);
  return res.rows[0];
}

module.exports = {
  getAllUsers,
  addUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  updatePassword,
};
