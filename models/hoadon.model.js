// hoadon.model.js
const pool = require('../db/postgres');

// Hằng số cho giá phòng mặc định và lãi suất gia hạn
const DEFAULT_ROOM_PRICE = 1100000.00; // Giá phòng mặc định: 1.100.000 đồng
const EXTENSION_INTEREST_RATE = 0.005; // Lãi suất gia hạn: 0.5% mỗi ngày

// Model Hóa đơn
const HoaDon = {};

// Lấy tất cả hóa đơn
HoaDon.getAllHoaDon = async () => {
  const query = `
    SELECT * FROM hoa_don
    ORDER BY ma_hoa_don DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Lấy hóa đơn theo mã hóa đơn
HoaDon.getHoaDonById = async (ma_hoa_don) => {
  const query = `
    SELECT * FROM hoa_don
    WHERE ma_hoa_don = $1
  `;
  const result = await pool.query(query, [ma_hoa_don]);
  return result.rows[0];
};

// Lấy hóa đơn theo mã phòng
HoaDon.getHoaDonByPhongId = async (ma_phong) => {
  const query = `
    SELECT * FROM hoa_don
    WHERE ma_phong = $1
    ORDER BY ma_hoa_don DESC
  `;
  const result = await pool.query(query, [ma_phong]);
  return result.rows;
};

// Lấy hóa đơn theo mã dãy trọ
HoaDon.getHoaDonByMotelId = async (ma_day_tro) => {
  const query = `
    SELECT hd.* 
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    WHERE p.ma_day_tro = $1
    ORDER BY hd.ma_hoa_don DESC
  `;
  const result = await pool.query(query, [ma_day_tro]);
  return result.rows;
};

// Lấy hóa đơn chưa thanh toán theo mã dãy trọ
HoaDon.getUnpaidHoaDonByMotelId = async (ma_day_tro) => {
  const query = `
    SELECT hd.* 
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    WHERE p.ma_day_tro = $1 AND hd.trang_thai = 'chưa thanh toán'
    ORDER BY hd.han_dong_tien ASC
  `;
  const result = await pool.query(query, [ma_day_tro]);
  return result.rows;
};

// Lấy hóa đơn chưa thanh toán theo mã phòng
HoaDon.getUnpaidHoaDonByPhongId = async (ma_phong) => {
  const query = `
    SELECT * FROM hoa_don
    WHERE ma_phong = $1 AND trang_thai = 'chưa thanh toán'
    ORDER BY han_dong_tien ASC
  `;
  const result = await pool.query(query, [ma_phong]);
  return result.rows;
};

// Thêm hóa đơn mới
HoaDon.addHoaDon = async (hoaDonData) => {
  const { 
    ma_phong, 
    tong_tien, 
    so_dien, 
    so_nuoc, 
    han_dong_tien, 
    trang_thai,
    chi_so_dien_cu,
    chi_so_dien_moi,
    chi_so_nuoc_cu,
    chi_so_nuoc_moi,
    tien_dien,
    tien_nuoc,
    tien_phong
  } = hoaDonData;
  
  const query = `
    INSERT INTO hoa_don (
      ma_phong, 
      tong_tien, 
      so_dien, 
      so_nuoc, 
      han_dong_tien, 
      trang_thai,
      chi_so_dien_cu,
      chi_so_dien_moi,
      chi_so_nuoc_cu,
      chi_so_nuoc_moi,
      tien_dien,
      tien_nuoc,
      tien_phong
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  
  const values = [
    ma_phong, 
    tong_tien, 
    so_dien, 
    so_nuoc, 
    han_dong_tien, 
    trang_thai || 'chưa thanh toán',
    chi_so_dien_cu,
    chi_so_dien_moi,
    chi_so_nuoc_cu,
    chi_so_nuoc_moi,
    tien_dien,
    tien_nuoc,
    tien_phong
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cập nhật hóa đơn
HoaDon.updateHoaDon = async (ma_hoa_don, hoaDonData) => {
  const { 
    ma_phong, 
    tong_tien, 
    so_dien, 
    so_nuoc, 
    han_dong_tien, 
    trang_thai,
    chi_so_dien_cu,
    chi_so_dien_moi,
    chi_so_nuoc_cu,
    chi_so_nuoc_moi,
    tien_dien,
    tien_nuoc,
    tien_phong 
  } = hoaDonData;
  
  const query = `
    UPDATE hoa_don
    SET ma_phong = $1, 
        tong_tien = $2, 
        so_dien = $3, 
        so_nuoc = $4, 
        han_dong_tien = $5, 
        trang_thai = $6,
        chi_so_dien_cu = $7,
        chi_so_dien_moi = $8,
        chi_so_nuoc_cu = $9,
        chi_so_nuoc_moi = $10,
        tien_dien = $11,
        tien_nuoc = $12,
        tien_phong = $13
    WHERE ma_hoa_don = $14
    RETURNING *
  `;
  
  const values = [
    ma_phong, 
    tong_tien, 
    so_dien, 
    so_nuoc, 
    han_dong_tien, 
    trang_thai,
    chi_so_dien_cu,
    chi_so_dien_moi,
    chi_so_nuoc_cu,
    chi_so_nuoc_moi,
    tien_dien,
    tien_nuoc,
    tien_phong,
    ma_hoa_don
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cập nhật trạng thái hóa đơn
HoaDon.updateHoaDonStatus = async (ma_hoa_don, trang_thai) => {
  const query = `
    UPDATE hoa_don
    SET trang_thai = $1
    WHERE ma_hoa_don = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [trang_thai, ma_hoa_don]);
  return result.rows[0];
};

// Yêu cầu gia hạn hóa đơn
HoaDon.requestExtension = async (ma_hoa_don, ngay_gia_han) => {
  try {
    // Lấy thông tin hóa đơn hiện tại
    const invoiceQuery = `SELECT * FROM hoa_don WHERE ma_hoa_don = $1`;
    const invoiceResult = await pool.query(invoiceQuery, [ma_hoa_don]);
    
    if (invoiceResult.rows.length === 0) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    
    const invoice = invoiceResult.rows[0];
    
    // Kiểm tra nếu hóa đơn đã thanh toán
    if (invoice.trang_thai === 'đã thanh toán') {
      throw new Error('Không thể gia hạn hóa đơn đã thanh toán');
    }
    
    const ngayTaoHoaDon = new Date(invoice.ngay_tao);
    const hanDongTienHienTai = new Date(invoice.han_dong_tien);
    const ngayGiaHanMoi = new Date(ngay_gia_han);
    
    // Kiểm tra ngày gia hạn phải lớn hơn ngày tạo hóa đơn
    if (ngayGiaHanMoi <= ngayTaoHoaDon) {
      throw new Error('Ngày gia hạn phải lớn hơn ngày tạo hóa đơn');
    }
    
    // Kiểm tra ngày gia hạn phải lớn hơn ngày hiện tại
    const ngayHienTai = new Date();
    if (ngayGiaHanMoi <= ngayHienTai) {
      throw new Error('Ngày gia hạn phải lớn hơn ngày hiện tại');
    }
    
    // Kiểm tra ngày gia hạn phải lớn hơn hạn đóng tiền hiện tại
    if (ngayGiaHanMoi <= hanDongTienHienTai) {
      throw new Error('Ngày gia hạn phải lớn hơn hạn đóng tiền hiện tại');
    }
    
    // Kiểm tra xem hóa đơn đã được gia hạn trong tháng hiện tại chưa
    const hasExtensionInMonth = await HoaDon.checkExtensionInMonth(ma_hoa_don);
    if (hasExtensionInMonth) {
      throw new Error('Hóa đơn này đã được yêu cầu gia hạn trong tháng hiện tại, mỗi tháng chỉ được gia hạn 1 lần');
    }
    
    const query = `
      UPDATE hoa_don
      SET ngay_gia_han = $1, 
          da_duyet_gia_han = false,
          ngay_cap_nhat_gia_han = CURRENT_TIMESTAMP
      WHERE ma_hoa_don = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [ngay_gia_han, ma_hoa_don]);
    return result.rows[0];
  } catch (error) {
    console.error('Lỗi khi yêu cầu gia hạn hóa đơn:', error);
    throw error;
  }
};

// Duyệt gia hạn hóa đơn
HoaDon.approveExtension = async (ma_hoa_don) => {
  try {
    // Lấy thông tin hóa đơn hiện tại
    const invoiceQuery = `SELECT * FROM hoa_don WHERE ma_hoa_don = $1`;
    const invoiceResult = await pool.query(invoiceQuery, [ma_hoa_don]);
    
    if (invoiceResult.rows.length === 0) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    
    const invoice = invoiceResult.rows[0];
    const han_dong_tien_cu = new Date(invoice.han_dong_tien);
    const ngay_gia_han = new Date(invoice.ngay_gia_han);
    
    // Tính số ngày gia hạn
    const so_ngay_gia_han = Math.ceil((ngay_gia_han - han_dong_tien_cu) / (1000 * 60 * 60 * 24));
    
    // Tính tiền lãi dựa trên số ngày gia hạn và lãi suất
    const tien_lai = so_ngay_gia_han > 0 ? invoice.tong_tien * EXTENSION_INTEREST_RATE * so_ngay_gia_han : 0;
    
    // Cập nhật tổng tiền và trạng thái gia hạn
    const tong_tien_moi = invoice.tong_tien + tien_lai;
    
    // Cập nhật hóa đơn
    const updateQuery = `
      UPDATE hoa_don
      SET da_duyet_gia_han = true, 
          han_dong_tien = ngay_gia_han, 
          tong_tien = $1,
          tien_lai_gia_han = $2,
          so_ngay_gia_han = $3
      WHERE ma_hoa_don = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [tong_tien_moi, tien_lai, so_ngay_gia_han, ma_hoa_don]);
    return result.rows[0];
  } catch (error) {
    console.error('Lỗi khi duyệt gia hạn hóa đơn:', error);
    throw error;
  }
};

// Xóa hóa đơn
HoaDon.deleteHoaDon = async (ma_hoa_don) => {
  const query = `
    DELETE FROM hoa_don
    WHERE ma_hoa_don = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [ma_hoa_don]);
  return result.rows[0];
};

// Lấy thống kê hóa đơn theo tháng
HoaDon.getMonthlyStats = async (year, month) => {
  const query = `
    SELECT 
      COUNT(*) as total_invoices,
      SUM(tong_tien) as total_amount,
      SUM(CASE WHEN trang_thai = 'đã thanh toán' THEN 1 ELSE 0 END) as paid_invoices,
      SUM(CASE WHEN trang_thai = 'chưa thanh toán' THEN 1 ELSE 0 END) as unpaid_invoices
    FROM hoa_don
    WHERE EXTRACT(YEAR FROM han_dong_tien) = $1 
      AND EXTRACT(MONTH FROM han_dong_tien) = $2
  `;
  
  const result = await pool.query(query, [year, month]);
  return result.rows[0];
};

// Lấy thống kê chi tiết hóa đơn theo tháng (bao gồm tiền điện, nước)
HoaDon.getDetailedMonthlyStats = async (year, month) => {
  const query = `
    SELECT 
      COUNT(*) as total_invoices,
      SUM(tong_tien) as total_amount,
      SUM(tien_dien) as total_electric,
      SUM(tien_nuoc) as total_water,
      SUM(tien_phong) as total_room,
      SUM(CASE WHEN trang_thai = 'đã thanh toán' THEN 1 ELSE 0 END) as paid_invoices,
      SUM(CASE WHEN trang_thai = 'chưa thanh toán' THEN 1 ELSE 0 END) as unpaid_invoices,
      SUM(so_dien) as total_electric_consumed,
      SUM(so_nuoc) as total_water_consumed
    FROM hoa_don
    WHERE EXTRACT(YEAR FROM han_dong_tien) = $1 
      AND EXTRACT(MONTH FROM han_dong_tien) = $2
  `;
  
  const result = await pool.query(query, [year, month]);
  return result.rows[0];
};

// Tính toán hóa đơn tự động
HoaDon.calculateBill = async (ma_phong, chi_so_dien_moi, chi_so_nuoc_moi) => {
  try {
    // Lấy thông tin phòng
    const phongQuery = `
      SELECT p.ma_phong, p.gia_thue, p.ma_day, d.gia_dien, d.gia_nuoc
      FROM phong p
      JOIN day_tro d ON p.ma_day = d.ma_day
      WHERE p.ma_phong = $1
    `;
    const phongResult = await pool.query(phongQuery, [ma_phong]);
    
    if (phongResult.rows.length === 0) {
      throw new Error('Không tìm thấy thông tin phòng');
    }
    
    const phong = phongResult.rows[0];
    const gia_dien = phong.gia_dien;
    const gia_nuoc = phong.gia_nuoc;
    // Sử dụng giá phòng mặc định nếu không có giá phòng hoặc giá phòng = 0
    const gia_thue = phong.gia_thue && phong.gia_thue > 0 ? phong.gia_thue : DEFAULT_ROOM_PRICE;
    
    // Lấy chỉ số cũ từ hóa đơn gần đây nhất của phòng
    const lastInvoiceQuery = `
      SELECT chi_so_dien_moi, chi_so_nuoc_moi
      FROM hoa_don
      WHERE ma_phong = $1
      ORDER BY ma_hoa_don DESC
      LIMIT 1
    `;
    const lastInvoiceResult = await pool.query(lastInvoiceQuery, [ma_phong]);
    
    // Nếu không có hóa đơn trước đó, coi như chỉ số cũ là 0
    let chi_so_dien_cu = 0;
    let chi_so_nuoc_cu = 0;
    
    if (lastInvoiceResult.rows.length > 0) {
      const lastInvoice = lastInvoiceResult.rows[0];
      chi_so_dien_cu = lastInvoice.chi_so_dien_moi || 0;
      chi_so_nuoc_cu = lastInvoice.chi_so_nuoc_moi || 0;
    }
    
    // Tính số lượng tiêu thụ
    const so_dien = chi_so_dien_moi - chi_so_dien_cu;
    const so_nuoc = chi_so_nuoc_moi - chi_so_nuoc_cu;
    
    // Tính tiền
    const tien_dien = so_dien * gia_dien;
    const tien_nuoc = so_nuoc * gia_nuoc;
    const tien_phong = gia_thue;
    const tong_tien = tien_dien + tien_nuoc + tien_phong;
    
    // Trả về kết quả
    return {
      ma_phong,
      chi_so_dien_cu,
      chi_so_dien_moi,
      chi_so_nuoc_cu,
      chi_so_nuoc_moi,
      so_dien,
      so_nuoc,
      gia_dien,
      gia_nuoc,
      tien_dien,
      tien_nuoc,
      tien_phong,
      tong_tien
    };
  } catch (error) {
    console.error('Lỗi khi tính toán hóa đơn:', error);
    throw error;
  }
};

// Tạo hóa đơn tự động từ chỉ số điện nước
HoaDon.createAutomaticInvoice = async (ma_phong, chi_so_dien_moi, chi_so_nuoc_moi, han_dong_tien) => {
  try {
    // Tính toán chi tiết hóa đơn
    const billDetails = await HoaDon.calculateBill(ma_phong, chi_so_dien_moi, chi_so_nuoc_moi);
    
    // Tạo hóa đơn mới với chi tiết đã tính
    const newInvoice = await HoaDon.addHoaDon({
      ma_phong: billDetails.ma_phong,
      chi_so_dien_cu: billDetails.chi_so_dien_cu,
      chi_so_dien_moi: billDetails.chi_so_dien_moi,
      chi_so_nuoc_cu: billDetails.chi_so_nuoc_cu,
      chi_so_nuoc_moi: billDetails.chi_so_nuoc_moi,
      so_dien: billDetails.so_dien,
      so_nuoc: billDetails.so_nuoc,
      tien_dien: billDetails.tien_dien,
      tien_nuoc: billDetails.tien_nuoc,
      tien_phong: billDetails.tien_phong,
      tong_tien: billDetails.tong_tien,
      han_dong_tien: han_dong_tien,
      trang_thai: 'chưa thanh toán'
    });
    
    return newInvoice;
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn tự động:', error);
    throw error;
  }
};

// Kiểm tra xem phòng đã có hóa đơn trong tháng chưa
HoaDon.checkExistInvoiceInMonth = async (ma_phong, month, year) => {
  try {
    // Chỉ kiểm tra theo tháng/năm của hạn đóng tiền
    const query = `
      SELECT count(*) as invoice_count 
      FROM hoa_don 
      WHERE ma_phong = $1 
      AND EXTRACT(MONTH FROM han_dong_tien) = $2 
      AND EXTRACT(YEAR FROM han_dong_tien) = $3
    `;
    
    console.log(`SQL kiểm tra hóa đơn: ${query}`);
    console.log(`Params: ma_phong=${ma_phong}, month=${month}, year=${year}`);
    
    const result = await pool.query(query, [ma_phong, month, year]);
    const count = parseInt(result.rows[0].invoice_count, 10);
    
    console.log(`Số lượng hóa đơn tìm thấy: ${count}`);
    
    return count > 0;
  } catch (error) {
    console.error('Lỗi khi kiểm tra hóa đơn trong tháng:', error);
    throw error;
  }
};

// Kiểm tra xem hóa đơn đã được gia hạn trong tháng chưa
HoaDon.checkExtensionInMonth = async (ma_hoa_don) => {
  try {
    const invoice = await HoaDon.getHoaDonById(ma_hoa_don);
    if (!invoice) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    
    // Kiểm tra nếu đã có yêu cầu gia hạn trong tháng hiện tại
    const query = `
      SELECT COUNT(*) as extension_count
      FROM hoa_don
      WHERE ma_hoa_don = $1
      AND ngay_gia_han IS NOT NULL
      AND EXTRACT(MONTH FROM ngay_cap_nhat_gia_han) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM ngay_cap_nhat_gia_han) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;
    
    const result = await pool.query(query, [ma_hoa_don]);
    return parseInt(result.rows[0].extension_count, 10) > 0;
  } catch (error) {
    console.error('Lỗi khi kiểm tra gia hạn trong tháng:', error);
    throw error;
  }
};

module.exports = HoaDon;