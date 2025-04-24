const Admin = require('../models/admin.model');

// Lấy tất cả Admin
exports.getAll = async (req, res) => {
  try {
    const admins = await Admin.getAllAdmins();
    res.status(200).json({ admins });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách Admin:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo Admin mới
exports.create = async (req, res) => {
  const { email, ho_ten, sdt, mat_khau, avt } = req.body;

  if (!email || !ho_ten || !sdt || !mat_khau || !avt)
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });

  try {
    const existingAdmin = await Admin.getAdminByEmail(email);
    if (existingAdmin)
      return res.status(409).json({ message: 'Email đã tồn tại' });

    await Admin.addAdmin({ email, ho_ten, sdt, mat_khau, avt });
    res.status(201).json({ message: 'Tạo Admin thành công' });
  } catch (err) {
    console.error('Lỗi khi tạo Admin:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật Admin
exports.update = async (req, res) => {
  const email = req.params.email;
  const data = req.body;

  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const result = await Admin.updateAdmin(email, data);

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy Admin để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật Admin thành công', result });
  } catch (err) {
    console.error('Lỗi khi cập nhật Admin:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa Admin
exports.remove = async (req, res) => {
  const email = req.params.email;

  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const result = await Admin.deleteAdmin(email);

    if (result.rowCount === 0)  // Cũng đổi `changes` thành `rowCount` cho PostgreSQL
      return res.status(404).json({ message: 'Không tìm thấy Admin để xóa' });

    res.status(200).json({ message: 'Xóa Admin thành công', result });
  } catch (err) {
    console.error('Lỗi khi xóa Admin:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy thông tin Admin theo email
exports.getAdminByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    const admin = await Admin.getAdminByEmail(email);
    if (!admin) return res.status(404).json({ message: 'Không tìm thấy Admin' });

    res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
