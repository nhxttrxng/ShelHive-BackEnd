const User = require('../models/user.model');

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

    await User.addUser({ email, ho_ten, sdt, mat_khau });
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
    const result = await User.updateUser(email, data);

    if (result.changes === 0)
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });

    res.status(200).json({ message: 'Cập nhật người dùng thành công', result });
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

    if (result.changes === 0)
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
