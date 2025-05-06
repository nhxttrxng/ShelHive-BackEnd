const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const user = require('../controllers/user.controller');

// Lấy tất cả người dùng
router.get('/', user.getAll);

// Tạo người dùng mới
router.post('/', user.create);

// Cập nhật người dùng
router.put('/:email', user.update);

// Xóa người dùng
router.delete('/:email', user.remove);

// Lấy thông tin người dùng theo email
router.get('/:email', user.getUserByEmail);

router.get('/phong/:email', user.getFullInfoByEmail);

router.post('/upload-avt/:email', upload.single('image'), user.uploadAvatar);

module.exports = router;
