const { Pool } = require('pg');

// Nếu vợ có DATABASE_URL, dùng trực tiếp nó
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Dùng DATABASE_URL đầy đủ
});

module.exports = pool;
