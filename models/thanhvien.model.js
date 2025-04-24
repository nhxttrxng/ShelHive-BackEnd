const pool = require('../db/postgres');

// CREATE - Thêm thành viên mới
async function createThanhVien(data) {
  const query = `
    INSERT INTO thanh_vien (ho_ten, gioi_tinh, sdt, cccd, ngay_sinh, que_quan, dia_chi, ma_phong)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [
    data.ho_ten,
    data.gioi_tinh,
    data.sdt,
    data.cccd,
    data.ngay_sinh,
    data.que_quan,
    data.dia_chi,
    data.ma_phong
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// GET - Lấy tất cả thành viên trong 1 phòng
async function getThanhVienByMaPhong(ma_phong) {
  const query = `
    SELECT * FROM thanh_vien
    WHERE ma_phong = $1
  `;
  const res = await pool.query(query, [ma_phong]);
  return res.rows;
}

// GET - Lấy thành viên theo ID
async function getThanhVienById(id) {
  const query = `
    SELECT * FROM thanh_vien
    WHERE id = $1
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

// UPDATE - Cập nhật thành viên
async function updateThanhVien(id, updatedData) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in updatedData) {
    fields.push(`${key} = $${i++}`);
    values.push(updatedData[key]);
  }

  values.push(id);
  const query = `
    UPDATE thanh_vien SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING *
  `;
  const res = await pool.query(query, values);
  return res.rows[0];
}

// DELETE - Xoá thành viên
async function deleteThanhVien(id) {
  const query = `
    DELETE FROM thanh_vien
    WHERE id = $1
    RETURNING *
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

module.exports = {
  createThanhVien,
  getThanhVienByMaPhong,
  getThanhVienById,
  updateThanhVien,
  deleteThanhVien
};