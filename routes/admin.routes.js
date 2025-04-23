const express = require('express');
const router = express.Router();
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

module.exports = router;
