const pool = require('../db/postgres');

const ThongBaoHoaDon = {
  // Lấy tất cả thông báo hóa đơn
  getAll: async function() {
    const query = `
      SELECT * FROM thong_bao_hoa_don
      ORDER BY ngay_tao DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo ID
  getById: async function(ma_thong_bao_hoa_don) {
    const query = `
      SELECT * FROM thong_bao_hoa_don
      WHERE ma_thong_bao_hoa_don = $1
    `;
    const result = await pool.query(query, [ma_thong_bao_hoa_don]);
    return result.rows[0];
  },

  // Lấy thông báo theo mã hóa đơn
  getByInvoiceId: async function(ma_hoa_don) {
    const query = `
      SELECT * FROM thong_bao_hoa_don
      WHERE ma_hoa_don = $1
      ORDER BY ngay_tao DESC
    `;
    const result = await pool.query(query, [ma_hoa_don]);
    return result.rows;
  },

  // Tạo thông báo hóa đơn mới
  create: async function(data) {
    const { ma_hoa_don, noi_dung } = data;
    
    if (!ma_hoa_don || !noi_dung) {
      throw new Error('Thiếu thông tin bắt buộc: mã hóa đơn hoặc nội dung');
    }
    
    const query = `
      INSERT INTO thong_bao_hoa_don (ma_hoa_don, noi_dung, ngay_tao)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [ma_hoa_don, noi_dung]);
    return result.rows[0];
  },

  // Cập nhật thông báo hóa đơn
  update: async function(ma_thong_bao_hoa_don, data) {
    const { noi_dung } = data;
    
    if (!noi_dung) {
      throw new Error('Thiếu nội dung thông báo cần cập nhật');
    }
    
    const query = `
      UPDATE thong_bao_hoa_don
      SET noi_dung = $1
      WHERE ma_thong_bao_hoa_don = $2
      RETURNING *
    `;
    const result = await pool.query(query, [noi_dung, ma_thong_bao_hoa_don]);
    return result.rows[0];
  },

  // Xóa thông báo hóa đơn
  delete: async function(ma_thong_bao_hoa_don) {
    const query = `
      DELETE FROM thong_bao_hoa_don
      WHERE ma_thong_bao_hoa_don = $1
      RETURNING *
    `;
    const result = await pool.query(query, [ma_thong_bao_hoa_don]);
    return result.rows[0];
  },

  // Xóa tất cả thông báo của một hóa đơn
  deleteByInvoiceId: async function(ma_hoa_don) {
    const query = `
      DELETE FROM thong_bao_hoa_don
      WHERE ma_hoa_don = $1
      RETURNING *
    `;
    const result = await pool.query(query, [ma_hoa_don]);
    return result.rows;
  }
};

module.exports = ThongBaoHoaDon; 