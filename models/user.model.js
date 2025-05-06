const pool = require('../db/postgres'); // Kết nối PostgreSQL

// 1. Lấy tất cả người dùng
async function getAllUsers() {
  const res = await pool.query('SELECT * FROM "USER"');
  return res.rows;
}

// 2. Thêm mới một User
async function addUser(user) {
  const query = `
    INSERT INTO "USER" ("email", "ho_ten", "dia_chi", "gioi_tinh", "que_quan", "mat_khau", "sdt", "cccd", "ngay_sinh", "avt", "is_verified")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const values = [
    user.email,
    user.ho_ten,
    user.dia_chi || null,
    user.gioi_tinh || null,
    user.que_quan || null,
    user.mat_khau,
    user.sdt,
    user.cccd || null,
    user.ngay_sinh || null,
    user.avt || null,
    user.is_verified ?? false // <-- mặc định chưa xác thực
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// 3. Lấy thông tin User theo email
async function getUserByEmail(email) {
  const res = await pool.query('SELECT * FROM "USER" WHERE "email" = $1', [email]);
  return res.rows[0];
}

// 4. Cập nhật thông tin User (dùng để xác thực email hoặc sửa info)
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

// 6. Cập nhật mật khẩu riêng
async function updatePassword(email, hashedPassword) {
  const res = await pool.query('UPDATE "USER" SET "mat_khau" = $1 WHERE "email" = $2 RETURNING *', [hashedPassword, email]);
  return res.rows[0];
}

const updateAvatar = async (email, filePath) => {
  const query = 'UPDATE "USER" SET avt = $1 WHERE email = $2';
  const values = [filePath, email];
  await pool.query(query, values);
};

module.exports = {
  getAllUsers,
  addUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  updatePassword,
  updateAvatar
};
