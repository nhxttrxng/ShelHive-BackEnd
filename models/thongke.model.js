const db = require('../config/db'); // Kết nối database

const ThongKe = {
  // Thống kê tổng tiền trọ (dựa trên hóa đơn của các phòng)
  async getTotalRent() {
    const query = `
      SELECT SUM(tong_tien) AS total_rent
      FROM hoa_don
      WHERE trang_thai = 'paid'; -- Chỉ tính các hóa đơn đã thanh toán
    `;
    const result = await db.query(query);
    return result.rows[0];
  },

  // Thống kê số phòng đã thanh toán, trễ hạn, chưa đóng
  async getRoomPaymentStatus() {
    const query = `
      SELECT 
        trang_thai AS status, 
        COUNT(*) AS room_count
      FROM hoa_don
      GROUP BY trang_thai; -- Giả định cột trang_thai có các giá trị: 'paid', 'overdue', 'unpaid'
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Thống kê doanh thu chênh lệch tiền điện/nước
  async getElectricWaterRevenueDifference() {
    const query = `
      SELECT 
        SUM(so_dien * (3500 - 2649)) AS electric_difference,
        SUM(so_nuoc * (17000 - 15929)) AS water_difference
      FROM hoa_don
      WHERE trang_thai = 'paid'; -- Chỉ tính các hóa đơn đã thanh toán
    `;
    const result = await db.query(query);
    return result.rows[0];
  },

  // Thống kê tiền điện & nước theo tháng (dựa trên hóa đơn)
  async getElectricWaterByMonth(year) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM ngay_tao) AS month,
        SUM(so_dien * 3500) AS electric_cost,
        SUM(so_nuoc * 17000) AS water_cost
      FROM hoa_don
      WHERE EXTRACT(YEAR FROM ngay_tao) = $1
      GROUP BY month
      ORDER BY month;
    `;
    const result = await db.query(query, [year]);
    return result.rows;
  },

  // Xác định tháng dùng điện/nước nhiều nhất và ít nhất
  async getMaxMinElectricWaterUsage(year) {
    const query = `
      WITH usage_data AS (
        SELECT 
          EXTRACT(MONTH FROM ngay_tao) AS month,
          SUM(so_dien) AS total_electric_usage,
          SUM(so_nuoc) AS total_water_usage
        FROM hoa_don
        WHERE EXTRACT(YEAR FROM ngay_tao) = $1
        GROUP BY month
      )
      SELECT 
        'electric' AS type,
        MAX(total_electric_usage) AS max_usage,
        MIN(total_electric_usage) AS min_usage,
        (SELECT month FROM usage_data WHERE total_electric_usage = MAX(total_electric_usage)) AS max_month,
        (SELECT month FROM usage_data WHERE total_electric_usage = MIN(total_electric_usage)) AS min_month
      FROM usage_data

      UNION ALL

      SELECT 
        'water' AS type,
        MAX(total_water_usage) AS max_usage,
        MIN(total_water_usage) AS min_usage,
        (SELECT month FROM usage_data WHERE total_water_usage = MAX(total_water_usage)) AS max_month,
        (SELECT month FROM usage_data WHERE total_water_usage = MIN(total_water_usage)) AS min_month
      FROM usage_data;
    `;
    const result = await db.query(query, [year]);
    return result.rows;
  },
};

module.exports = ThongKe;