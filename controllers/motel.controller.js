const DayTro = require('../models/daytro.model');
const Phong = require('../models/phong.model');

// CREATE DayTro + auto CREATE Phong
exports.create = async (req, res) => {
  const { email_admin, ten_tro, dia_chi, so_phong, gia_dien, gia_nuoc } = req.body;

  if (!email_admin || !ten_tro || !dia_chi || !so_phong || !gia_dien || !gia_nuoc) {
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Tạo dãy trọ (sử dụng client)
    const insertDayTroQuery = `
      INSERT INTO day_tro(email_admin, ten_tro, dia_chi, so_phong, gia_dien, gia_nuoc)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING ma_day;
    `;
    const newDayTroResult = await client.query(insertDayTroQuery, [
      email_admin, ten_tro, dia_chi, so_phong, gia_dien, gia_nuoc
    ]);
    const ma_day = newDayTroResult.rows[0].ma_day;

    // 2. Tạo các phòng
    for (let i = 1; i <= so_phong; i++) {
      // Ví dụ: mã phòng = ma_day * 1000 + stt (vd: ma_day=11, phòng 1: 11001)
      // Đảm bảo mã phòng luôn unique, có thể thay logic sinh mã phù hợp thực tế.
      const maPhong = parseInt(ma_day) * 1000 + i;

      const insertPhongQuery = `
        INSERT INTO phong(ma_phong, ma_day)
        VALUES ($1, $2)
      `;
      await client.query(insertPhongQuery, [maPhong, ma_day]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Tạo dãy trọ và các phòng thành công',
      ma_day: ma_day
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi tạo dãy trọ và phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  } finally {
    client.release();
  }
};


// GET ALL
exports.getAll = async (req, res) => {
  try {
    const dayTroList = await DayTro.getAllDayTro();
    res.status(200).json(dayTroList);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phòng trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET BY email_admin
exports.getByEmailAdmin = async (req, res) => {
  const email_admin = req.params.email_admin;

  if (!email_admin) {
    return res.status(400).json({ message: 'Thiếu email admin' });
  }

  try {
    const dayTro = await DayTro.getDayTroByEmailAdmin(email_admin);

    if (dayTro.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng trọ cho admin này' });
    }

    res.status(200).json(dayTro);
  } catch (err) {
    console.error('Lỗi khi lấy phòng trọ theo email admin:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const ma_day = req.params.ma_day;
  const updatedData = req.body;

  if (!ma_day) return res.status(400).json({ message: 'Thiếu mã dãy trọ' });

  try {
    const result = await DayTro.updateDayTro(ma_day, updatedData);

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy dãy trọ để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật thành công', result });
  } catch (err) {
    console.error('Lỗi khi cập nhật dãy trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  const ma_day = req.params.ma_day;

  if (!ma_day) return res.status(400).json({ message: 'Thiếu mã dãy trọ' });

  try {
    const result = await DayTro.deleteDayTro(ma_day);

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy dãy trọ để xóa' });
    }

    res.status(200).json({ message: 'Xóa dãy trọ thành công', result });
  } catch (err) {
    console.error('Lỗi khi xóa dãy trọ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
