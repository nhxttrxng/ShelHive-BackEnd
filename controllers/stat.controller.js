// stat.controller.jsconst ThongKe = require('../models/thongke.model');

const StatController = {
    // Thống kê tổng tiền trọ
    async getTotalRent(req, res) {
      try {
        const result = await ThongKe.getTotalRent();
        res.status(200).json({ total_rent: result.total_rent });
      } catch (error) {
        console.error('Error in getTotalRent:', error);
        res.status(500).json({ error: 'Server error' });
      }
    },
  
    // Thống kê số phòng đã thanh toán, trễ hạn, chưa đóng
    async getRoomPaymentStatus(req, res) {
      try {
        const result = await ThongKe.getRoomPaymentStatus();
        res.status(200).json(result);
      } catch (error) {
        console.error('Error in getRoomPaymentStatus:', error);
        res.status(500).json({ error: 'Server error' });
      }
    },
  
    // Thống kê doanh thu chênh lệch tiền điện/nước
    async getElectricWaterRevenueDifference(req, res) {
      try {
        const result = await ThongKe.getElectricWaterRevenueDifference();
        res.status(200).json(result);
      } catch (error) {
        console.error('Error in getElectricWaterRevenueDifference:', error);
        res.status(500).json({ error: 'Server error' });
      }
    },
  
    // Thống kê tiền điện & nước theo tháng
    async getElectricWaterByMonth(req, res) {
      try {
        const { year } = req.params;
        const result = await ThongKe.getElectricWaterByMonth(year);
        res.status(200).json(result);
      } catch (error) {
        console.error('Error in getElectricWaterByMonth:', error);
        res.status(500).json({ error: 'Server error' });
      }
    },
  
    // Xác định tháng dùng điện/nước nhiều nhất và ít nhất
    async getMaxMinElectricWaterUsage(req, res) {
      try {
        const { year } = req.params;
        const result = await ThongKe.getMaxMinElectricWaterUsage(year);
        res.status(200).json(result);
      } catch (error) {
        console.error('Error in getMaxMinElectricWaterUsage:', error);
        res.status(500).json({ error: 'Server error' });
      }
    },
  };
  
  module.exports = StatController;