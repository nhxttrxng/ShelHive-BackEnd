const pool = require('../db/postgres'); // Pool từ file db/postgres.js
const InvoiceNotification = {
  // Lấy tất cả thông báo hóa đơn
  async getAllNotifications() {
    const query = 'SELECT * FROM invoice_notifications';
    const result = await db.query(query);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo ID
  async getNotificationById(id) {
    const query = 'SELECT * FROM invoice_notifications WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Lấy thông báo hóa đơn theo mã hóa đơn
  async getNotificationsByInvoiceId(invoiceId) {
    const query = 'SELECT * FROM invoice_notifications WHERE invoice_id = $1';
    const result = await db.query(query, [invoiceId]);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo mã phòng
  async getNotificationsByRoomId(roomId) {
    const query = 'SELECT * FROM invoice_notifications WHERE room_id = $1';
    const result = await db.query(query, [roomId]);
    return result.rows;
  },

  // Lấy thông báo hóa đơn theo mã dãy trọ
  async getNotificationsByMotelId(motelId) {
    const query = 'SELECT * FROM invoice_notifications WHERE motel_id = $1';
    const result = await db.query(query, [motelId]);
    return result.rows;
  },

  // Tạo thông báo hóa đơn mới
  async createNotification(notification) {
    const { invoice_id, room_id, motel_id, message, created_at } = notification;
    const query = `
      INSERT INTO invoice_notifications (invoice_id, room_id, motel_id, message, created_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await db.query(query, [invoice_id, room_id, motel_id, message, created_at]);
    return result.rows[0];
  },

  // Cập nhật thông báo hóa đơn
  async updateNotification(id, updates) {
    const { message, updated_at } = updates;
    const query = `
      UPDATE invoice_notifications
      SET message = $1, updated_at = $2
      WHERE id = $3 RETURNING *`;
    const result = await db.query(query, [message, updated_at, id]);
    return result.rows[0];
  },

  // Xóa thông báo hóa đơn
  async deleteNotification(id) {
    const query = 'DELETE FROM invoice_notifications WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = InvoiceNotification;