// stat.controller.js
const Phong = require('../models/phong.model');
const DayTro = require('../models/daytro.model');
const pool = require('../db/postgres');

// Thống kê tiền trọ (đã thanh toán, còn nợ)
exports.getPaymentStats = async (req, res) => {
  const { ma_day, thang } = req.params;
  
  try {
    // Chuẩn bị khoảng thời gian của tháng cần thống kê
    const date = new Date(thang);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    
    // Truy vấn hóa đơn trong khoảng thời gian
    const query = `
      SELECT 
        SUM(CASE WHEN trang_thai = 'đã thanh toán' THEN tong_tien ELSE 0 END) as da_thanh_toan,
        SUM(CASE WHEN trang_thai = 'chưa thanh toán' THEN tong_tien ELSE 0 END) as con_no,
        COUNT(CASE WHEN trang_thai = 'đã thanh toán' THEN 1 END) as so_phong_da_dong,
        COUNT(CASE WHEN trang_thai = 'chưa thanh toán' AND han_dong_tien < CURRENT_DATE THEN 1 END) as so_phong_tre_han,
        COUNT(CASE WHEN trang_thai = 'chưa thanh toán' AND han_dong_tien >= CURRENT_DATE THEN 1 END) as so_phong_chua_dong
      FROM hoa_don
      WHERE 
        ma_phong IN (SELECT ma_phong FROM phong WHERE ma_day = $1)
        AND ngay_tao BETWEEN $2 AND $3
    `;
    
    const result = await pool.query(query, [ma_day, startOfMonth, endOfMonth]);
    const stats = result.rows[0];
    
    const thongKe = {
      thang: thang,
      ma_day: ma_day,
      da_thanh_toan: stats.da_thanh_toan || 0,
      con_no: stats.con_no || 0,
      so_phong_da_dong: stats.so_phong_da_dong || 0,
      so_phong_tre_han: stats.so_phong_tre_han || 0,
      so_phong_chua_dong: stats.so_phong_chua_dong || 0,
      tong_tien: (stats.da_thanh_toan || 0) + (stats.con_no || 0),
      tong_so_phong: (stats.so_phong_da_dong || 0) + (stats.so_phong_tre_han || 0) + (stats.so_phong_chua_dong || 0)
    };
    
    res.status(200).json(thongKe);
  } catch (err) {
    console.error('Lỗi khi thống kê tiền trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thống kê lợi nhuận điện nước
exports.getUtilityProfitStats = async (req, res) => {
  const { ma_day, thang } = req.params;
  
  try {
    // Chuẩn bị khoảng thời gian của tháng cần thống kê
    const date = new Date(thang);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    
    // Lấy thông tin dãy trọ (giá điện, nước gốc và giá bán)
    const dayTro = await DayTro.getDayTroByMaDay(ma_day);
    
    // Lấy tất cả hóa đơn của dãy trọ trong tháng
    const hoaDonQuery = `
      SELECT 
        hd.ma_hoa_don,
        hd.so_dien,
        hd.so_nuoc,
        hd.tien_dien,
        hd.tien_nuoc
      FROM hoa_don hd
      JOIN phong p ON hd.ma_phong = p.ma_phong
      WHERE 
        p.ma_day = $1
        AND hd.ngay_tao BETWEEN $2 AND $3
    `;
    
    const hoaDonResult = await pool.query(hoaDonQuery, [ma_day, startOfMonth, endOfMonth]);
    const hoaDons = hoaDonResult.rows;
    
    // Tính tổng lợi nhuận
    let tongSoDien = 0;
    let tongSoNuoc = 0;
    let tongTienDien = 0;
    let tongTienNuoc = 0;
    let tongLoiNhuanDien = 0;
    let tongLoiNhuanNuoc = 0;
    
    hoaDons.forEach(hd => {
      tongSoDien += hd.so_dien || 0;
      tongSoNuoc += hd.so_nuoc || 0;
      tongTienDien += hd.tien_dien || 0;
      tongTienNuoc += hd.tien_nuoc || 0;
      
      // Tính lợi nhuận
      const loiNhuanDien = (hd.so_dien || 0) * (dayTro.gia_dien - dayTro.gia_dien_goc);
      const loiNhuanNuoc = (hd.so_nuoc || 0) * (dayTro.gia_nuoc - dayTro.gia_nuoc_goc);
      
      tongLoiNhuanDien += loiNhuanDien;
      tongLoiNhuanNuoc += loiNhuanNuoc;
    });
    
    res.status(200).json({
      thang: thang,
      gia_dien: {
        gia_nha_nuoc: dayTro.gia_dien_goc,
        gia_phong_tro: dayTro.gia_dien
      },
      gia_nuoc: {
        gia_nha_nuoc: dayTro.gia_nuoc_goc,
        gia_phong_tro: dayTro.gia_nuoc
      },
      thong_ke_dien: {
        tong_so_dien: tongSoDien,
        tong_tien_dien: tongTienDien,
        loi_nhuan_dien: tongLoiNhuanDien
      },
      thong_ke_nuoc: {
        tong_so_nuoc: tongSoNuoc,
        tong_tien_nuoc: tongTienNuoc,
        loi_nhuan_nuoc: tongLoiNhuanNuoc
      }
    });
  } catch (err) {
    console.error('Lỗi khi thống kê lợi nhuận điện nước:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thống kê lịch sử sử dụng điện nước theo phòng
exports.getRoomUtilityHistory = async (req, res) => {
  const { ma_phong, tu_thang, den_thang } = req.params;
  
  try {
    // Chuẩn bị khoảng thời gian
    const tuDate = new Date(tu_thang);
    const denDate = new Date(den_thang);
    const startDate = new Date(tuDate.getFullYear(), tuDate.getMonth(), 1);
    const endDate = new Date(denDate.getFullYear(), denDate.getMonth() + 1, 0, 23, 59, 59);
    
    // Truy vấn lịch sử sử dụng
    const query = `
      SELECT 
        ma_hoa_don,
        ma_phong,
        to_char(ngay_tao, 'MM/YYYY') as thang,
        so_dien,
        so_nuoc,
        chi_so_dien_cu,
        chi_so_dien_moi,
        chi_so_nuoc_cu,
        chi_so_nuoc_moi
      FROM hoa_don
      WHERE 
        ma_phong = $1
        AND ngay_tao BETWEEN $2 AND $3
      ORDER BY ngay_tao
    `;
    
    const result = await pool.query(query, [ma_phong, startDate, endDate]);
    const lichSu = result.rows;
    
    // Xử lý dữ liệu theo tháng
    const thongKeDien = {};
    const thongKeNuoc = {};
    
    lichSu.forEach(item => {
      thongKeDien[item.thang] = item.so_dien || 0;
      thongKeNuoc[item.thang] = item.so_nuoc || 0;
    });
    
    // Tìm tháng sử dụng cao nhất và thấp nhất
    const thangDienMax = Object.entries(thongKeDien).reduce((max, [thang, giatri]) => 
      giatri > (max.giatri || 0) ? {thang, giatri} : max, {});
    
    const thangDienMin = Object.entries(thongKeDien).reduce((min, [thang, giatri]) => 
      (min.giatri === undefined || giatri < min.giatri) ? {thang, giatri} : min, {});
    
    const thangNuocMax = Object.entries(thongKeNuoc).reduce((max, [thang, giatri]) => 
      giatri > (max.giatri || 0) ? {thang, giatri} : max, {});
    
    const thangNuocMin = Object.entries(thongKeNuoc).reduce((min, [thang, giatri]) => 
      (min.giatri === undefined || giatri < min.giatri) ? {thang, giatri} : min, {});
    
    res.status(200).json({
      ma_phong,
      tu_thang,
      den_thang,
      thong_ke_dien: {
        theo_thang: thongKeDien,
        cao_nhat: {
          thang: thangDienMax.thang,
          gia_tri: thangDienMax.giatri
        },
        thap_nhat: {
          thang: thangDienMin.thang,
          gia_tri: thangDienMin.giatri
        }
      },
      thong_ke_nuoc: {
        theo_thang: thongKeNuoc,
        cao_nhat: {
          thang: thangNuocMax.thang,
          gia_tri: thangNuocMax.giatri
        },
        thap_nhat: {
          thang: thangNuocMin.thang,
          gia_tri: thangNuocMin.giatri
        }
      },
      chi_tiet: lichSu
    });
  } catch (err) {
    console.error('Lỗi khi thống kê lịch sử sử dụng điện nước:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thống kê theo khoảng thời gian (hàng tháng, hàng quý, hàng năm)
exports.getPeriodicStats = async (req, res) => {
  const { ma_day, tu_thang, den_thang, loai_thong_ke } = req.params;
  
  try {
    // Chuẩn bị khoảng thời gian
    const tuDate = new Date(tu_thang);
    const denDate = new Date(den_thang);
    const startDate = new Date(tuDate.getFullYear(), tuDate.getMonth(), 1);
    const endDate = new Date(denDate.getFullYear(), denDate.getMonth() + 1, 0, 23, 59, 59);
    
    let querySelect = '';
    let queryGroupBy = '';
    
    // Xác định cách nhóm dữ liệu theo loại thống kê
    switch (loai_thong_ke) {
      case 'thang':
        querySelect = `to_char(ngay_tao, 'MM/YYYY') as thoi_gian`;
        queryGroupBy = `GROUP BY to_char(ngay_tao, 'MM/YYYY') ORDER BY MIN(ngay_tao)`;
        break;
      case 'quy':
        querySelect = `CONCAT('Q', EXTRACT(QUARTER FROM ngay_tao), '/', EXTRACT(YEAR FROM ngay_tao)) as thoi_gian`;
        queryGroupBy = `GROUP BY EXTRACT(YEAR FROM ngay_tao), EXTRACT(QUARTER FROM ngay_tao) ORDER BY MIN(ngay_tao)`;
        break;
      case 'nam':
        querySelect = `EXTRACT(YEAR FROM ngay_tao)::TEXT as thoi_gian`;
        queryGroupBy = `GROUP BY EXTRACT(YEAR FROM ngay_tao) ORDER BY MIN(ngay_tao)`;
        break;
      default:
        return res.status(400).json({ message: 'Loại thống kê không hợp lệ. Chọn: thang, quy, nam' });
    }
    
    // Truy vấn thống kê theo thời gian
    const query = `
      SELECT 
        ${querySelect},
        SUM(CASE WHEN trang_thai = 'đã thanh toán' THEN tong_tien ELSE 0 END) as da_thanh_toan,
        SUM(CASE WHEN trang_thai = 'chưa thanh toán' THEN tong_tien ELSE 0 END) as con_no,
        COUNT(CASE WHEN trang_thai = 'đã thanh toán' THEN 1 END) as so_phong_da_dong,
        COUNT(CASE WHEN trang_thai = 'chưa thanh toán' THEN 1 END) as so_phong_chua_dong,
        SUM(so_dien) as tong_so_dien,
        SUM(so_nuoc) as tong_so_nuoc,
        SUM(tien_dien) as tong_tien_dien,
        SUM(tien_nuoc) as tong_tien_nuoc,
        MIN(ngay_tao) as ngay_bat_dau,
        MAX(ngay_tao) as ngay_ket_thuc
      FROM hoa_don
      WHERE 
        ma_phong IN (SELECT ma_phong FROM phong WHERE ma_day = $1)
        AND ngay_tao BETWEEN $2 AND $3
      ${queryGroupBy}
    `;
    
    const result = await pool.query(query, [ma_day, startDate, endDate]);
    const statsList = result.rows;
    
    // Lấy thông tin dãy trọ (giá điện, nước gốc và giá bán)
    const dayTro = await DayTro.getDayTroByMaDay(ma_day);
    
    // Tính toán thêm các thông tin lợi nhuận cho mỗi kỳ
    const thongKeTheoCacKy = statsList.map(stats => {
      // Tính lợi nhuận
      const loiNhuanDien = (stats.tong_so_dien || 0) * (dayTro.gia_dien - dayTro.gia_dien_goc);
      const loiNhuanNuoc = (stats.tong_so_nuoc || 0) * (dayTro.gia_nuoc - dayTro.gia_nuoc_goc);
      
      return {
        thoi_gian: stats.thoi_gian,
        thong_ke_tien: {
          da_thanh_toan: Number(stats.da_thanh_toan) || 0,
          con_no: Number(stats.con_no) || 0,
          tong_cong: (Number(stats.da_thanh_toan) || 0) + (Number(stats.con_no) || 0)
        },
        thong_ke_phong: {
          so_phong_da_dong: Number(stats.so_phong_da_dong) || 0,
          so_phong_chua_dong: Number(stats.so_phong_chua_dong) || 0,
          tong_so_phong: (Number(stats.so_phong_da_dong) || 0) + (Number(stats.so_phong_chua_dong) || 0)
        },
        thong_ke_dien_nuoc: {
          tong_so_dien: Number(stats.tong_so_dien) || 0,
          tong_so_nuoc: Number(stats.tong_so_nuoc) || 0,
          tong_tien_dien: Number(stats.tong_tien_dien) || 0,
          tong_tien_nuoc: Number(stats.tong_tien_nuoc) || 0,
          loi_nhuan_dien: loiNhuanDien,
          loi_nhuan_nuoc: loiNhuanNuoc,
          tong_loi_nhuan: loiNhuanDien + loiNhuanNuoc
        },
        ngay_bat_dau: stats.ngay_bat_dau,
        ngay_ket_thuc: stats.ngay_ket_thuc
      };
    });
    
    // Tính tổng cộng cho toàn bộ khoảng thời gian
    const tongCong = {
      da_thanh_toan: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_tien.da_thanh_toan, 0),
      con_no: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_tien.con_no, 0),
      tong_so_dien: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_dien_nuoc.tong_so_dien, 0),
      tong_so_nuoc: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_dien_nuoc.tong_so_nuoc, 0),
      tong_tien_dien: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_dien_nuoc.tong_tien_dien, 0),
      tong_tien_nuoc: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_dien_nuoc.tong_tien_nuoc, 0),
      tong_loi_nhuan: thongKeTheoCacKy.reduce((sum, item) => sum + item.thong_ke_dien_nuoc.tong_loi_nhuan, 0)
    };
    
    res.status(200).json({
      ma_day,
      tu_thang,
      den_thang,
      loai_thong_ke,
      thong_ke_theo_ky: thongKeTheoCacKy,
      tong_cong: tongCong
    });
  } catch (err) {
    console.error('Lỗi khi thống kê định kỳ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};