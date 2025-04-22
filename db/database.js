const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/shelhive.db", (err) => {
  if (err) {
    console.error("Lỗi kết nối đến database:", err.message);
  } else {
    console.log("Kết nối thành công đến SQLite.");
  }
});

module.exports = db;
