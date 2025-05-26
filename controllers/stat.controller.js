const ThongKe = require('../models/thongke.model');

// Controller cho từng api thống kê
const thongKeController = {

  // 1. Tổng tiền trọ chưa thanh toán theo dãy, tháng, năm
  getTotalUnpaidRentByDay: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getTotalUnpaidRentByDay(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getTotalUnpaidRentByDay:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 2. Tiền trọ đã thanh toán theo dãy, tháng, năm
  getPaidRentByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getPaidRentByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getPaidRentByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 3. Tổng số phòng đã thanh toán theo dãy, tháng, năm
  getPaidRoomCountByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getPaidRoomCountByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getPaidRoomCountByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 4. Tổng số phòng trễ hạn theo dãy, tháng, năm
  getOverdueRoomCountByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getOverdueRoomCountByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getOverdueRoomCountByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 5. Tổng số phòng chưa đóng theo dãy, tháng, năm
  getUnpaidRoomCountByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getUnpaidRoomCountByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getUnpaidRoomCountByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 6. Tiền lời điện theo dãy, tháng, năm
  getElectricProfitByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getElectricProfitByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getElectricProfitByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 7. Tiền lời nước theo dãy, tháng, năm
  getWaterProfitByDayAndMonth: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getWaterProfitByDayAndMonth(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getWaterProfitByDayAndMonth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 8. Tiền điện theo tháng và phòng
  getElectricMoneyByMonthAndRoom: async (req, res) => {
    try {
      const { ma_phong, month, year } = req.params;
      const data = await ThongKe.getElectricMoneyByMonthAndRoom(ma_phong, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getElectricMoneyByMonthAndRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 9. Tiền nước theo tháng và phòng
  getWaterMoneyByMonthAndRoom: async (req, res) => {
    try {
      const { ma_phong, month, year } = req.params;
      const data = await ThongKe.getWaterMoneyByMonthAndRoom(ma_phong, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getWaterMoneyByMonthAndRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 10. Tháng có tiền điện cao nhất theo phòng
  getMaxElectricMonthByRoom: async (req, res) => {
    try {
      const { ma_phong } = req.params;
      const data = await ThongKe.getMaxElectricMonthByRoom(ma_phong);
      res.json(data);
    } catch (error) {
      console.error('Error getMaxElectricMonthByRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 11. Tháng có tiền nước cao nhất theo phòng
  getMaxWaterMonthByRoom: async (req, res) => {
    try {
      const { ma_phong } = req.params;
      const data = await ThongKe.getMaxWaterMonthByRoom(ma_phong);
      res.json(data);
    } catch (error) {
      console.error('Error getMaxWaterMonthByRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 12. Tháng có tiền điện thấp nhất theo phòng
  getMinElectricMonthByRoom: async (req, res) => {
    try {
      const { ma_phong } = req.params;
      const data = await ThongKe.getMinElectricMonthByRoom(ma_phong);
      res.json(data);
    } catch (error) {
      console.error('Error getMinElectricMonthByRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 13. Tháng có tiền nước thấp nhất theo phòng
  getMinWaterMonthByRoom: async (req, res) => {
    try {
      const { ma_phong } = req.params;
      const data = await ThongKe.getMinWaterMonthByRoom(ma_phong);
      res.json(data);
    } catch (error) {
      console.error('Error getMinWaterMonthByRoom:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

};

module.exports = thongKeController;
