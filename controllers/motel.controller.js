const DayTro = require('../models/daytro.model');
const Phong = require('../models/phong.model');

// CREATE DayTro + auto CREATE Phong
exports.create = async (req, res) => {
  const { email_admin, ten_tro, dia_chi, so_phong, gia_dien, gia_nuoc } = req.body;

  if (!email_admin || !ten_tro || !dia_chi || !so_phong || !gia_dien || !gia_nuoc) {
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
  }

  try {
    // 1. Tạo dãy trọ
    const newDayTro = await DayTro.createDayTro({
      email_admin,
      ten_tro,
      dia_chi,
      so_phong,
      gia_dien,
      gia_nuoc
    });

    const ma_day = newDayTro.ma_day;

    // 2. Tạo phòng cho dãy trọ
    const phongPromises = [];
    for (let i = 1; i <= so_phong; i++) {
      const maPhong = ma_day.toString().padStart(4, '0') + i.toString().padStart(3, '0');

      const phongData = {
        ma_phong: maPhong,
        ma_day: ma_day,
        // các field còn lại lấy mặc định trong createPhong
      };

      phongPromises.push(Phong.createPhong(phongData));
    }

    const createdPhongs = await Promise.all(phongPromises);

    res.status(201).json({
      message: 'Tạo dãy trọ và các phòng thành công',
      newDayTro,
      createdPhongs
    });
  } catch (err) {
    console.error('Lỗi khi tạo dãy trọ và phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
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
