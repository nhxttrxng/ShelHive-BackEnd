const db = require('./Database'); // Đảm bảo đã kết nối với Database

// **1. Thêm mới một User**
function addUser(user) {
  const stmt = db.prepare(`
    INSERT INTO USER (email, ho_ten, dia_chi, gioi_tinh, que_quan, mat_khau, sdt, cccd, ngay_sinh, avt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(user.email, user.ho_ten, user.dia_chi, user.gioi_tinh, user.que_quan, user.mat_khau, user.sdt, user.cccd, user.ngay_sinh, user.avt);
  return result;
}

// **2. Lấy thông tin User theo email**
function getUserByEmail(email) {
  const stmt = db.prepare("SELECT * FROM USER WHERE email = ?");
  const user = stmt.get(email);
  return user;
}

// **3. Cập nhật thông tin User**
function updateUser(email, updatedData) {
  const stmt = db.prepare(`
    UPDATE USER 
    SET ho_ten = ?, dia_chi = ?, gioi_tinh = ?, que_quan = ?, mat_khau = ?, sdt = ?, cccd = ?, ngay_sinh = ?, avt = ?
    WHERE email = ?
  `);
  const result = stmt.run(updatedData.ho_ten, updatedData.dia_chi, updatedData.gioi_tinh, updatedData.que_quan, updatedData.mat_khau, updatedData.sdt, updatedData.cccd, updatedData.ngay_sinh, updatedData.avt, email);
  return result;
}

// **4. Xóa User**
function deleteUser(email) {
  const stmt = db.prepare("DELETE FROM USER WHERE email = ?");
  const result = stmt.run(email);
  return result;
}

// **5. Thêm OTP cho User**
function addOTP(email, otp, expiration_time, role) {
  const stmt = db.prepare(`
    INSERT INTO OTP (email, otp, expiration_time, role) 
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(email, otp, expiration_time, role);
  return result;
}

// **6. Kiểm tra OTP của User**
function checkOTP(email, otp) {
  const stmt = db.prepare("SELECT * FROM OTP WHERE email = ? AND otp = ?");
  const otpRecord = stmt.get(email, otp);
  return otpRecord;
}

// **7. Xóa OTP sau khi sử dụng hoặc hết hạn**
function deleteOTP(email, otp) {
  const stmt = db.prepare("DELETE FROM OTP WHERE email = ? AND otp = ?");
  const result = stmt.run(email, otp);
  return result;
}

module.exports = {
  addUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  addOTP,
  checkOTP,
  deleteOTP
};
