const pool = require('../db/postgres');

// CREATE
async function createDayTro(data) {
  const query = `
    INSERT INTO day_tro (email_admin, ten_tro, dia_chi, so_phong, gia_dien, gia_nuoc)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    data.email_admin,
    data.ten_tro,
    data.dia_chi,
    data.so_phong,
    data.gia_dien,
    data.gia_nuoc
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// GET ALL
async function getAllDayTro() {
  const res = await pool.query(`SELECT * FROM day_tro`);
  return res.rows;
}

// GET BY email_admin
async function getDayTroByEmailAdmin(email_admin) {
  const query = `SELECT * FROM day_tro WHERE email_admin = $1`;
  const res = await pool.query(query, [email_admin]);
  return res.rows;
}

// GET BY ma_day
async function getDayTroByMaDay(ma_day) {
  const query = `SELECT * FROM day_tro WHERE ma_day = $1`;
  const res = await pool.query(query, [ma_day]);
  return res.rows[0];
}

// UPDATE linh hoạt
async function updateDayTro(ma_day, updatedData) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in updatedData) {
    fields.push(`${key} = $${i++}`);
    values.push(updatedData[key]);
  }

  values.push(ma_day);
  const query = `
    UPDATE day_tro SET ${fields.join(', ')}
    WHERE ma_day = $${i}
    RETURNING *
  `;
  const res = await pool.query(query, values);
  return res.rows[0];
}

// DELETE
async function deleteDayTro(ma_day) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Xoá thông báo theo mã dãy
    await client.query(`DELETE FROM thong_bao WHERE ma_day = $1`, [ma_day]);

    // Lấy tất cả mã phòng thuộc dãy trọ
    const phongRes = await client.query(
      `SELECT ma_phong FROM phong WHERE ma_day = $1`,
      [ma_day]
    );
    const maPhongs = phongRes.rows.map(row => row.ma_phong);

    // Với mỗi phòng, xóa toàn bộ dữ liệu liên quan
    for (const ma_phong of maPhongs) {
      // Xoá phản ánh
      await client.query(`DELETE FROM phan_anh WHERE ma_phong = $1`, [ma_phong]);

      // Xoá thành viên
      await client.query(`DELETE FROM thanh_vien WHERE ma_phong = $1`, [ma_phong]);

      // Lấy hoá đơn của phòng
      const hoaDonRes = await client.query(
        `SELECT ma_hoa_don FROM hoa_don WHERE ma_phong = $1`,
        [ma_phong]
      );
      const maHoaDons = hoaDonRes.rows.map(row => row.ma_hoa_don);

      for (const ma_hoa_don of maHoaDons) {
        // Xoá gia hạn hoá đơn
        await client.query(`DELETE FROM gia_han_hoa_don WHERE ma_hoa_don = $1`, [ma_hoa_don]);

        // Xoá thông báo hoá đơn
        await client.query(`DELETE FROM thong_bao_hoa_don WHERE ma_hoa_don = $1`, [ma_hoa_don]);
      }

      // Xoá hoá đơn
      await client.query(`DELETE FROM hoa_don WHERE ma_phong = $1`, [ma_phong]);

      // Xoá phòng
      await client.query(`DELETE FROM phong WHERE ma_phong = $1`, [ma_phong]);
    }

    // Xoá dãy trọ
    const res = await client.query(
      `DELETE FROM day_tro WHERE ma_day = $1 RETURNING *`,
      [ma_day]
    );

    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createDayTro,
  getAllDayTro,
  getDayTroByEmailAdmin,
  updateDayTro,
  deleteDayTro,
  getDayTroByMaDay
};
