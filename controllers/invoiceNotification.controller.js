const InvoiceNotification = require('../models/thongbao_hoadon.model');

// GET tất cả thông báo
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await InvoiceNotification.getAllNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thông báo hóa đơn.' });
  }
};

// GET theo ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await InvoiceNotification.getNotificationById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông báo theo ID.' });
  }
};

// GET theo mã hóa đơn
exports.getNotificationsByHoaDonId = async (req, res) => {
  try {
    const notifications = await InvoiceNotification.getNotificationsByHoaDonId(req.params.ma_hoa_don);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông báo theo mã hóa đơn.' });
  }
};

// GET theo mã dãy trọ
exports.getInvoiceNotificationsByMaDay = async (req, res) => {
  try {
    const notifications = await InvoiceNotification.getInvoiceNotificationsByMaDay(req.params.ma_day);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông báo theo mã dãy trọ.' });
  }
};

// GET theo mã phòng
// ✅ GET theo mã phòng
exports.getInvoiceNotificationsByMaPhong = async (req, res) => {
  const { ma_phong } = req.params;

  try {
    const result = await InvoiceNotification.getInvoiceNotificationsByMaPhong(ma_phong); // GỌI ĐÚNG MODEL

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo cho phòng này'
      });
    }

    // Trả lại đúng format { success: true, data: [...] }
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi lấy thông báo theo mã phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo',
      error: error.message
    });
  }
};

// POST tạo mới
exports.createNotification = async (req, res) => {
  try {
    const notification = await InvoiceNotification.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tạo thông báo mới.' });
  }
};

// ✅ Cập nhật
exports.updateNotification = async (req, res) => {
  try {
    const { ma_thong_bao_hoa_don } = req.params;
    const notification = await InvoiceNotification.updateNotification(ma_thong_bao_hoa_don, req.body);
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo để cập nhật.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông báo.' });
  }
};

// ✅ Xóa
exports.deleteNotification = async (req, res) => {
  try {
    const { ma_thong_bao_hoa_don } = req.params;
    const notification = await InvoiceNotification.deleteNotification(ma_thong_bao_hoa_don);
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo để xóa.' });
    res.json({ message: 'Đã xóa thành công.', deleted: notification });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa thông báo.' });
  }
};

