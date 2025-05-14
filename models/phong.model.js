const pool = require('../db/postgres');

// CREATE
async function createPhong(data) {
  const query = `
    INSERT INTO phong (ma_phong, ma_day, email_user, trang_thai_phong, ngay_bat_dau, ngay_ket_thuc, gia_thue)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [
    data.ma_phong,
    data.ma_day,
    data.email_user || null,
    data.trang_thai_phong || 'Trống',
    data.ngay_bat_dau || null,
    data.ngay_ket_thuc || null,
    data.gia_thue || null
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// GET ALL
async function getAllPhong() {
  const res = await pool.query(`SELECT * FROM phong`);
  return res.rows;
}

// GET BY ma_day
async function getPhongByMaDay(ma_day) {
  const res = await pool.query(`SELECT * FROM phong WHERE ma_day = $1`, [ma_day]);
  return res.rows;
}

// GET BY ma_phong
async function getPhongByMaPhong(ma_phong) {
  const res = await pool.query(`SELECT * FROM phong WHERE ma_phong = $1`, [ma_phong]);
  return res.rows[0];
}

// GET BY email_user
async function getPhongByEmailUser(email_user) {
  const res = await pool.query(`SELECT * FROM phong WHERE email_user = $1`, [email_user]);
  return res.rows[0];
}

// UPDATE
async function updatePhong(ma_phong, updatedData) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in updatedData) {
    fields.push(`${key} = $${i++}`);
    values.push(updatedData[key]);
  }

  values.push(ma_phong);
  const query = `
    UPDATE phong SET ${fields.join(', ')}
    WHERE ma_phong = $${i}
    RETURNING *
  `;
  const res = await pool.query(query, values);
  return res.rows[0];
}

// DELETE
async function deletePhong(ma_phong) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Xoá các phản ánh liên quan tới phòng
    await client.query(`DELETE FROM phan_anh WHERE ma_phong = $1`, [ma_phong]);

    // Xoá thành viên liên quan đến phòng
    await client.query(`DELETE FROM thanh_vien WHERE ma_phong = $1`, [ma_phong]);

    // Lấy danh sách các hóa đơn cần xoá để xử lý các bảng phụ thuộc
    const hoaDonRes = await client.query(`SELECT ma_hoa_don FROM hoa_don WHERE ma_phong = $1`, [ma_phong]);
    const maHoaDons = hoaDonRes.rows.map(row => row.ma_hoa_don);

    for (const ma_hoa_don of maHoaDons) {
      // Xoá gia hạn hóa đơn liên quan
      await client.query(`DELETE FROM gia_han WHERE ma_hoa_don = $1`, [ma_hoa_don]);

      // Xoá thông báo hóa đơn liên quan
      await client.query(`DELETE FROM thong_bao_hoa_don WHERE ma_hoa_don = $1`, [ma_hoa_don]);
    }

    // Xoá hóa đơn của phòng
    await client.query(`DELETE FROM hoa_don WHERE ma_phong = $1`, [ma_phong]);

    // Xoá phòng
    const res = await client.query(`DELETE FROM phong WHERE ma_phong = $1 RETURNING *`, [ma_phong]);

    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Lấy thông tin user đứng tên phòng
async function getUserInPhong(ma_phong) {
  const query = `
    SELECT "USER".email, "USER".ho_ten, "USER".dia_chi, "USER".gioi_tinh, "USER".que_quan,
           "USER".ngay_sinh, "USER".sdt, "USER".cccd
    FROM phong
    JOIN "USER" ON phong.email_user = "USER".email
    WHERE phong.ma_phong = $1
  `;
  const res = await pool.query(query, [ma_phong]);
  return res.rows[0];
}

// Lấy danh sách thành viên trong phòng
async function getThanhVienTrongPhong(ma_phong) {
  const query = `
    SELECT id, ho_ten, gioi_tinh, sdt, cccd, ngay_sinh, que_quan, dia_chi
    FROM thanh_vien
    WHERE ma_phong = $1
  `;
  const res = await pool.query(query, [ma_phong]);
  return res.rows;
}

module.exports = {
  createPhong,
  getAllPhong,
  getPhongByMaDay,
  getPhongByMaPhong,
  updatePhong,
  deletePhong,
  getUserInPhong,
  getThanhVienTrongPhong,
  getPhongByEmailUser
};
