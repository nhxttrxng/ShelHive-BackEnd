const express = require('express');
const router = express.Router();
const room = require('../controllers/room.controller');

// Lấy danh sách tất cả phòng
router.get('/', room.getAll);

// Lấy thông tin phòng theo mã phòng
router.get('/:ma_phong', room.getByMaPhong);

// Lấy danh sách phòng theo mã dãy
router.get('/day/:ma_day', room.getByMaDay);

// Tạo phòng mới
router.post('/', room.create);

// Cập nhật thông tin phòng
router.put('/:ma_phong', room.update);

// Xoá phòng
router.delete('/:ma_phong', room.delete);

module.exports = router;
