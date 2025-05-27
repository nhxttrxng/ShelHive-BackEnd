const pool = require('../db/postgres');

const DEFAULT_ROOM_PRICE = 1100000.00; // Giá phòng mặc định: 1.100.000 đồng
const EXTENSION_INTEREST_RATE = 0.005; // Lãi suất gia hạn: 0.5% mỗi ngày

const HoaDon = {};

// Lấy tất cả hóa đơn
HoaDon.getAllHoaDon = async () => {
  const result = await pool.query(`SELECT * FROM hoa_don ORDER BY ma_hoa_don DESC`);
  return result.rows;
};

// Lấy hóa đơn theo mã
HoaDon.getHoaDonById = async (id) => {
  const result = await pool.query(`SELECT * FROM hoa_don WHERE ma_hoa_don = $1`, [id]);
  return result.rows[0];
};

// Lấy hóa đơn theo phòng
HoaDon.getHoaDonByPhongId = async (ma_phong) => {
  const result = await pool.query(
    `SELECT * FROM hoa_don WHERE ma_phong = $1 ORDER BY ma_hoa_don DESC`,
    [ma_phong]
  );
  return result.rows;
};

// Lấy hóa đơn theo dãy trọ
HoaDon.getHoaDonByMotelId = async (ma_day_tro) => {
  const result = await pool.query(
    `SELECT hd.* FROM hoa_don hd JOIN phong p ON hd.ma_phong = p.ma_phong WHERE p.ma_day_tro = $1 ORDER BY hd.ma_hoa_don DESC`,
    [ma_day_tro]
  );
  return result.rows;
};

// Lấy hóa đơn chưa thanh toán theo dãy trọ
HoaDon.getUnpaidHoaDonByMotelId = async (ma_day_tro) => {
  const result = await pool.query(
    `SELECT hd.* FROM hoa_don hd JOIN phong p ON hd.ma_phong = p.ma_phong WHERE p.ma_day_tro = $1 AND hd.trang_thai = 'chưa thanh toán' ORDER BY hd.han_dong_tien ASC`,
    [ma_day_tro]
  );
  return result.rows;
};

// Lấy hóa đơn chưa thanh toán theo phòng
HoaDon.getUnpaidHoaDonByPhongId = async (ma_phong) => {
  const result = await pool.query(
    `SELECT * FROM hoa_don WHERE ma_phong = $1 AND trang_thai = 'chưa thanh toán' ORDER BY han_dong_tien ASC`,
    [ma_phong]
  );
  return result.rows;
};

// Thêm hóa đơn
HoaDon.addHoaDon = async (data) => {
  const {
    ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai,
    chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi,
    tien_dien, tien_nuoc, tien_phong, thang_nam, ngay_thanh_toan
  } = data;

  const result = await pool.query(
    `INSERT INTO hoa_don (
      ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai,
      chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi,
      tien_dien, tien_nuoc, tien_phong, thang_nam, ngay_thanh_toan
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [
      ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai || 'chưa thanh toán',
      chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi,
      tien_dien, tien_nuoc, tien_phong, thang_nam, ngay_thanh_toan
    ]
  );

  return result.rows[0];
};

// Cập nhật hóa đơn
HoaDon.updateHoaDon = async (id, data) => {
  const {
    ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai,
    chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi,
    tien_dien, tien_nuoc, tien_phong, thang_nam, ngay_thanh_toan
  } = data;

  const result = await pool.query(
    `UPDATE hoa_don SET
      ma_phong=$1, tong_tien=$2, so_dien=$3, so_nuoc=$4, han_dong_tien=$5, trang_thai=$6,
      chi_so_dien_cu=$7, chi_so_dien_moi=$8, chi_so_nuoc_cu=$9, chi_so_nuoc_moi=$10,
      tien_dien=$11, tien_nuoc=$12, tien_phong=$13, thang_nam=$14, ngay_thanh_toan=$15
    WHERE ma_hoa_don=$16 RETURNING *`,
    [
      ma_phong, tong_tien, so_dien, so_nuoc, han_dong_tien, trang_thai,
      chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi,
      tien_dien, tien_nuoc, tien_phong, thang_nam, ngay_thanh_toan, id
    ]
  );

  return result.rows[0];
};

// Cập nhật trạng thái hóa đơn
HoaDon.updateHoaDonStatus = async (id, trang_thai) => {
  const isPaid = trang_thai.trim().toLowerCase() === 'đã thanh toán';
  const query = isPaid
    ? `UPDATE hoa_don SET trang_thai=$1, ngay_thanh_toan=CURRENT_DATE WHERE ma_hoa_don=$2 RETURNING *`
    : `UPDATE hoa_don SET trang_thai=$1 WHERE ma_hoa_don=$2 RETURNING *`;

  const result = await pool.query(query, [trang_thai, id]);
  return result.rows[0];
};

// Yêu cầu gia hạn hóa đơn
HoaDon.requestExtension = async (id, ngay_gia_han) => {
  const query = `
    UPDATE hoa_don
    SET ngay_gia_han=$1, da_duyet_gia_han=false, ngay_cap_nhat_gia_han=CURRENT_TIMESTAMP
    WHERE ma_hoa_don=$2 RETURNING *`;
  const result = await pool.query(query, [ngay_gia_han, id]);
  return result.rows[0];
};

// Duyệt gia hạn
HoaDon.approveExtension = async (id) => {
  const invoice = await HoaDon.getHoaDonById(id);
  if (!invoice) throw new Error('Không tìm thấy hóa đơn');

  const so_ngay_gia_han = Math.ceil((new Date(invoice.ngay_gia_han) - new Date(invoice.han_dong_tien)) / (1000 * 60 * 60 * 24));
  const tien_lai = invoice.tong_tien * EXTENSION_INTEREST_RATE * so_ngay_gia_han;
  const tong_tien_moi = invoice.tong_tien + tien_lai;

  const result = await pool.query(
    `UPDATE hoa_don SET da_duyet_gia_han=true, han_dong_tien=ngay_gia_han, tong_tien=$1,
      tien_lai_gia_han=$2, so_ngay_gia_han=$3 WHERE ma_hoa_don=$4 RETURNING *`,
    [tong_tien_moi, tien_lai, so_ngay_gia_han, id]
  );

  return result.rows[0];
};

// Xóa hóa đơn
HoaDon.deleteHoaDon = async (id) => {
  // Xoá thông báo liên quan
  await pool.query('DELETE FROM thong_bao_hoa_don WHERE ma_hoa_don = $1', [id]);
  // Xoá gia hạn liên quan
  await pool.query('DELETE FROM gia_han WHERE ma_hoa_don = $1', [id]);
  // Xoá hoá đơn
  const result = await pool.query('DELETE FROM hoa_don WHERE ma_hoa_don = $1 RETURNING *', [id]);
  return result.rows[0];
};

// Thống kê hóa đơn theo tháng
HoaDon.getMonthlyStats = async (year, month) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total_invoices, SUM(tong_tien) AS total_amount,
    SUM(CASE WHEN trang_thai='đã thanh toán' THEN 1 ELSE 0 END) AS paid_invoices,
    SUM(CASE WHEN trang_thai='chưa thanh toán' THEN 1 ELSE 0 END) AS unpaid_invoices
    FROM hoa_don WHERE EXTRACT(YEAR FROM thang_nam)=$1 AND EXTRACT(MONTH FROM thang_nam)=$2`,
    [year, month]
  );
  return result.rows[0];
};

// Thống kê chi tiết
HoaDon.getDetailedMonthlyStats = async (year, month) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total_invoices, SUM(tong_tien) AS total_amount, SUM(tien_dien) AS total_electric,
    SUM(tien_nuoc) AS total_water, SUM(tien_phong) AS total_room, SUM(so_dien) AS total_electric_consumed,
    SUM(so_nuoc) AS total_water_consumed,
    SUM(CASE WHEN trang_thai='đã thanh toán' THEN 1 ELSE 0 END) AS paid_invoices,
    SUM(CASE WHEN trang_thai='chưa thanh toán' THEN 1 ELSE 0 END) AS unpaid_invoices
    FROM hoa_don WHERE EXTRACT(YEAR FROM thang_nam)=$1 AND EXTRACT(MONTH FROM thang_nam)=$2`,
    [year, month]
  );
  return result.rows[0];
};

// Kiểm tra hóa đơn theo tháng
HoaDon.checkExistInvoiceInMonth = async (ma_phong, month, year) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS invoice_count FROM hoa_don WHERE ma_phong=$1 AND EXTRACT(MONTH FROM thang_nam)=$2 AND EXTRACT(YEAR FROM thang_nam)=$3`,
    [ma_phong, month, year]
  );
  return parseInt(result.rows[0].invoice_count, 10) > 0;
};

// Kiểm tra đã gia hạn chưa
HoaDon.checkExtensionInMonth = async (id) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS extension_count FROM hoa_don WHERE ma_hoa_don=$1 AND ngay_gia_han IS NOT NULL
     AND EXTRACT(MONTH FROM ngay_cap_nhat_gia_han)=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM ngay_cap_nhat_gia_han)=EXTRACT(YEAR FROM CURRENT_DATE)`,
    [id]
  );
  return parseInt(result.rows[0].extension_count, 10) > 0;
};

HoaDon.getLatestChiSoMoiByPhongId = async (ma_phong) => {
  const result = await pool.query(
    `SELECT chi_so_dien_moi, chi_so_nuoc_moi
     FROM hoa_don
     WHERE ma_phong = $1
     ORDER BY thang_nam DESC, ma_hoa_don DESC
     LIMIT 1`,
    [ma_phong]
  );
  return result.rows[0] || null;
};

module.exports = HoaDon;

