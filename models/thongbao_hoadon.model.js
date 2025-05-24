const db = require('../db/postgres'); // Pool kết nối db, tên biến db để đồng bộ với bạn

const InvoiceNotification = {
  // Lấy tất cả thông báo hóa đơn
  async getAllNotifications() {
    const query = 'SELECT * FROM thong_bao_hoa_don ORDER BY ngay_tao DESC';
    const result = await db.query(query);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo ID (mã_thong_bao_hoa_don)
  async getNotificationById(id) {
    const query = 'SELECT * FROM thong_bao_hoa_don WHERE ma_thong_bao_hoa_don = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Lấy thông báo hóa đơn theo mã hóa đơn
  async getNotificationsByHoaDonId(maHoaDon) {
    const query = 'SELECT * FROM thong_bao_hoa_don WHERE ma_hoa_don = $1 ORDER BY ngay_tao DESC';
    const result = await db.query(query, [maHoaDon]);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo mã dãy trọ (ma_day)
  async getInvoiceNotificationsByMaDay(maDay) {
    const query = `
      SELECT tbhd.noi_dung, tbhd.ngay_tao
      FROM thong_bao_hoa_don tbhd
      JOIN hoa_don hd ON tbhd.ma_hoa_don = hd.ma_hoa_don
      JOIN phong p ON hd.ma_phong = p.ma_phong
      JOIN day_tro dt ON p.ma_day = dt.ma_day
      WHERE dt.ma_day = $1
      ORDER BY tbhd.ngay_tao DESC
    `;
    const result = await db.query(query, [maDay]);
    return result.rows;
  },

  // Tạo thông báo hóa đơn mới
  async createNotification(notification) {
    const { ma_hoa_don, noi_dung, ngay_tao } = notification;
    const query = `
      INSERT INTO thong_bao_hoa_don (ma_hoa_don, noi_dung, ngay_tao)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await db.query(query, [ma_hoa_don, noi_dung, ngay_tao]);
    return result.rows[0];
  },

  // Cập nhật thông báo hóa đơn
  async updateNotification(id, updates) {
    const { noi_dung, ngay_tao } = updates;
    const query = `
      UPDATE thong_bao_hoa_don
      SET noi_dung = $1, ngay_tao = $2
      WHERE ma_thong_bao_hoa_don = $3 RETURNING *
    `;
    const result = await db.query(query, [noi_dung, ngay_tao, id]);
    return result.rows[0];
  },

  // Xóa thông báo hóa đơn
  async deleteNotification(id) {
    const query = 'DELETE FROM thong_bao_hoa_don WHERE ma_thong_bao_hoa_don = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = InvoiceNotification;
