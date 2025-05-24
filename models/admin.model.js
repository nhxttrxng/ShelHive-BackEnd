const pool = require('../db/postgres'); // Pool từ file db/postgres.js

// 1. Lấy tất cả Admin
async function getAllAdmins() {
  const res = await pool.query("SELECT * FROM ADMIN");
  return res.rows;
}

// 2. Thêm mới một Admin
async function addAdmin(admin) {
  const query = `
    INSERT INTO ADMIN (email, ho_ten, mat_khau, sdt, avt)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [admin.email, admin.ho_ten, admin.mat_khau, admin.sdt, admin.avt];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// 3. Lấy thông tin Admin theo email
async function getAdminByEmail(email) {
  const res = await pool.query("SELECT * FROM ADMIN WHERE email = $1", [email]);
  return res.rows[0];
}

// 4. Cập nhật thông tin Admin
async function updateAdmin(email, updatedData) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in updatedData) {
    fields.push(`"${key}" = $${index}`);
    values.push(updatedData[key]);
    index++;
  }

  if (fields.length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }

  const query = `
    UPDATE ADMIN
    SET ${fields.join(', ')}
    WHERE "email" = $${index}
    RETURNING *
  `;
  values.push(email);

  const res = await pool.query(query, values);
  return res.rows[0];
}

// 5. Xóa Admin
async function deleteAdmin(email) {
  const res = await pool.query("DELETE FROM ADMIN WHERE email = $1 RETURNING *", [email]);
  return res.rows[0];
}

// 6. Cập nhật mật khẩu
async function updatePassword(email, hashedPassword) {
  const res = await pool.query("UPDATE ADMIN SET mat_khau = $1 WHERE email = $2 RETURNING *", [hashedPassword, email]);
  return res.rows[0];
}

const updateAvatar = async (email, filePath) => {
  const query = 'UPDATE admin SET avt = $1 WHERE email = $2';
  const values = [filePath, email];
  await pool.query(query, values);
};

module.exports = {
  addAdmin,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  updatePassword,
  updateAvatar
};
