// invoice.controller.js
const HoaDon = require('../models/hoadon.model');
const Phong = require('../models/phong.model');

// Lấy tất cả hóa đơn
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await HoaDon.getAllHoaDon();
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn theo ID
exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    res.status(200).json(invoice);
  } catch (err) {
    console.error('Lỗi khi lấy hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn theo phòng
exports.getInvoicesByRoom = async (req, res) => {
  const { roomId } = req.params;
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const invoices = await HoaDon.getHoaDonByPhongId(roomId);
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Lỗi khi lấy hóa đơn theo phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn theo dãy trọ
exports.getInvoicesByMotel = async (req, res) => {
  const { motelId } = req.params;
  
  try {
    const invoices = await HoaDon.getHoaDonByMotelId(motelId);
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Lỗi khi lấy hóa đơn theo dãy trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn chưa thanh toán theo dãy trọ
exports.getUnpaidInvoicesByMotel = async (req, res) => {
  const { motelId } = req.params;
  
  try {
    const invoices = await HoaDon.getUnpaidHoaDonByMotelId(motelId);
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Lỗi khi lấy hóa đơn chưa thanh toán theo dãy trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn chưa thanh toán theo phòng
exports.getUnpaidInvoicesByRoom = async (req, res) => {
  const { roomId } = req.params;
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const invoices = await HoaDon.getUnpaidHoaDonByPhongId(roomId);
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Lỗi khi lấy hóa đơn chưa thanh toán:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo hóa đơn mới
exports.createInvoice = async (req, res) => {
  const { ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai } = req.body;
  
  if (!ma_phong || !tong_tien || !han_dong_tien) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongById(ma_phong);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const newInvoice = await HoaDon.addHoaDon({
      ma_phong,
      tong_tien,
      so_dien,
      so_nuoc,
      han_dong_tien,
      trang_thai: trang_thai || 'chưa thanh toán'
    });
    
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Lỗi khi tạo hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật hóa đơn
exports.updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai } = req.body;
  
  try {
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Nếu có thay đổi phòng, kiểm tra phòng mới có tồn tại không
    if (ma_phong && ma_phong !== invoice.ma_phong) {
      const room = await Phong.getPhongById(ma_phong);
      
      if (!room) {
        return res.status(404).json({ message: 'Không tìm thấy phòng' });
      }
    }
    
    const updatedInvoice = await HoaDon.updateHoaDon(id, {
      ma_phong: ma_phong || invoice.ma_phong,
      tong_tien: tong_tien || invoice.tong_tien,
      so_dien: so_dien || invoice.so_dien,
      so_nuoc: so_nuoc || invoice.so_nuoc,
      han_dong_tien: han_dong_tien || invoice.han_dong_tien,
      trang_thai: trang_thai || invoice.trang_thai
    });
    
    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error('Lỗi khi cập nhật hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật trạng thái hóa đơn
exports.updateInvoiceStatus = async (req, res) => {
  const { id } = req.params;
  const { trang_thai } = req.body;
  
  if (!trang_thai) {
    return res.status(400).json({ message: 'Thiếu trạng thái hóa đơn' });
  }
  
  try {
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    const updatedInvoice = await HoaDon.updateHoaDonStatus(id, trang_thai);
    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Yêu cầu gia hạn hóa đơn
exports.requestExtension = async (req, res) => {
  const { id } = req.params;
  const { ngay_gia_han } = req.body;
  
  if (!ngay_gia_han) {
    return res.status(400).json({ message: 'Thiếu ngày gia hạn' });
  }
  
  try {
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Kiểm tra nếu hóa đơn đã thanh toán
    if (invoice.trang_thai === 'đã thanh toán') {
      return res.status(400).json({ message: 'Hóa đơn đã thanh toán, không thể gia hạn' });
    }
    
    const updatedInvoice = await HoaDon.requestExtension(id, ngay_gia_han);
    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error('Lỗi khi yêu cầu gia hạn hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Duyệt gia hạn hóa đơn
exports.approveExtension = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Kiểm tra nếu không có yêu cầu gia hạn
    if (!invoice.ngay_gia_han) {
      return res.status(400).json({ message: 'Không có yêu cầu gia hạn cho hóa đơn này' });
    }
    
    // Kiểm tra nếu đã duyệt
    if (invoice.da_duyet_gia_han) {
      return res.status(400).json({ message: 'Yêu cầu gia hạn đã được duyệt trước đó' });
    }
    
    const updatedInvoice = await HoaDon.approveExtension(id);
    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error('Lỗi khi duyệt gia hạn hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa hóa đơn
exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    const deletedInvoice = await HoaDon.deleteHoaDon(id);
    res.status(200).json({ message: 'Xóa hóa đơn thành công', data: deletedInvoice });
  } catch (err) {
    console.error('Lỗi khi xóa hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy thống kê hóa đơn theo tháng
exports.getMonthlyStats = async (req, res) => {
  const { year, month } = req.query;
  
  if (!year || !month) {
    return res.status(400).json({ message: 'Thiếu năm hoặc tháng' });
  }
  
  try {
    const stats = await HoaDon.getMonthlyStats(year, month);
    res.status(200).json(stats);
  } catch (err) {
    console.error('Lỗi khi lấy thống kê hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy thống kê chi tiết hóa đơn theo tháng
exports.getDetailedMonthlyStats = async (req, res) => {
  const { year, month } = req.params;
  
  if (!year || !month) {
    return res.status(400).json({ message: 'Thiếu thông tin năm hoặc tháng' });
  }
  
  try {
    const stats = await HoaDon.getDetailedMonthlyStats(year, month);
    res.status(200).json(stats);
  } catch (err) {
    console.error('Lỗi khi lấy thống kê chi tiết hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tính toán hóa đơn dựa trên chỉ số điện nước
exports.calculateInvoice = async (req, res) => {
  const { ma_phong, chi_so_dien_moi, chi_so_nuoc_moi } = req.body;
  
  if (!ma_phong || !chi_so_dien_moi || !chi_so_nuoc_moi) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongById(ma_phong);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const calculatedBill = await HoaDon.calculateBill(ma_phong, chi_so_dien_moi, chi_so_nuoc_moi);
    res.status(200).json(calculatedBill);
  } catch (err) {
    console.error('Lỗi khi tính toán hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo hóa đơn tự động từ chỉ số điện nước
exports.createAutomaticInvoice = async (req, res) => {
  const { ma_phong, chi_so_dien_moi, chi_so_nuoc_moi, han_dong_tien } = req.body;
  
  if (!ma_phong || !chi_so_dien_moi || !chi_so_nuoc_moi || !han_dong_tien) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongById(ma_phong);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const newInvoice = await HoaDon.createAutomaticInvoice(ma_phong, chi_so_dien_moi, chi_so_nuoc_moi, han_dong_tien);
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Lỗi khi tạo hóa đơn tự động:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};