const Notification = require('../models/thongbao.model');

                      // Lấy tất cả thông báo
                      exports.getAll = async (req, res) => {
                        try {
                          const notifications = await Notification.getAll();
                          res.status(200).json(notifications);
                        } catch (err) {
                          console.error('Lỗi getAll:', err);
                          res.status(500).json({ message: 'Lỗi server', error: err.message });
                        }
                      };

                      // Lấy thông báo theo mã dãy
                      exports.getByMaDay = async (req, res) => {
                        const { ma_day } = req.params;
                        try {
                          const notifications = await Notification.getByMaDay(ma_day);
                          res.status(200).json({ notifications });
                        } catch (err) {
                          console.error('Lỗi khi lấy thông báo theo mã dãy:', err);
                          res.status(500).json({ message: 'Lỗi server', error: err.message });
                        }
                      };


                      // Lấy thông báo theo user_id
                      exports.getByUserId = async (req, res) => {
                        const { user_id } = req.params;
                        try {
                          const notifications = await Notification.getByUserId(user_id);
                          res.status(200).json(notifications);
                        } catch (err) {
                          console.error('Lỗi getByUserId:', err);
                          res.status(500).json({ message: 'Lỗi server', error: err.message });
                        }
                      };

                      // Tạo mới thông báo
                      exports.create = async (req, res) => {
                        const { ma_day, ma_phong, noi_dung, loai_thong_bao } = req.body;
                        if (!noi_dung )
                          return res.status(400).json({ message: 'Vui lòng điền đầy đủ nội dung ' });

                        try {
                          const notification = await Notification.create({ ma_day, ma_phong, noi_dung});
                          res.status(201).json({ message: 'Tạo thông báo thành công', notification });
                        } catch (err) {
                          console.error('Lỗi create:', err);
                          res.status(500).json({ message: 'Lỗi server', error: err.message });
                        }
                      };

             // Cập nhật thông báo
             exports.update = async (req, res) => {
               const id = req.params.id;
               const { noi_dung } = req.body;

               if (!noi_dung) {
                 return res.status(400).json({ message: 'Vui lòng nhập nội dung' });
               }

               try {
                 const updated = await Notification.update(id, { noi_dung });
                 if (!updated) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

                 res.status(200).json({ message: 'Cập nhật thành công', updated });
               } catch (err) {
                 console.error('Lỗi update:', err);
                 res.status(500).json({ message: 'Lỗi server', error: err.message });
               }
             };


                      // Xóa thông báo
                      exports.remove = async (req, res) => {
                        const id = req.params.id;
                        try {
                          const deleted = await Notification.remove(id);
                          if (deleted === 0) return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa' });

                          res.status(200).json({ message: 'Xóa thành công' });
                        } catch (err) {
                          console.error('Lỗi remove:', err);
                          res.status(500).json({ message: 'Lỗi server', error: err.message });
                        }
                      };