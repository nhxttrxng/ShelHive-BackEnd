const ThongKe = require('../models/thongke.model');

// Controller cho từng api thống kê
const thongKeController = {

  // 1. Tổng tiền trọ chưa thanh toán theo dãy, tháng, năm
  getRentStatsByDayMonthYear: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getRentStatsByDayMonthYear(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getRentStatsByDayMonthYear:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // 3. Tổng số phòng theo dãy, tháng, năm
 getRoomStatusCountByDayMonthYear: async (req, res) => {
    try {
      const { ma_day, month, year } = req.params;
      const data = await ThongKe.getRoomStatusCountByDayMonthYear(ma_day, parseInt(month), parseInt(year));
      res.json(data);
    } catch (error) {
      console.error('Error getRoomStatusCountByDayMonthYear:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

// 10. Tiền lời điện theo tháng và dãy
getElectricProfitByMonthAndDay: async (req, res) => {
  try {
    const { ma_day, fromMonth, fromYear, toMonth, toYear } = req.params;
    const data = await ThongKe.getElectricProfitByDayAndRange(
      ma_day,
      parseInt(fromMonth, 10),
      parseInt(fromYear, 10),
      parseInt(toMonth, 10),
      parseInt(toYear, 10)
    );
    res.json(data);
  } catch (error) {
    console.error('Error getElectricProfitByDayAndRange:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},

// 11. Tiền lời nước theo tháng và dãy
getWaterProfitByMonthAndDay: async (req, res) => {
  try {
    const { ma_day, fromMonth, fromYear, toMonth, toYear } = req.params;
    const data = await ThongKe.getWaterProfitByDayAndRange(
      ma_day,
      parseInt(fromMonth, 10),
      parseInt(fromYear, 10),
      parseInt(toMonth, 10),
      parseInt(toYear, 10)
    );
    res.json(data);
  } catch (error) {
    console.error('Error getWaterProfitByDayAndRange:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},

  // 8. Tiền điện theo tháng và phòng
  getElectricMoneyByMonthAndRoom: async (req, res) => {
  try {
    const { ma_phong, fromMonth, fromYear, toMonth, toYear } = req.params;
    const data = await ThongKe.getElectricMoneyByRoomAndRange(
      ma_phong,
      parseInt(fromMonth, 10),
      parseInt(fromYear, 10),
      parseInt(toMonth, 10),
      parseInt(toYear, 10)
    );
    res.json(data);
  } catch (error) {
    console.error('Error getElectricMoneyByRoomAndRange:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},

// 9. Tiền nước theo tháng và phòng
getWaterMoneyByMonthAndRoom: async (req, res) => {
  try {
    const { ma_phong, fromMonth, fromYear, toMonth, toYear } = req.params;
    const data = await ThongKe.getWaterMoneyByRoomAndRange(
      ma_phong,
      parseInt(fromMonth, 10),
      parseInt(fromYear, 10),
      parseInt(toMonth, 10),
      parseInt(toYear, 10)
    );
    res.json(data);
  } catch (error) {
    console.error('Error getWaterMoneyByRoomAndRange:', error);
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
