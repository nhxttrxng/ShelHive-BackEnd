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
  async getNotificationsByHoaDonId(ma_hoa_don) {
    const query = 'SELECT * FROM thong_bao_hoa_don WHERE ma_hoa_don = $1 ORDER BY ngay_tao DESC';
    const result = await db.query(query, [maHoaDon]);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo mã dãy trọ (ma_day)
  async getInvoiceNotificationsByMaDay(ma_day) {
    const query = `
      SELECT tbhd.noi_dung, tbhd.ngay_tao,dt.ma_day
      FROM thong_bao_hoa_don tbhd
      JOIN hoa_don hd ON tbhd.ma_hoa_don = hd.ma_hoa_don
      JOIN phong p ON hd.ma_phong = p.ma_phong
      JOIN day_tro dt ON p.ma_day = dt.ma_day
      WHERE dt.ma_day = $1
      ORDER BY tbhd.ngay_tao DESC
    `;
    const result = await db.query(query, [ma_day]);
    return result.rows;
  },
 // Lấy thông báo hóa đơn theo mã phòng trọ (ma_phong)
  async getInvoiceNotificationsByMaPhong(ma_phong) {
  const query = `
    SELECT tbhd.noi_dung, tbhd.ngay_tao, p.ma_phong
    FROM thong_bao_hoa_don tbhd
    JOIN hoa_don hd ON tbhd.ma_hoa_don = hd.ma_hoa_don
    JOIN phong p ON hd.ma_phong = p.ma_phong
    WHERE p.ma_phong = $1
    ORDER BY tbhd.ngay_tao DESC
  `;
  const result = await db.query(query, [ma_phong]);

  // Trả về dưới dạng object có key "data"
  return {
    success: true,
    data: result.rows
  };
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
// ...existing code...
  // Cập nhật thông báo hóa đơn
  async updateNotification(ma_thong_bao_hoa_don, updates) {
    const { noi_dung } = updates; // chỉ lấy noi_dung từ updates
    const query = `
      UPDATE thong_bao_hoa_don
      SET noi_dung = $1
      WHERE ma_thong_bao_hoa_don = $2 RETURNING *
    `;
    const result = await db.query(query, [noi_dung, ma_thong_bao_hoa_don]);
    return result.rows[0];
  },
// ...existing code...

  // Xóa thông báo hóa đơn
  async deleteNotification(ma_thong_bao_hoa_don) {
    const query = 'DELETE FROM thong_bao_hoa_don WHERE ma_thong_bao_hoa_don = $1 RETURNING *';
    const result = await db.query(query, [ma_thong_bao_hoa_don]);
    return result.rows[0];
  },
};

module.exports = InvoiceNotification;
