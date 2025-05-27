const db = require('../db/postgres'); // kết nối database

const ThongKe = {
// 1. Tổng tiền trọ chưa thanh toán theo dãy theo tháng và năm
async getTotalUnpaidRentByDay(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day, 
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      SUM(hd.tien_phong) AS total_unpaid_rent
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    WHERE hd.trang_thai = 'chưa thanh toán' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

// 2. Tiền trọ đã thanh toán theo dãy theo tháng và năm
async getPaidRentByDayAndMonth(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      SUM(hd.tong_tien) AS total_paid_rent
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    WHERE hd.trang_thai = 'đã thanh toán' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

// 3. Tổng số phòng đã thanh toán theo dãy theo tháng và năm
async getPaidRoomCountByDayAndMonth(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      COUNT(DISTINCT hd.ma_phong) AS paid_room_count
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    WHERE hd.trang_thai = 'đã thanh toán' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

// 4. Tổng số phòng trễ hạn theo dãy theo tháng và năm
async getOverdueRoomCountByDayAndMonth(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      COUNT(DISTINCT hd.ma_phong) AS overdue_room_count
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    WHERE hd.trang_thai = 'trễ hạn' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

// 5. Tổng số phòng chưa đóng theo dãy theo tháng và năm
async getUnpaidRoomCountByDayAndMonth(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      COUNT(DISTINCT hd.ma_phong) AS unpaid_room_count
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    WHERE hd.trang_thai = 'chưa thanh toán' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

// 6. Thống kê tiền lời điện theo dãy theo tháng và năm
async getElectricProfitByDayAndRange(ma_day, fromMonth, fromYear, toMonth, toYear) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      SUM(hd.so_dien * (3500 - 2649)) AS electric_profit
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    JOIN day_tro dt ON p.ma_day = dt.ma_day
    WHERE hd.trang_thai = 'đã thanh toán'
      AND d.ma_day = $1
      AND (EXTRACT(YEAR FROM hd.thang_nam) * 100 + EXTRACT(MONTH FROM hd.thang_nam))
          BETWEEN ($2 * 100 + $3) AND ($4 * 100 + $5)
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, fromYear, fromMonth, toYear, toMonth]);
  return result.rows;
},


// 7. Thống kê tiền lời nước theo dãy theo tháng và năm
async getWaterProfitByDayAndMonth(ma_day, month, year) {
  const query = `
    SELECT 
      d.ma_day,
      EXTRACT(MONTH FROM hd.thang_nam) AS month,
      EXTRACT(YEAR FROM hd.thang_nam) AS year,
      SUM(hd.so_nuoc * (17000 - 15929)) AS water_profit
    FROM hoa_don hd
    JOIN phong p ON hd.ma_phong = p.ma_phong
    JOIN day_tro d ON p.ma_day = d.ma_day
    JOIN day_tro dt ON p.ma_day = dt.ma_day
    WHERE hd.trang_thai = 'đã thanh toán' 
      AND d.ma_day = $1
      AND EXTRACT(MONTH FROM hd.thang_nam) = $2
      AND EXTRACT(YEAR FROM hd.thang_nam) = $3
    GROUP BY d.ma_day, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_day, month, year]);
  return result.rows;
},

  // 8. Lấy tiền điện từng tháng theo mã phòng, có điều kiện tháng và năm
async getElectricMoneyByRoomAndRange(ma_phong, fromMonth, fromYear, toMonth, toYear) {
  const query = `
    SELECT 
      ma_phong,
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_dien * 3500) AS electric_money
    FROM hoa_don
    WHERE ma_phong = $1
      AND (EXTRACT(YEAR FROM thang_nam) * 100 + EXTRACT(MONTH FROM thang_nam)) 
          BETWEEN ($2 * 100 + $3) AND ($4 * 100 + $5)
    GROUP BY ma_phong, month, year
    ORDER BY year, month;
  `;
  const result = await db.query(query, [ma_phong, fromYear, fromMonth, toYear, toMonth]);
  return result.rows;
}
,

async getWaterMoneyByRoomAndRange(ma_phong, fromMonth, fromYear, toMonth, toYear) {
  const query = `
    SELECT 
      ma_phong,
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_nuoc * 17000) AS water_money
    FROM hoa_don
    WHERE ma_phong = $1
      AND (EXTRACT(YEAR FROM thang_nam) * 100 + EXTRACT(MONTH FROM thang_nam)) 
          BETWEEN ($2 * 100 + $3) AND ($4 * 100 + $5)
    GROUP BY ma_phong, month, year
    ORDER BY year, month;
  `;

  const result = await db.query(query, [ma_phong, fromYear, fromMonth, toYear, toMonth]);
  return result.rows;
},

// 10. Lấy tháng và năm có tiền điện cao nhất theo mã phòng (trả về tháng + năm)
async getMaxElectricMonthByRoom(ma_phong) {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_dien * 3500) AS electric_money
    FROM hoa_don
    WHERE ma_phong = $1
    GROUP BY month, year
    ORDER BY electric_money DESC
    LIMIT 1;
  `;
  const result = await db.query(query, [ma_phong]);
  return result.rows[0];
},

// 11. Lấy tháng và năm có tiền nước cao nhất theo mã phòng (trả về tháng + năm)
async getMaxWaterMonthByRoom(ma_phong) {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_nuoc * 17000) AS water_money
    FROM hoa_don
    WHERE ma_phong = $1
    GROUP BY month, year
    ORDER BY water_money DESC
    LIMIT 1;
  `;
  const result = await db.query(query, [ma_phong]);
  return result.rows[0];
},

// 12. Lấy tháng và năm có tiền điện thấp nhất theo mã phòng
async getMinElectricMonthByRoom(ma_phong) {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_dien * 3500) AS electric_money
    FROM hoa_don
    WHERE ma_phong = $1
    GROUP BY month, year
    ORDER BY electric_money ASC
    LIMIT 1;
  `;
  const result = await db.query(query, [ma_phong]);
  return result.rows[0];
},

// 13. Lấy tháng và năm có tiền nước thấp nhất theo mã phòng
async getMinWaterMonthByRoom(ma_phong) {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM thang_nam) AS month,
      EXTRACT(YEAR FROM thang_nam) AS year,
      SUM(so_nuoc * 17000) AS water_money
    FROM hoa_don
    WHERE ma_phong = $1
    GROUP BY month, year
    ORDER BY water_money ASC
    LIMIT 1;
  `;
  const result = await db.query(query, [ma_phong]);
  return result.rows[0];
},



};

module.exports = ThongKe;
