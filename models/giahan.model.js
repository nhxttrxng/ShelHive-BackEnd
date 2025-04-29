// giahan.model.js
const pool = require('../db/postgres');

// Model Gia Hạn Hóa Đơn
const GiaHan = {};

// Lấy tất cả yêu cầu gia hạn
GiaHan.getAllGiaHan = async () => {
  const query = `
    SELECT * FROM gia_han
    ORDER BY ma_gia_han DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Lấy yêu cầu gia hạn theo mã gia hạn
GiaHan.getGiaHanById = async (maGiaHan) => {
  const query = `
    SELECT * FROM gia_han
    WHERE ma_gia_han = $1
  `;
  const result = await pool.query(query, [maGiaHan]);
  return result.rows[0];
};

// Lấy yêu cầu gia hạn theo mã hóa đơn
GiaHan.getGiaHanByHoaDonId = async (maHoaDon) => {
  const query = `
    SELECT * FROM gia_han
    WHERE ma_hoa_don = $1
    ORDER BY ma_gia_han DESC
  `;
  const result = await pool.query(query, [maHoaDon]);
  return result.rows;
};

// Thêm yêu cầu gia hạn mới
GiaHan.addGiaHan = async (giaHanData) => {
  const { ma_hoa_don, han_dong_tien_goc, han_thanh_toan_moi, trang_thai, lai_suat, tien_lai_tinh_du_kien } = giaHanData;
  
  const query = `
    INSERT INTO gia_han (ma_hoa_don, han_dong_tien_goc, han_thanh_toan_moi, trang_thai, lai_suat, tien_lai_tinh_du_kien)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    ma_hoa_don, 
    han_dong_tien_goc, 
    han_thanh_toan_moi, 
    trang_thai || 'chờ xác nhận', 
    lai_suat, 
    tien_lai_tinh_du_kien
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cập nhật yêu cầu gia hạn
GiaHan.updateGiaHan = async (maGiaHan, giaHanData) => {
  const { ma_hoa_don, han_dong_tien_goc, han_thanh_toan_moi, trang_thai, lai_suat, tien_lai_tinh_du_kien } = giaHanData;
  
  const query = `
    UPDATE gia_han
    SET ma_hoa_don = $1, 
        han_dong_tien_goc = $2, 
        han_thanh_toan_moi = $3, 
        trang_thai = $4, 
        lai_suat = $5, 
        tien_lai_tinh_du_kien = $6
    WHERE ma_gia_han = $7
    RETURNING *
  `;
  
  const values = [
    ma_hoa_don, 
    han_dong_tien_goc, 
    han_thanh_toan_moi, 
    trang_thai, 
    lai_suat, 
    tien_lai_tinh_du_kien, 
    maGiaHan
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cập nhật trạng thái yêu cầu gia hạn
GiaHan.updateGiaHanStatus = async (maGiaHan, trangThai) => {
  const query = `
    UPDATE gia_han
    SET trang_thai = $1
    WHERE ma_gia_han = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [trangThai, maGiaHan]);
  return result.rows[0];
};

// Duyệt yêu cầu gia hạn và cập nhật hóa đơn
GiaHan.approveGiaHan = async (maGiaHan) => {
  // Thực hiện transaction để đảm bảo tính nhất quán dữ liệu
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lấy thông tin gia hạn
    const giaHanQuery = `
      SELECT * FROM gia_han 
      WHERE ma_gia_han = $1
    `;
    const giaHanResult = await client.query(giaHanQuery, [maGiaHan]);
    const giaHan = giaHanResult.rows[0];
    
    if (!giaHan) {
      throw new Error('Không tìm thấy yêu cầu gia hạn');
    }
    
    // Cập nhật trạng thái gia hạn thành "đã duyệt"
    const updateGiaHanQuery = `
      UPDATE gia_han
      SET trang_thai = 'đã duyệt'
      WHERE ma_gia_han = $1
      RETURNING *
    `;
    const updatedGiaHan = await client.query(updateGiaHanQuery, [maGiaHan]);
    
    // Cập nhật hạn đóng tiền mới cho hóa đơn
    const updateHoaDonQuery = `
      UPDATE hoa_don
      SET han_dong_tien = $1,
          da_duyet_gia_han = true
      WHERE ma_hoa_don = $2
      RETURNING *
    `;
    await client.query(updateHoaDonQuery, [giaHan.han_thanh_toan_moi, giaHan.ma_hoa_don]);
    
    await client.query('COMMIT');
    return updatedGiaHan.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Từ chối yêu cầu gia hạn
GiaHan.rejectGiaHan = async (maGiaHan) => {
  const query = `
    UPDATE gia_han
    SET trang_thai = 'đã từ chối'
    WHERE ma_gia_han = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [maGiaHan]);
  return result.rows[0];
};

// Xóa yêu cầu gia hạn
GiaHan.deleteGiaHan = async (maGiaHan) => {
  const query = `
    DELETE FROM gia_han
    WHERE ma_gia_han = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [maGiaHan]);
  return result.rows[0];
};

// Tính toán tiền lãi dự kiến
GiaHan.calculateExpectedInterest = async (maHoaDon, hanThanhToanMoi, laiSuat) => {
  // Lấy thông tin hóa đơn
  const hoaDonQuery = `
    SELECT * FROM hoa_don
    WHERE ma_hoa_don = $1
  `;
  const hoaDonResult = await pool.query(hoaDonQuery, [maHoaDon]);
  const hoaDon = hoaDonResult.rows[0];
  
  if (!hoaDon) {
    throw new Error('Không tìm thấy hóa đơn');
  }
  
  // Tính số ngày gia hạn
  const hanGoc = new Date(hoaDon.han_dong_tien);
  const hanMoi = new Date(hanThanhToanMoi);
  const soNgayGiaHan = Math.ceil((hanMoi - hanGoc) / (1000 * 60 * 60 * 24));
  
  // Tính tiền lãi dự kiến
  const tienLaiDuKien = (hoaDon.tong_tien * (laiSuat / 100) * soNgayGiaHan) / 30; // Tính lãi theo tháng (30 ngày)
  
  return {
    tong_tien: hoaDon.tong_tien,
    lai_suat: laiSuat,
    so_ngay_gia_han: soNgayGiaHan,
    tien_lai_du_kien: Math.round(tienLaiDuKien * 100) / 100 // Làm tròn 2 chữ số thập phân
  };
};

// Lấy lịch sử gia hạn của hóa đơn
GiaHan.getGiaHanHistoryByHoaDonId = async (maHoaDon) => {
  const query = `
    SELECT * FROM gia_han
    WHERE ma_hoa_don = $1
    ORDER BY ma_gia_han ASC
  `;
  const result = await pool.query(query, [maHoaDon]);
  return result.rows;
};

module.exports = GiaHan;