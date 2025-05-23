const PhanAnh = require('../models/phananh.model');

const PhanAnhController = {
  async getByTinhTrang(req, res) {
    try {
      const { tinh_trang } = req.params;
      const data = await PhanAnh.getByTinhTrang(tinh_trang);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  async getAll(req, res) {
    try {
      const data = await PhanAnh.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách phản ánh', error });
    }
  },
  async create(req, res) {
    try {
      const { ma_phong, tieu_de, loai_su_co, noi_dung } = req.body;
      if (!ma_phong || !tieu_de || !loai_su_co || !noi_dung) {
        return res.status(400).json({ error: 'Thiếu thông tin phản ánh' });
      }

      const newPhanAnh = await PhanAnh.create({ ma_phong, tieu_de, loai_su_co, noi_dung });
      res.status(201).json(newPhanAnh);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updateTinhTrang(req, res) {
    try {
      const { ma_phan_anh } = req.params;
      const { tinh_trang } = req.body;

      if (!tinh_trang) {
        return res.status(400).json({ error: 'Thiếu tình trạng cập nhật' });
      }

      const updatedPhanAnh = await PhanAnh.updateTinhTrang(ma_phan_anh, tinh_trang);
      if (!updatedPhanAnh) {
        return res.status(404).json({ error: 'Phản ánh không tồn tại' });
      }

      res.json(updatedPhanAnh);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }, 
  async getByMaDay(req, res) {
    try {
      const { ma_day } = req.query;

      if (!ma_day) {
        return res.status(400).json({ error: 'Thiếu tham số ma_day' });
      }

      const data = await PhanAnh.getbymaday(ma_day);
      res.json(data);
    } catch (err) {
      console.error('Lỗi khi lấy phản ánh chưa xử lý theo mã dãy:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  },
};

module.exports = PhanAnhController;
