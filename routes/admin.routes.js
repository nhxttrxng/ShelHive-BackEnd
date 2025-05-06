const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const admin = require('../controllers/admin.controller');

// Lấy tất cả Admin
router.get('/', admin.getAll);

// Tạo Admin mới
router.post('/', admin.create);

// Lấy thông tin Admin theo email
router.get('/:email', admin.getAdminByEmail);

// Cập nhật Admin
router.put('/:email', admin.update);

// Xóa Admin
router.delete('/:email', admin.remove);

router.post('/upload-avt/:email', upload.single('image'), admin.uploadAvatar);

module.exports = router;
