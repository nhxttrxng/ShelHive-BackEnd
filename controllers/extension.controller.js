const GiaHan = require('../models/giahan.model');
const HoaDon = require('../models/hoadon.model');

// Lấy tất cả yêu cầu gia hạn
exports.getAllExtensions = async (req, res) => {
  try {
    const extensions = await GiaHan.getAllGiaHan();
    res.status(200).json(extensions);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy yêu cầu gia hạn theo mã gia hạn
exports.getExtensionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const extension = await GiaHan.getGiaHanById(id);
    
    if (!extension) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu gia hạn' });
    }
    
    res.status(200).json(extension);
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy yêu cầu gia hạn theo mã hóa đơn
exports.getExtensionsByInvoiceId = async (req, res) => {
  const { invoiceId } = req.params;
  
  try {
    // Kiểm tra hóa đơn tồn tại
    const invoice = await HoaDon.getHoaDonById(invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    const extensions = await GiaHan.getGiaHanByHoaDonId(invoiceId);
    res.status(200).json(extensions);
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu gia hạn theo hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo yêu cầu gia hạn mới
exports.createExtension = async (req, res) => {
  const { ma_hoa_don, han_thanh_toan_moi, lai_suat } = req.body;
  
  if (!ma_hoa_don || !han_thanh_toan_moi || !lai_suat) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra hóa đơn tồn tại
    const invoice = await HoaDon.getHoaDonById(ma_hoa_don);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Kiểm tra nếu hóa đơn đã thanh toán
    if (invoice.trang_thai === 'đã thanh toán') {
      return res.status(400).json({ message: 'Hóa đơn đã thanh toán, không thể gia hạn' });
    }
    
    // Kiểm tra hạn thanh toán mới phải lớn hơn hạn hiện tại
    const currentDueDate = new Date(invoice.han_dong_tien);
    const newDueDate = new Date(han_thanh_toan_moi);
    
    if (newDueDate <= currentDueDate) {
      return res.status(400).json({ message: 'Hạn thanh toán mới phải lớn hơn hạn hiện tại' });
    }
    
    // Tính tiền lãi dự kiến
    const interestCalculation = await GiaHan.calculateExpectedInterest(ma_hoa_don, han_thanh_toan_moi, lai_suat);
    
    // Tạo yêu cầu gia hạn
    const newExtension = await GiaHan.addGiaHan({
      ma_hoa_don,
      han_dong_tien_goc: invoice.han_dong_tien,
      han_thanh_toan_moi,
      trang_thai: 'chờ xác nhận',
      lai_suat,
      tien_lai_tinh_du_kien: interestCalculation.tien_lai_du_kien
    });
    
    res.status(201).json({
      yeu_cau_gia_han: newExtension,
      tinh_toan_lai: interestCalculation
    });
  } catch (err) {
    console.error('Lỗi khi tạo yêu cầu gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật yêu cầu gia hạn
exports.updateExtension = async (req, res) => {
  const { id } = req.params;
  const { ma_hoa_don, han_dong_tien_goc, han_thanh_toan_moi, trang_thai, lai_suat, tien_lai_tinh_du_kien } = req.body;
  
  try {
    // Kiểm tra yêu cầu gia hạn tồn tại
    const extension = await GiaHan.getGiaHanById(id);
    
    if (!extension) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu gia hạn' });
    }
    
    // Kiểm tra quyền: chỉ cho phép cập nhật nếu trạng thái là "chờ xác nhận"
    if (extension.trang_thai !== 'chờ xác nhận') {
      return res.status(400).json({ message: 'Không thể cập nhật yêu cầu gia hạn đã được xử lý' });
    }
    
    // Nếu thay đổi hóa đơn, kiểm tra hóa đơn tồn tại
    if (ma_hoa_don && ma_hoa_don !== extension.ma_hoa_don) {
      const invoice = await HoaDon.getHoaDonById(ma_hoa_don);
      
      if (!invoice) {
        return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      }
    }
    
    const updatedExtension = await GiaHan.updateGiaHan(id, {
      ma_hoa_don: ma_hoa_don || extension.ma_hoa_don,
      han_dong_tien_goc: han_dong_tien_goc || extension.han_dong_tien_goc,
      han_thanh_toan_moi: han_thanh_toan_moi || extension.han_thanh_toan_moi,
      trang_thai: trang_thai || extension.trang_thai,
      lai_suat: lai_suat || extension.lai_suat,
      tien_lai_tinh_du_kien: tien_lai_tinh_du_kien || extension.tien_lai_tinh_du_kien
    });
    
    res.status(200).json(updatedExtension);
  } catch (err) {
    console.error('Lỗi khi cập nhật yêu cầu gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Duyệt yêu cầu gia hạn
exports.approveExtension = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Kiểm tra yêu cầu gia hạn tồn tại
    const extension = await GiaHan.getGiaHanById(id);

    if (!extension) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu gia hạn' });
    }

    // 2. Kiểm tra trạng thái hiện tại
    if (extension.trang_thai !== 'chờ xác nhận') {
      return res.status(400).json({ message: `Không thể duyệt yêu cầu gia hạn với trạng thái "${extension.trang_thai}"` });
    }

    // 3. Duyệt yêu cầu gia hạn và cập nhật hóa đơn
    const approvedBill = await GiaHan.approveGiaHan(id);

    return res.status(200).json({
      message: 'Duyệt yêu cầu gia hạn thành công',
      data: approvedBill  // là hóa đơn đã được cập nhật sau khi duyệt
    });
  } catch (err) {
    console.error('Lỗi khi duyệt yêu cầu gia hạn:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Từ chối yêu cầu gia hạn
exports.rejectExtension = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra yêu cầu gia hạn tồn tại
    const extension = await GiaHan.getGiaHanById(id);
    
    if (!extension) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu gia hạn' });
    }
    
    // Kiểm tra trạng thái hiện tại
    if (extension.trang_thai !== 'chờ xác nhận') {
      return res.status(400).json({ message: `Không thể từ chối yêu cầu gia hạn với trạng thái "${extension.trang_thai}"` });
    }
    
    // Từ chối yêu cầu gia hạn
    const rejectedExtension = await GiaHan.rejectGiaHan(id);
    
    res.status(200).json({
      message: 'Từ chối yêu cầu gia hạn thành công',
      data: rejectedExtension
    });
  } catch (err) {
    console.error('Lỗi khi từ chối yêu cầu gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa yêu cầu gia hạn
exports.deleteExtension = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra yêu cầu gia hạn tồn tại
    const extension = await GiaHan.getGiaHanById(id);
    
    if (!extension) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu gia hạn' });
    }
    
    // Chỉ cho phép xóa khi trạng thái là "chờ xác nhận" hoặc "đã từ chối"
    if (extension.trang_thai === 'đã duyệt') {
      return res.status(400).json({ message: 'Không thể xóa yêu cầu gia hạn đã được duyệt' });
    }
    
    const deletedExtension = await GiaHan.deleteGiaHan(id);
    
    res.status(200).json({
      message: 'Xóa yêu cầu gia hạn thành công',
      data: deletedExtension
    });
  } catch (err) {
    console.error('Lỗi khi xóa yêu cầu gia hạn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tính toán tiền lãi dự kiến
exports.calculateExpectedInterest = async (req, res) => {
  const { ma_hoa_don, han_thanh_toan_moi, lai_suat } = req.body;
  
  if (!ma_hoa_don || !han_thanh_toan_moi || !lai_suat) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra hóa đơn tồn tại
    const invoice = await HoaDon.getHoaDonById(ma_hoa_don);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Tính toán tiền lãi dự kiến
    const calculation = await GiaHan.calculateExpectedInterest(ma_hoa_don, han_thanh_toan_moi, lai_suat);
    
    res.status(200).json(calculation);
  } catch (err) {
    console.error('Lỗi khi tính toán tiền lãi dự kiến:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy lịch sử gia hạn của hóa đơn
exports.getExtensionHistoryByInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  
  try {
    // Kiểm tra hóa đơn tồn tại
    const invoice = await HoaDon.getHoaDonById(invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    const history = await GiaHan.getGiaHanHistoryByHoaDonId(invoiceId);
    res.status(200).json(history);
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử gia hạn của hóa đơn:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}; 

// Lấy gia hạn mới nhất đã duyệt theo mã hóa đơn
exports.getLatestApprovedExtensionByInvoiceId = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await HoaDon.getHoaDonById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    const latestExtension = await GiaHan.getLatestApprovedExtensionByInvoiceId(invoiceId);
    if (!latestExtension) {
      return res.status(404).json({ message: 'Không có gia hạn đã duyệt cho hóa đơn này' });
    }

    res.status(200).json(latestExtension);
  } catch (err) {
    console.error('Lỗi khi lấy gia hạn đã duyệt mới nhất:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy các gia hạn "chờ xác nhận" theo mã phòng
exports.getPendingExtensionsByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    const pendingExtensions = await GiaHan.getPendingExtensionsByRoomId(roomId);

    res.status(200).json(pendingExtensions);
  } catch (err) {
    console.error('Lỗi khi lấy gia hạn chờ xác nhận theo mã phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};