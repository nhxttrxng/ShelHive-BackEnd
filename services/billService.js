const db = require('../db/postgres');

async function updateLateBills() {
  const query = `
    UPDATE hoa_don
    SET trang_thai = 'trễ hạn'
    WHERE (
      (ngay_gia_han IS NOT NULL AND ngay_gia_han < CURRENT_DATE)
      OR
      (ngay_gia_han IS NULL AND han_dong_tien < CURRENT_DATE)
    )
    AND trang_thai = 'chưa thanh toán'
    RETURNING ma_hoa_don
  `;
  const result = await db.query(query);
  console.log('Số hóa đơn chuyển sang trễ hạn:', result.rowCount);
}

module.exports = { updateLateBills };
