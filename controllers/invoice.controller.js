// invoice.controller.js
const HoaDon = require('../models/hoadon.model');
const Phong = require('../models/phong.model');
const Notification = require('../models/thongbao.model');
const ThongBaoHoaDon = require('../models/thongbao_hoadon.model');
const DayTro = require('../models/daytro.model');
const pool = require('../db/postgres');

// Hàm hỗ trợ định dạng tiền tệ an toàn
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return amount.toLocaleString('vi-VN');
};

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
    const room = await Phong.getPhongByMaPhong(roomId);
    
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
    const room = await Phong.getPhongByMaPhong(roomId);
    
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
  const { 
    ma_phong, 
    chi_so_dien_cu, 
    chi_so_dien_moi, 
    chi_so_nuoc_cu, 
    chi_so_nuoc_moi, 
    tien_phong,
    han_dong_tien,
    thang_nam 
  } = req.body;
  
  if (!ma_phong || !chi_so_dien_moi || !chi_so_nuoc_moi || !han_dong_tien || !thang_nam) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Phong.getPhongByMaPhong(ma_phong);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    // Lấy tháng và năm từ ngày hạn đóng tiền
    const hanDongTienDate = new Date(han_dong_tien);
    const month = hanDongTienDate.getMonth() + 1;
    const year = hanDongTienDate.getFullYear();

    // Kiểm tra hóa đơn theo tháng/năm của hạn đóng tiền
    const hasInvoiceInMonth = await HoaDon.checkExistInvoiceInMonth(ma_phong, month, year);
    if (hasInvoiceInMonth) {
      return res.status(400).json({ message: `Phòng này đã có hóa đơn trong tháng ${month}/${year}` });
    }

    // Lấy thông tin dãy trọ để lấy giá điện, nước
    const dayTro = await DayTro.getDayTroByMaDay(room.ma_day);

    // Tính tiền điện, nước
    const so_dien = chi_so_dien_moi - chi_so_dien_cu;
    const so_nuoc = chi_so_nuoc_moi - chi_so_nuoc_cu;
    const tien_dien = so_dien * dayTro.gia_dien;
    const tien_nuoc = so_nuoc * dayTro.gia_nuoc;

    // Giá phòng mặc định là 1,100,000 đồng nếu không có
    const DEFAULT_ROOM_PRICE = 1100000.00;
    const tien_phong_final = tien_phong || (room.gia_thue && room.gia_thue > 0 ? room.gia_thue : DEFAULT_ROOM_PRICE);

    // Tính tổng tiền
    const tong_tien = tien_dien + tien_nuoc + tien_phong_final;

    // Tạo hóa đơn với đầy đủ thông tin
    const newInvoice = await HoaDon.addHoaDon({
      ma_phong,
      tong_tien,
      so_dien,
      so_nuoc,
      chi_so_dien_cu,
      chi_so_dien_moi,
      chi_so_nuoc_cu,
      chi_so_nuoc_moi,
      tien_dien,
      tien_nuoc,
      tien_phong: tien_phong_final,
      han_dong_tien,
      trang_thai: 'chưa thanh toán',
      ngay_tao: new Date(),
      thang_nam
    });

    // Tạo thông báo hóa đơn mới (chỉ gồm 3 trường: mã, nội dung, ngày tạo)
    const hanDongTien = new Date(han_dong_tien).toLocaleDateString('vi-VN');
    const noiDungThongBao = `Hóa đơn mới: Phòng ${ma_phong} có hóa đơn ${formatCurrency(tong_tien)}đ, hạn đóng tiền ${hanDongTien}`;

    await ThongBaoHoaDon.createNotification({
      ma_hoa_don: newInvoice.ma_hoa_don,
      noi_dung: noiDungThongBao,
      ngay_tao: new Date() // Bổ sung ngày tạo
    });

    res.status(201).json({
      message: 'Tạo hóa đơn và thông báo thành công',
      invoice: newInvoice
    });
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
    // Tạm thời bỏ kiểm tra quyền admin
    /* if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa hóa đơn, chỉ admin mới được phép' });
    } */
    
    // Kiểm tra xem hóa đơn có tồn tại không
    const invoice = await HoaDon.getHoaDonById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    
    // Nếu có thay đổi phòng, kiểm tra phòng mới có tồn tại không
    if (ma_phong && ma_phong !== invoice.ma_phong) {
      const room = await Phong.getPhongByMaPhong(ma_phong);
      
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
    
    // Tạo thông báo về việc cập nhật hóa đơn
    const currentMaPhong = ma_phong || invoice.ma_phong;
    const room = await Phong.getPhongByMaPhong(currentMaPhong);
    
    if (room) {
      const ma_day = room.ma_day;
      let noiDungThongBao = `Hóa đơn phòng ${currentMaPhong} đã được cập nhật.`;
      
      // Thêm chi tiết về những thay đổi quan trọng
      if (tong_tien && tong_tien !== invoice.tong_tien) {
        noiDungThongBao += ` Tổng tiền mới: ${formatCurrency(tong_tien)}đ.`;
      }
      
      if (han_dong_tien && han_dong_tien !== invoice.han_dong_tien) {
        const hanMoi = new Date(han_dong_tien).toLocaleDateString('vi-VN');
        noiDungThongBao += ` Hạn đóng tiền mới: ${hanMoi}.`;
      }
      
      // Tạo thông báo
      await Notification.create({
        ma_day,
        ma_phong: currentMaPhong,
        noi_dung: noiDungThongBao
      });
    }
    
    res.status(200).json({
      message: 'Cập nhật hóa đơn thành công',
      invoice: updatedInvoice
    });
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
    
    // Nếu cập nhật trạng thái là "đã thanh toán", tạo thông báo
    if (trang_thai === 'đã thanh toán') {
      const room = await Phong.getPhongByMaPhong(invoice.ma_phong);
      if (room) {
        const ma_day = room.ma_day;
        const ma_phong = invoice.ma_phong;
        const noiDungThongBao = `Hóa đơn phòng ${ma_phong} đã được thanh toán thành công.`;
        
        // Tạo thông báo
        await Notification.create({
          ma_day,
          ma_phong,
          noi_dung: noiDungThongBao
        });
      }
    }
    
    res.status(200).json({
      message: 'Cập nhật trạng thái hóa đơn thành công',
      invoice: updatedInvoice
    });
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
    
    try {
      const updatedInvoice = await HoaDon.requestExtension(id, ngay_gia_han);
      
      // Tạo thông báo về yêu cầu gia hạn
      const room = await Phong.getPhongByMaPhong(invoice.ma_phong);
      if (room) {
        const ma_day = room.ma_day;
        const ma_phong = invoice.ma_phong;
        const ngayGiaHanYeuCau = new Date(ngay_gia_han).toLocaleDateString('vi-VN');
        const hanDongTienCu = new Date(invoice.han_dong_tien).toLocaleDateString('vi-VN');
        
        // Tính số ngày gia hạn dự kiến
        const soNgayGiaHan = Math.ceil((new Date(ngay_gia_han) - new Date(invoice.han_dong_tien)) / (1000 * 60 * 60 * 24));
        
        // Tính tiền lãi dự kiến
        const tienLaiDuKien = invoice.tong_tien * EXTENSION_INTEREST_RATE * soNgayGiaHan;
        
        const noiDungThongBao = `Đã có yêu cầu gia hạn hóa đơn phòng ${ma_phong} từ ${hanDongTienCu} đến ${ngayGiaHanYeuCau} (${soNgayGiaHan} ngày). Tiền lãi dự kiến: ${formatCurrency(tienLaiDuKien)}đ (0.5%/ngày).`;
        
        // Tạo thông báo
        await Notification.create({
          ma_day,
          ma_phong,
          noi_dung: noiDungThongBao
        });
        
        // Tạo thông báo riêng cho hóa đơn
        await ThongBaoHoaDon.create({
          ma_hoa_don: id,
          noi_dung: noiDungThongBao
        });
      }
      
      res.status(200).json({
        message: 'Yêu cầu gia hạn thành công, đang chờ phê duyệt',
        invoice: updatedInvoice
      });
    } catch (error) {
      // Bắt các lỗi liên quan đến ngày gia hạn không hợp lệ
      return res.status(400).json({ 
        message: 'Yêu cầu gia hạn không hợp lệ', 
        error: error.message 
      });
    }
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
    
    // Tạo thông báo về việc phê duyệt gia hạn
    const room = await Phong.getPhongByMaPhong(invoice.ma_phong);
    if (room) {
      const ma_day = room.ma_day;
      const ma_phong = invoice.ma_phong;
      const ngayGiaHanMoi = new Date(invoice.ngay_gia_han).toLocaleDateString('vi-VN');
      
      let noiDungThongBao = `Yêu cầu gia hạn hóa đơn phòng ${ma_phong} đã được chấp nhận. Hạn thanh toán mới: ${ngayGiaHanMoi}`;
      
      // Thêm thông tin về tiền lãi nếu có
      if (updatedInvoice.tien_lai_gia_han && updatedInvoice.tien_lai_gia_han > 0) {
        noiDungThongBao += `. Tiền lãi gia hạn: ${formatCurrency(updatedInvoice.tien_lai_gia_han)}đ (0.5%/ngày × ${updatedInvoice.so_ngay_gia_han} ngày). Tổng tiền mới: ${formatCurrency(updatedInvoice.tong_tien)}đ`;
      }
      
      // Tạo thông báo
      await Notification.create({
        ma_day,
        ma_phong,
        noi_dung: noiDungThongBao
      });
    }
    
    res.status(200).json({
      message: 'Duyệt gia hạn hóa đơn thành công',
      invoice: updatedInvoice
    });
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
    
    // Tạo thông báo về việc xóa hóa đơn
    const room = await Phong.getPhongByMaPhong(invoice.ma_phong);
    if (room) {
      const ma_day = room.ma_day;
      const ma_phong = invoice.ma_phong;
      const noiDungThongBao = `Hóa đơn phòng ${ma_phong} với tổng tiền ${formatCurrency(invoice.tong_tien)}đ đã bị xóa.`;
      
      // Tạo thông báo
      await Notification.create({
        ma_day,
        ma_phong,
        noi_dung: noiDungThongBao
      });
    }
    
    res.status(200).json({ 
      message: 'Xóa hóa đơn thành công', 
      data: deletedInvoice 
    });
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
    const room = await Phong.getPhongByMaPhong(ma_phong);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    const calculatedBill = await HoaDon.calculateBill(ma_phong, chi_so_dien_moi, chi_so_nuoc_moi);
    
    // Trong trường hợp tính toán đã tạo ra một hóa đơn mới, tạo thông báo
    if (calculatedBill.created && calculatedBill.invoice) {
      const ma_day = room.ma_day;
      const hanDongTien = new Date(calculatedBill.invoice.han_dong_tien).toLocaleDateString('vi-VN');
      const noiDungThongBao = `Dự tính hóa đơn: Phòng ${ma_phong} có hóa đơn ${calculatedBill.invoice.tong_tien.toLocaleString('vi-VN')}đ từ chỉ số điện nước mới`;
      
      // Tạo thông báo
      await Notification.create({
        ma_day,
        ma_phong,
        noi_dung: noiDungThongBao
      });
    }
    
    res.status(200).json({
      message: 'Tính toán hóa đơn thành công',
      data: calculatedBill
    });
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
    const room = await Phong.getPhongByMaPhong(ma_phong);
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    // Kiểm tra xem phòng đã có hóa đơn trong tháng hiện tại chưa
    const currentDate = new Date();
    
    // Lấy tháng và năm từ ngày hạn đóng tiền
    const hanDongTienDate = new Date(han_dong_tien);
    const month = hanDongTienDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = hanDongTienDate.getFullYear();
    
    console.log(`Đang kiểm tra hóa đơn cho phòng ${ma_phong} trong tháng ${month}/${year} của hạn đóng tiền`);
    
    // Kiểm tra hóa đơn theo tháng/năm của hạn đóng tiền
    const hasInvoiceInMonth = await HoaDon.checkExistInvoiceInMonth(ma_phong, month, year);
    console.log(`Kết quả kiểm tra: ${hasInvoiceInMonth ? 'Đã có hóa đơn' : 'Chưa có hóa đơn'}`);
    
    if (hasInvoiceInMonth) {
      return res.status(400).json({ message: `Phòng này đã có hóa đơn trong tháng ${month}/${year}` });
    }
    
    // Lấy chỉ số cũ từ hóa đơn gần nhất
    const lastInvoiceQuery = `
      SELECT chi_so_dien_moi, chi_so_nuoc_moi
      FROM hoa_don
      WHERE ma_phong = $1
      ORDER BY ma_hoa_don DESC
      LIMIT 1
    `;
    const lastInvoiceResult = await pool.query(lastInvoiceQuery, [ma_phong]);
    
    // Nếu có hóa đơn trước đó, kiểm tra chỉ số mới có lớn hơn chỉ số cũ không
    if (lastInvoiceResult.rows.length > 0) {
      const lastInvoice = lastInvoiceResult.rows[0];
      const chi_so_dien_cu = lastInvoice.chi_so_dien_moi || 0;
      const chi_so_nuoc_cu = lastInvoice.chi_so_nuoc_moi || 0;
      
      if (chi_so_dien_moi < chi_so_dien_cu) {
        return res.status(400).json({ 
          message: 'Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ', 
          chi_so_dien_cu, 
          chi_so_dien_moi 
        });
      }
      
      if (chi_so_nuoc_moi < chi_so_nuoc_cu) {
        return res.status(400).json({ 
          message: 'Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ', 
          chi_so_nuoc_cu, 
          chi_so_nuoc_moi 
        });
      }
    }
    
    const newInvoice = await HoaDon.createAutomaticInvoice(ma_phong, chi_so_dien_moi, chi_so_nuoc_moi, han_dong_tien);
    
    // Kiểm tra nếu chỉ số không thay đổi (không tiêu thụ)
    if (newInvoice.so_dien === 0 && newInvoice.so_nuoc === 0) {
      console.log('Cảnh báo: Không có tiêu thụ điện và nước trong kỳ này.');
    }
    
    // Tự động tạo thông báo hóa đơn mới
    const hanDongTien = new Date(han_dong_tien).toLocaleDateString('vi-VN');
    const noiDungThongBao = `Hóa đơn mới tự động: Phòng ${ma_phong} có hóa đơn ${formatCurrency(newInvoice.tong_tien)}đ, hạn đóng tiền ${hanDongTien}`;
    
    // Lấy mã dãy từ phòng
    const ma_day = room.ma_day;
    
    // Tạo thông báo
    await Notification.create({
      ma_day,
      ma_phong,
      noi_dung: noiDungThongBao
    });
    
    // Tạo thông báo riêng cho hóa đơn
    await ThongBaoHoaDon.create({
      ma_hoa_don: newInvoice.ma_hoa_don,
      noi_dung: noiDungThongBao
    });
    
    res.status(201).json({
      message: 'Tạo hóa đơn tự động và thông báo thành công',
      invoice: newInvoice
    });
  } catch (err) {
    console.error('Lỗi khi tạo hóa đơn tự động:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};