const express = require('express');
const router = express.Router();
const PhanAnhController = require('../controllers/report.controller');

// GET /phan-anh/tinh-trang/:tinh_trang
router.get('/:tinh_trang/:ma_day', PhanAnhController.getByTinhTrang);

// POST /phan-anh
router.post('/', PhanAnhController.create);

// PUT /phan-anh/:ma_phan_anh
router.put('/:ma_phan_anh', PhanAnhController.updateTinhTrang);

router.get('/', PhanAnhController.getAll);

router.get('/day/:ma_day', PhanAnhController.getByMaDay);

module.exports = router;
