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
    chi_so_dien_cu,   // Có thể null/undefined
    chi_so_dien_moi, 
    chi_so_nuoc_cu,   // Có thể null/undefined
    chi_so_nuoc_moi, 
    tien_phong,       // Có thể truyền 0 nếu bỏ chọn
    tien_dien,        // Có thể truyền 0 nếu bỏ chọn
    tien_nuoc,        // Có thể truyền 0 nếu bỏ chọn
    han_dong_tien,
    thang_nam 
  } = req.body;
  
  // Kiểm tra thiếu thông tin bắt buộc
  if (!ma_phong || !chi_so_dien_moi || !chi_so_nuoc_moi || !han_dong_tien || !thang_nam) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra phòng tồn tại
    const room = await Phong.getPhongByMaPhong(ma_phong);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    // Lấy tháng và năm từ trường thang_nam (định dạng yyyy-mm-dd)
    const thangNamDate = new Date(thang_nam);
    const month = thangNamDate.getMonth() + 1;
    const year = thangNamDate.getFullYear();

    // Kiểm tra hóa đơn trùng tháng/năm phòng này
    const hasInvoiceInMonth = await HoaDon.checkExistInvoiceInMonth(ma_phong, month, year);
    if (hasInvoiceInMonth) {
      return res.status(400).json({ message: `Phòng này đã có hóa đơn trong tháng ${month}/${year}` });
    }

    // Lấy chỉ số cũ của điện/nước từ hóa đơn gần nhất nếu không truyền từ client
    let cs_dien_cu = chi_so_dien_cu;
    let cs_nuoc_cu = chi_so_nuoc_cu;
    if (cs_dien_cu == null || cs_nuoc_cu == null) {
      const lastInvoice = await HoaDon.getLatestChiSoMoiByPhongId(ma_phong);
      if (lastInvoice) {
        if (cs_dien_cu == null) cs_dien_cu = lastInvoice.chi_so_dien_moi || 0;
        if (cs_nuoc_cu == null) cs_nuoc_cu = lastInvoice.chi_so_nuoc_moi || 0;
      } else {
        // Nếu chưa có hóa đơn nào trước đó thì mặc định = 0
        if (cs_dien_cu == null) cs_dien_cu = 0;
        if (cs_nuoc_cu == null) cs_nuoc_cu = 0;
      }
    }

    // Lấy giá điện, nước của dãy trọ để tính mặc định nếu không truyền từ FE
    const dayTro = await DayTro.getDayTroByMaDay(room.ma_day);

    // Tính số lượng tiêu thụ
    const so_dien = chi_so_dien_moi - cs_dien_cu;
    const so_nuoc = chi_so_nuoc_moi - cs_nuoc_cu;

    if (so_dien < 0 || so_nuoc < 0) {
      return res.status(400).json({ 
        message: 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ', 
        chi_so_dien_cu: cs_dien_cu, 
        chi_so_dien_moi, 
        chi_so_nuoc_cu: cs_nuoc_cu, 
        chi_so_nuoc_moi
      });
    }

    // Nếu FE truyền lên đã có tiền điện/nước/phòng thì dùng luôn; nếu không, BE tự tính
    let tien_dien_final;
    if (typeof tien_dien === 'number') tien_dien_final = tien_dien;
    else tien_dien_final = so_dien * dayTro.gia_dien;

    let tien_nuoc_final;
    if (typeof tien_nuoc === 'number') tien_nuoc_final = tien_nuoc;
    else tien_nuoc_final = so_nuoc * dayTro.gia_nuoc;

    const DEFAULT_ROOM_PRICE = 1100000.00;
    let tien_phong_final;
    if (typeof tien_phong === 'number') tien_phong_final = tien_phong;
    else tien_phong_final = (room.gia_thue && room.gia_thue > 0 ? room.gia_thue : DEFAULT_ROOM_PRICE);

    // Tổng tiền
    const tong_tien = tien_dien_final + tien_nuoc_final + tien_phong_final;

    // Tạo hóa đơn
    const newInvoice = await HoaDon.addHoaDon({
      ma_phong,
      tong_tien,
      so_dien,
      so_nuoc,
      chi_so_dien_cu: cs_dien_cu,
      chi_so_dien_moi,
      chi_so_nuoc_cu: cs_nuoc_cu,
      chi_so_nuoc_moi,
      tien_dien: tien_dien_final,
      tien_nuoc: tien_nuoc_final,
      tien_phong: tien_phong_final,
      han_dong_tien,
      trang_thai: 'chưa thanh toán',
      ngay_tao: new Date(),
      thang_nam
    });

    // Tạo thông báo hóa đơn mới
    const hanDongTien = new Date(han_dong_tien).toLocaleDateString('vi-VN');
    const noiDungThongBao = `Hóa đơn mới: Phòng ${ma_phong} có hóa đơn ${formatCurrency(tong_tien)}đ, hạn đóng tiền ${hanDongTien}`;

    await ThongBaoHoaDon.createNotification({
      ma_hoa_don: newInvoice.ma_hoa_don,
      noi_dung: noiDungThongBao,
      ngay_tao: new Date()
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
  const {
    chi_so_dien_moi,
    chi_so_nuoc_moi,
    tien_dien,
    tien_nuoc,
    so_dien,
    so_nuoc,
    tien_phong,
    tong_tien,
    tien_lai_gia_han
  } = req.body;

  try {
    // Lấy hóa đơn hiện tại từ DB
    const invoice = await HoaDon.getHoaDonById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    // Update chỉ những trường vợ muốn, các trường còn lại giữ nguyên
    const updatedInvoice = await HoaDon.updateHoaDon(id, {
      ma_phong: invoice.ma_phong,
      tong_tien: tong_tien !== undefined ? tong_tien : invoice.tong_tien,
      so_dien: so_dien !== undefined ? so_dien : invoice.so_dien,
      so_nuoc: so_nuoc !== undefined ? so_nuoc : invoice.so_nuoc,
      han_dong_tien: invoice.han_dong_tien,
      trang_thai: invoice.trang_thai,
      chi_so_dien_cu: invoice.chi_so_dien_cu,
      chi_so_dien_moi: chi_so_dien_moi !== undefined ? chi_so_dien_moi : invoice.chi_so_dien_moi,
      chi_so_nuoc_cu: invoice.chi_so_nuoc_cu,
      chi_so_nuoc_moi: chi_so_nuoc_moi !== undefined ? chi_so_nuoc_moi : invoice.chi_so_nuoc_moi,
      tien_dien: tien_dien !== undefined ? tien_dien : invoice.tien_dien,
      tien_nuoc: tien_nuoc !== undefined ? tien_nuoc : invoice.tien_nuoc,
      tien_phong: tien_phong !== undefined ? tien_phong : invoice.tien_phong,
      thang_nam: invoice.thang_nam,
      ngay_thanh_toan: invoice.ngay_thanh_toan,
      tien_lai_gia_han: tien_lai_gia_han !== undefined ? tien_lai_gia_han : invoice.tien_lai_gia_han
    });

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
        // Lấy 2 số cuối mã phòng
        const ma_phong = invoice.ma_phong?.toString() || '';
        const ma_phong_short = ma_phong.length > 2 ? ma_phong.slice(-2) : ma_phong;

        // Format tháng_năm từ Date hoặc ISO string -> mm/yyyy
        let thangNam = '';
        if (invoice.thang_nam) {
          let dateObj = invoice.thang_nam;
          if (!(dateObj instanceof Date)) {
            dateObj = new Date(dateObj);
          }
          // Nếu chuyển được sang date hợp lệ
          if (!isNaN(dateObj.getTime())) {
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            thangNam = `${month}/${year}`;
          }
        }

        const noiDungThongBao = `Hóa đơn ${thangNam} của phòng ${ma_phong_short} đã được thanh toán thành công.`;

        await ThongBaoHoaDon.createNotification({
          ma_hoa_don: invoice.ma_hoa_don,
          noi_dung: noiDungThongBao,
          ngay_tao: new Date()
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
    // Kiểm tra tồn tại hóa đơn
    const invoice = await HoaDon.getHoaDonById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    // Chỉ cần gọi 1 lệnh này (model đã xử lý tất cả)
    const deletedInvoice = await HoaDon.deleteHoaDon(id);

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

// Lấy chỉ số điện mới & nước mới gần nhất của phòng
exports.getLatestMeterIndexesByRoom = async (req, res) => {
  // parseInt cho chắc, vì route params luôn là string
  const ma_phong = parseInt(req.params.roomId, 10); // đổi lại cho đúng tên params ở route

  if (isNaN(ma_phong)) {
    return res.status(400).json({ message: 'Mã phòng không hợp lệ' });
  }

  try {
    // Kiểm tra phòng tồn tại không
    const room = await Phong.getPhongByMaPhong(ma_phong);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    const lastMeter = await HoaDon.getLatestChiSoMoiByPhongId(ma_phong);
    if (!lastMeter) {
      return res.status(404).json({ message: 'Chưa có hóa đơn nào cho phòng này' });
    }
    res.status(200).json(lastMeter);
  } catch (err) {
    console.error('Lỗi khi lấy chỉ số điện nước mới nhất:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};