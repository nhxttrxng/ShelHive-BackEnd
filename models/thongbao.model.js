const pool = require('../db/postgres'); // Pool từ file db/postgres.js

const Notification = {
  getAll: async function() {
    const result = await pool.query('SELECT * FROM thong_bao ORDER BY ngay_tao DESC');
    return result.rows;
  },

  // Lấy thông báo theo mã dãy
  getByMaDay: async function(ma_day) {
    const result = await pool.query(
      'SELECT * FROM thong_bao WHERE ma_day = $1 ORDER BY ngay_tao DESC',
      [ma_day]
    );
    return result.rows;
  },

  create: async function(data) {
    const { ma_day, ma_phong, noi_dung, loai_thong_bao } = data;
    const result = await pool.query('INSERT INTO thong_bao (ma_day, noi_dung, ngay_tao) VALUES ($1, $2, NOW()) RETURNING *', [ma_day, noi_dung]);
    return result.rows[0];
  },

  update: async function(id, data) {
    const { noi_dung} = data;
    const result = await pool.query(
      'UPDATE thong_bao SET noi_dung = $1 WHERE ma_thong_bao = $2 RETURNING *', [noi_dung, id]);
    return result.rows[0];
  },

  remove: async function(id) {
    const result = await pool.query('DELETE FROM thong_bao WHERE ma_thong_bao = $1', [id]);
    return result.rowCount;
  },
    getThongBaoByPhongId: async function(ma_phong) {
    const result = await pool.query(
      'SELECT tb.* FROM thong_bao tb JOIN day_tro dt ON tb.ma_day = dt.ma_day JOIN phong p ON dt.ma_day = p.ma_day WHERE p.ma_phong = $1 ORDER BY tb.ngay_tao DESC',
      [ma_phong]
    );
    return result.rows;
  },

};

module.exports = Notification;
