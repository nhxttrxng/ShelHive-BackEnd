const db = require('../db/database'); // Kết nối database

// **1. Lấy tất cả người dùng**
function getAllUsers() {
  const stmt = db.prepare("SELECT * FROM USER");
  const users = stmt.all();
  return users;
}

// **2. Thêm mới một User**
function addUser(user) {
  const stmt = db.prepare(`
    INSERT INTO USER (email, ho_ten, dia_chi, gioi_tinh, que_quan, mat_khau, sdt, cccd, ngay_sinh, avt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(user.email, user.ho_ten, user.dia_chi, user.gioi_tinh, user.que_quan, user.mat_khau, user.sdt, user.cccd, user.ngay_sinh, user.avt);
  return result;
}

// **3. Lấy thông tin User theo email**
function getUserByEmail(email) {
  const stmt = db.prepare("SELECT * FROM USER WHERE email = ?");
  const user = stmt.get(email);
  return user;
}

// **4. Cập nhật thông tin User**
function updateUser(email, updatedData) {
  const stmt = db.prepare(`
    UPDATE USER 
    SET ho_ten = ?, dia_chi = ?, gioi_tinh = ?, que_quan = ?, mat_khau = ?, sdt = ?, cccd = ?, ngay_sinh = ?, avt = ?
    WHERE email = ?
  `);
  const result = stmt.run(updatedData.ho_ten, updatedData.dia_chi, updatedData.gioi_tinh, updatedData.que_quan, updatedData.mat_khau, updatedData.sdt, updatedData.cccd, updatedData.ngay_sinh, updatedData.avt, email);
  return result;
}

// **5. Xóa User**
function deleteUser(email) {
  const stmt = db.prepare("DELETE FROM USER WHERE email = ?");
  const result = stmt.run(email);
  return result;
}

function updatePassword(email, hashedPassword) {
  const stmt = db.prepare("UPDATE USER SET mat_khau = ? WHERE email = ?");
  return stmt.run(hashedPassword, email);
};

module.exports = {
  getAllUsers,
  addUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  updatePassword
};
