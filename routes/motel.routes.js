const express = require('express');
const router = express.Router();
const motel = require('../controllers/motel.controller');

// CRUD Routes for Day Tro
router.post('/', motel.create);
router.get('/', motel.getAll);
router.get('/:email_admin', motel.getByEmailAdmin);
router.put('/:ma_day', motel.update);
router.delete('/:ma_day', motel.delete);
router.get('/day/:ma_day', motel.getByMaDay);

module.exports = router;
