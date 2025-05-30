const pool = require('../db/postgres');

const PhanAnh = {
 async getByTinhTrang(tinh_trang, ma_day) {
  const query = `
    SELECT pa.*, p.ma_day
    FROM phan_anh pa
    JOIN phong p ON pa.ma_phong = p.ma_phong
    WHERE pa.tinh_trang = $1 AND p.ma_day = $2
  `;
  const { rows } = await pool.query(query, [tinh_trang, ma_day]);
  return rows;
},

 async create({ma_phong, tieu_de, loai_su_co, noi_dung}) {
     const query = `INSERT INTO phan_anh (ma_phong, tieu_de, loai_su_co, noi_dung, tinh_trang) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
     const { rows } = await pool.query(query, [ma_phong, tieu_de, loai_su_co, noi_dung, 'chưa xử lí']);
     return rows[0];
 },
  async updateTinhTrang(ma_phan_anh, tinh_trang) {
    const query = 'UPDATE phan_anh SET tinh_trang = $1 WHERE ma_phan_anh = $2 RETURNING *';
    const { rows } = await pool.query(query, [tinh_trang, ma_phan_anh]);
    return rows[0];
  }, 
async getAll() {
  const query = 'SELECT * FROM phan_anh';
  const { rows } = await pool.query(query);  // không truyền tham số
  return rows;
},
async getByMaDay(ma_day) {
    const query = 'SELECT * FROM phan_anh WHERE ma_phong IN (SELECT ma_phong FROM phong WHERE ma_day = $1);';
    const { rows } = await pool.query(query, [ma_day]);
    return rows;
  }
};

module.exports = PhanAnh;
