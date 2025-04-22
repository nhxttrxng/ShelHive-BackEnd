// Sử dụng better-sqlite3
const Database = require("better-sqlite3");

// Tạo kết nối đến cơ sở dữ liệu
const db = new Database("./db/shelhive.db", {
  verbose: console.log, // Tuỳ chọn này để log các câu lệnh SQL (tùy chọn)
});

// Kiểm tra kết nối (better-sqlite3 không có callback, nên chỉ cần thử truy vấn)
try {
  // Thử truy vấn một câu lệnh đơn giản để kiểm tra
  db.prepare("SELECT 1").get();
  console.log("Kết nối thành công đến SQLite.");
} catch (err) {
  console.error("Lỗi kết nối đến database:", err.message);
}

module.exports = db;
