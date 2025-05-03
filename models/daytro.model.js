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
  const query = `DELETE FROM day_tro WHERE ma_day = $1 RETURNING *`;
  const res = await pool.query(query, [ma_day]);
  return res.rows[0];
}

module.exports = {
  createDayTro,
  getAllDayTro,
  getDayTroByEmailAdmin,
  updateDayTro,
  deleteDayTro,
  getDayTroByMaDay
};
