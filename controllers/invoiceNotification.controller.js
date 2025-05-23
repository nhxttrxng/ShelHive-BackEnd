const ThongBaoHoaDon = require('../models/thongbao_hoadon.model');
const Invoice = require('../models/hoadon.model');

const invoiceNotificationController = {};

// Lấy tất cả thông báo hóa đơn
invoiceNotificationController.getAllNotifications = async (req, res) => {
  try {
    const notifications = await ThongBaoHoaDon.getAllThongBaoHoaDon();
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả thông báo hóa đơn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo hóa đơn',
      error: error.message
    });
  }
};

// Lấy thông báo hóa đơn theo ID
invoiceNotificationController.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await ThongBaoHoaDon.getThongBaoHoaDonById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo hóa đơn'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo hóa đơn theo ID:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo hóa đơn',
      error: error.message
    });
  }
};

// Lấy thông báo hóa đơn theo mã hóa đơn
invoiceNotificationController.getNotificationsByInvoiceId = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Kiểm tra hóa đơn tồn tại
    const invoice = await Invoice.getInvoiceById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }
    
    const notifications = await ThongBaoHoaDon.getThongBaoByHoaDonId(invoiceId);
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo theo mã hóa đơn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo hóa đơn',
      error: error.message
    });
  }
};

// Lấy thông báo hóa đơn theo mã phòng
invoiceNotificationController.getNotificationsByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const notifications = await ThongBaoHoaDon.getThongBaoByPhongId(roomId);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo theo mã phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo hóa đơn',
      error: error.message
    });
  }
};

// Lấy thông báo hóa đơn theo mã dãy trọ
invoiceNotificationController.getNotificationsByMotelId = async (req, res) => {
  try {
    const { motelId } = req.params;
    const notifications = await ThongBaoHoaDon.getThongBaoByMotelId(motelId);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo theo mã dãy trọ:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông báo hóa đơn',
      error: error.message
    });
  }
};

// Tạo thông báo hóa đơn mới
invoiceNotificationController.createNotification = async (req, res) => {
  try {
    const { ma_hoa_don, noi_dung } = req.body;
    
    if (!ma_hoa_don || !noi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Mã hóa đơn và nội dung thông báo là bắt buộc'
      });
    }
    
    // Kiểm tra hóa đơn tồn tại
    const invoice = await Invoice.getInvoiceById(ma_hoa_don);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }
    
    const notification = await ThongBaoHoaDon.addThongBaoHoaDon({
      ma_hoa_don,
      noi_dung
    });
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo thông báo hóa đơn thành công',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo hóa đơn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo thông báo hóa đơn',
      error: error.message
    });
  }
};

// Tạo thông báo tự động
invoiceNotificationController.createAutomaticNotification = async (req, res) => {
  try {
    const { ma_hoa_don, loai_thong_bao } = req.body;
    
    if (!ma_hoa_don || !loai_thong_bao) {
      return res.status(400).json({
        success: false,
        message: 'Mã hóa đơn và loại thông báo là bắt buộc'
      });
    }
    
    // Kiểm tra hóa đơn tồn tại
    const invoice = await Invoice.getInvoiceById(ma_hoa_don);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }
    
    const notification = await ThongBaoHoaDon.createInvoiceNotification(ma_hoa_don, loai_thong_bao);
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo thông báo hóa đơn tự động thành công',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo tự động:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo thông báo hóa đơn tự động',
      error: error.message
    });
  }
};

// Cập nhật thông báo hóa đơn
invoiceNotificationController.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { noi_dung } = req.body;
    
    if (!noi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung thông báo là bắt buộc'
      });
    }
    
    const notification = await ThongBaoHoaDon.getThongBaoHoaDonById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo hóa đơn'
      });
    }
    
    const updatedNotification = await ThongBaoHoaDon.updateThongBaoHoaDon(id, { noi_dung });
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật thông báo hóa đơn thành công',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông báo hóa đơn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật thông báo hóa đơn',
      error: error.message
    });
  }
};

// Xóa thông báo hóa đơn
invoiceNotificationController.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await ThongBaoHoaDon.getThongBaoHoaDonById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo hóa đơn'
      });
    }
    
    await ThongBaoHoaDon.deleteThongBaoHoaDon(id);
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa thông báo hóa đơn thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa thông báo hóa đơn:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa thông báo hóa đơn',
      error: error.message
    });
  }
};

module.exports = invoiceNotificationController; 