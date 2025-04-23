const db = require('../db/database'); // Đảm bảo đã kết nối với Database

function getAllAdmins() {
  const stmt = db.prepare("SELECT * FROM ADMIN");
  const admins = stmt.all();
  return admins;
}

// **1. Thêm mới một Admin**
function addAdmin(admin) {
  const stmt = db.prepare(`
    INSERT INTO ADMIN (email, ho_ten, mat_khau, sdt, avt)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(admin.email, admin.ho_ten, admin.mat_khau, admin.sdt, admin.avt);
  return result;
}

// **2. Lấy thông tin Admin theo email**
function getAdminByEmail(email) {
  const stmt = db.prepare("SELECT * FROM ADMIN WHERE email = ?");
  const admin = stmt.get(email);
  return admin;
}

// **3. Cập nhật thông tin Admin**
function updateAdmin(email, updatedData) {
  const stmt = db.prepare(`
    UPDATE ADMIN 
    SET ho_ten = ?, mat_khau = ?, sdt = ?, avt = ?
    WHERE email = ?
  `);
  const result = stmt.run(updatedData.ho_ten, updatedData.mat_khau, updatedData.sdt, updatedData.avt, email);
  return result;
}

// **4. Xóa Admin**
function deleteAdmin(email) {
  const stmt = db.prepare("DELETE FROM ADMIN WHERE email = ?");
  const result = stmt.run(email);
  return result;
}

function updatePassword(email, hashedPassword) {
  const stmt = db.prepare("UPDATE ADMIN SET mat_khau = ? WHERE email = ?");
  return stmt.run(hashedPassword, email);
}

module.exports = {
  addAdmin,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  updatePassword
};
