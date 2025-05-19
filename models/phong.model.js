const pool = require('../db/postgres');

// CREATE
async function createPhong(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lấy danh sách mã phòng hiện tại của dãy
    const ma_day = data.ma_day;
    const result = await client.query(
      "SELECT ma_phong FROM phong WHERE ma_day = $1 ORDER BY ma_phong ASC",
      [ma_day]
    );
    const existingRooms = result.rows.map(row => row.ma_phong);

    // 2. Tìm số thứ tự nhỏ nhất còn thiếu, nếu không thiếu thì lấy số lớn nhất + 1
    let nextIndex = 1;
    let usedIndexes = new Set(
      existingRooms.map(mp => parseInt(mp.slice(-3))) // Lấy 3 số cuối
    );
    while (usedIndexes.has(nextIndex)) {
      nextIndex++;
    }

    // 3. Tạo mã phòng mới: 2 chữ số mã dãy + 3 số thứ tự phòng
    const ma_phong = `${ma_day.toString().padStart(2, '0')}${nextIndex.toString().padStart(3, '0')}`;

    const insertQuery = `
      INSERT INTO phong (ma_phong, ma_day, email_user, da_thue, ngay_bat_dau, ngay_ket_thuc, gia_thue)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      ma_phong,
      ma_day,
      data.email_user || null,
      !!data.email_user, // da_thue = true nếu có email_user, ngược lại false
      data.ngay_bat_dau || null,
      data.ngay_ket_thuc || null,
      data.gia_thue || null
    ];

    const res = await client.query(insertQuery, values);

    // 4. Cập nhật số phòng trong bảng day_tro
    await client.query(
      `UPDATE day_tro SET so_phong = so_phong + 1 WHERE ma_day = $1`,
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
  // Nếu FE truyền email_user thì tự động cập nhật da_thue theo email_user
  if ('email_user' in updatedData) {
    updatedData.da_thue = !!updatedData.email_user;
  }

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

    // Lấy ma_day trước khi xoá phòng
    const maDayRes = await client.query(`SELECT ma_day FROM phong WHERE ma_phong = $1`, [ma_phong]);
    const ma_day = maDayRes.rows[0]?.ma_day;
    if (!ma_day) throw new Error("Không tìm thấy mã dãy của phòng cần xoá");

    // Xoá các phản ánh liên quan tới phòng
    await client.query(`DELETE FROM phan_anh WHERE ma_phong = $1`, [ma_phong]);

    // Lấy danh sách các hóa đơn cần xoá để xử lý các bảng phụ thuộc
    const hoaDonRes = await client.query(`SELECT ma_hoa_don FROM hoa_don WHERE ma_phong = $1`, [ma_phong]);
    const maHoaDons = hoaDonRes.rows.map(row => row.ma_hoa_don);

    for (const ma_hoa_don of maHoaDons) {
      await client.query(`DELETE FROM gia_han WHERE ma_hoa_don = $1`, [ma_hoa_don]);
      await client.query(`DELETE FROM thong_bao_hoa_don WHERE ma_hoa_don = $1`, [ma_hoa_don]);
    }

    // Xoá hóa đơn của phòng
    await client.query(`DELETE FROM hoa_don WHERE ma_phong = $1`, [ma_phong]);

    // Xoá phòng
    const res = await client.query(`DELETE FROM phong WHERE ma_phong = $1 RETURNING *`, [ma_phong]);

    // Cập nhật lại số phòng trong dãy
    await client.query(`UPDATE day_tro SET so_phong = so_phong - 1 WHERE ma_day = $1`, [ma_day]);

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

module.exports = {
  createPhong,
  getAllPhong,
  getPhongByMaDay,
  getPhongByMaPhong,
  updatePhong,
  deletePhong,
  getUserInPhong,
  getPhongByEmailUser
};
