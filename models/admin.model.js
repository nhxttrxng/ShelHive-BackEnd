const db = require('../db/database'); // Đảm bảo đã kết nối với Database

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

// **5. Thêm OTP cho Admin (dùng cho đổi mật khẩu)**
function addOTPForAdmin(email, otp, expiration_time, role) {
  const stmt = db.prepare(`
    INSERT INTO OTP (email, otp, expiration_time, role)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(email, otp, expiration_time, role);
  return result;
}

// **6. Kiểm tra OTP của Admin**
function checkOTPForAdmin(email, otp) {
  const stmt = db.prepare("SELECT * FROM OTP WHERE email = ? AND otp = ? AND role = 'admin'");
  const otpRecord = stmt.get(email, otp);
  return otpRecord;
}

// **7. Xóa OTP sau khi sử dụng hoặc hết hạn**
function deleteOTPForAdmin(email, otp) {
  const stmt = db.prepare("DELETE FROM OTP WHERE email = ? AND otp = ? AND role = 'admin'");
  const result = stmt.run(email, otp);
  return result;
}

module.exports = {
  addAdmin,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
  addOTPForAdmin,
  checkOTPForAdmin,
  deleteOTPForAdmin
};
