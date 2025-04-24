// Kết nối với database PostgreSQL
const pool = require("../db/postgres"); // Kết nối PostgreSQL

// Import mô hình cho các bảng
const User = require("./user.model");
const Admin = require("./admin.model");
const DayTro = require("./daytro.model");
const Phong = require("./phong.model");
const HoaDon = require("./hoadon.model");
const ThongBao = require("./thongbao.model");
const SuCo = require("./suco.model");
const GiaHan = require("./giahan.model");
const OTP = require("./otp.model");

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
  OTP,
  pool,  // Xuất pool để có thể dùng chung kết nối PostgreSQL trong các mô hình khác
};
