const PhongModel = require('../models/phong.model');
const UserModel = require('../models/user.model');

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const rooms = await PhongModel.getAllPhong();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng' });
  }
};

// GET BY ma_phong
exports.getByMaPhong = async (req, res) => {
  try {
    const room = await PhongModel.getPhongByMaPhong(req.params.ma_phong);
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });

    const user = await PhongModel.getUserInPhong(req.params.ma_phong);
    res.json({ room, user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin phòng' });
  }
};

// GET BY ma_day
exports.getByMaDay = async (req, res) => {
  try {
    const rooms = await PhongModel.getPhongByMaDay(req.params.ma_day);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng theo mã dãy' });
  }
};

//CREATE
exports.create = async (req, res) => {
  try {
    const data = req.body;

    // Nếu có email_user thì phải check user tồn tại
    if (data.email_user) {
      const user = await UserModel.getUserByEmail(data.email_user);
      if (!user) {
        return res.status(400).json({ error: 'Email người dùng không tồn tại' });
      }
      // Kiểm tra user đã thuê phòng nào chưa
      const phongDangO = await PhongModel.getPhongByEmailUser(data.email_user);
      if (phongDangO) {
        return res.status(409).json({ error: 'Người dùng này đã thuê một phòng khác rồi!' });
      }
    }

    // Không cho FE truyền ma_phong
    if (data.ma_phong) delete data.ma_phong;

    const newRoom = await PhongModel.createPhong(data);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi khi tạo phòng' });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const ma_phong = req.params.ma_phong;
    const data = req.body;

    if (data.email_user) {
      const user = await UserModel.getUserByEmail(data.email_user);
      if (!user) {
        return res.status(400).json({ error: 'Email người dùng không tồn tại' });
      }

      // Kiểm tra user này đã ở phòng nào khác chưa (không phải phòng đang sửa)
      const phongDangO = await PhongModel.getPhongByEmailUser(data.email_user);
      if (phongDangO && phongDangO.ma_phong != ma_phong) {
        return res.status(409).json({ error: 'Người dùng này đã thuê một phòng khác rồi!' });
      }
    }

    const updatedRoom = await PhongModel.updatePhong(ma_phong, data);
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật phòng' });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const deletedRoom = await PhongModel.deletePhong(req.params.ma_phong);
    if (!deletedRoom) return res.status(404).json({ error: 'Không tìm thấy phòng để xoá' });

    res.json(deletedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xoá phòng' });
  }
};
