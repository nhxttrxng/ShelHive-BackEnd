// Kết nối với database
const db = require("../db/database");

// Import mô hình cho các bảng
const User = require("./user.model");
const Admin = require("./admin.model");
const DayTro = require("./daytro.model");
const Phong = require("./phong.model");
const HoaDon = require("./hoadon.model");
const ThongBao = require("./thongbao.model");
const SuCo = require("./suco.model");
const GiaHan = require("./giahan.model");

// Xuất ra các mô hình để sử dụng ở nơi khác
module.exports = {
  User,
  Admin,
  DayTro,
  Phong,
  HoaDon,
  ThongBao,
  SuCo,
  GiaHan,
  db,  // Nếu cần, có thể xuất db để sử dụng ở controller hoặc route
};
