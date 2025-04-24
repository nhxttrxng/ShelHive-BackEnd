const { Pool } = require('pg');

// Nếu vợ có DATABASE_URL, dùng trực tiếp nó
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Dùng DATABASE_URL đầy đủ
  ssl: {
    rejectUnauthorized: false, // Đảm bảo rằng kết nối SSL được bật (Render yêu cầu điều này)
  },
});

module.exports = pool;
