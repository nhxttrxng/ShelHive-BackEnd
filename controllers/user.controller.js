const User = require('../models/user.model');
const Phong = require('../models/phong.model');
const DayTro = require('../models/daytro.model');
const bcrypt = require('bcrypt');

// Lấy tất cả người dùng
exports.getAll = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo người dùng mới
exports.create = async (req, res) => {
  const { email, ho_ten, sdt, mat_khau } = req.body;

  if (!email || !ho_ten || !sdt || !mat_khau)
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });

  try {
    const existingUser = await User.getUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: 'Email đã tồn tại' });

    const hash = await bcrypt.hash(mat_khau, 10); // 🔐 Băm mật khẩu

    await User.addUser({
      email,
      ho_ten,
      sdt,
      mat_khau: hash,
      avt: '/uploads/default-avatar.png', // 🖼️ Gán avt mặc định
      is_verified: false
    });

    res.status(201).json({ message: 'Tạo người dùng thành công' });
  } catch (err) {
    console.error('Lỗi khi tạo người dùng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật người dùng
exports.update = async (req, res) => {
  const email = req.params.email;
  const data = req.body;

  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const updatedUser = await User.updateUser(email, data);

    if (!updatedUser)
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });

    res.status(200).json({ message: 'Cập nhật người dùng thành công', user: updatedUser });
  } catch (err) {
    console.error('Lỗi khi cập nhật người dùng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa người dùng
exports.remove = async (req, res) => {
  const email = req.params.email;

  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const result = await User.deleteUser(email);

    if (result.rowCount === 0)  // Cũng thay đổi `changes` thành `rowCount` khi dùng PostgreSQL
      return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa' });

    res.status(200).json({ message: 'Xóa người dùng thành công', result });
  } catch (err) {
    console.error('Lỗi khi xóa người dùng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy thông tin user theo email
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const user = await User.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy thông tin đầy đủ (họ tên, mã phòng, tên trọ, địa chỉ) theo email
exports.getFullInfoByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: 'Thiếu email' });
  }

  try {
    // Lấy thông tin user
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Khởi tạo kết quả trả về
    const result = {
      ho_ten: user.ho_ten,
      avt: user.avt,
      ma_phong: null,
      ten_tro: null,
      dia_chi: null
    };

    // Lấy thông tin phòng nếu có
    const phong = await Phong.getPhongByEmailUser(email);
    if (phong) {
      result.ma_phong = phong.ma_phong;

      // Lấy thông tin nhà trọ nếu có
      const dayTro = await DayTro.getDayTroByMaDay(phong.ma_day);
      if (dayTro) {
        result.ten_tro = dayTro.ten_tro;
        result.dia_chi = dayTro.dia_chi;
      }
    }

    // Trả về kết quả thông tin đầy đủ
    res.status(200).json(result);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin đầy đủ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  const email = req.params.email;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Không có file nào được tải lên' });

  const filePath = `/uploads/${file.filename}`;
  try {
    await User.updateAvatar(email, filePath);
    res.status(200).json({ message: 'Cập nhật ảnh đại diện thành công', path: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cơ sở dữ liệu' });
  }
};
