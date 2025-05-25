const qs = require('qs');
const crypto = require('crypto');
require('dotenv').config();
const pool = require('../db/postgres'); // hoặc pool DB của bạn

// Helper
function dateToVNPayFormat(date) {
    const pad = n => n < 10 ? '0' + n : n;
    return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

function sortObject(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

// 1. API Tạo link thanh toán
exports.createPayment = (req, res) => {
    const { amount, orderInfo, ma_hoa_don } = req.body;
    const date = new Date();
    const vnp_TxnRef = `${date.getTime()}`; // mã giao dịch
    const vnp_OrderInfo = orderInfo || `Thanh toán hóa đơn ${ma_hoa_don}`;
    const vnp_Amount = amount * 100;
    const vnp_Locale = 'vn';
    const vnp_BankCode = '';
    const vnp_IpAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Amount': vnp_Amount,
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_OrderType': 'other',
        'vnp_Locale': vnp_Locale,
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_CreateDate': dateToVNPayFormat(date),
        'vnp_ExtraData': Buffer.from(ma_hoa_don + '').toString('base64')
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const secureHash = crypto.createHmac('sha512', vnp_HashSecret)
        .update(signData)
        .digest('hex');
    vnp_Params['vnp_SecureHash'] = secureHash;

    const paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });

    return res.json({ paymentUrl });
};

// 2. API Xử lý kết quả thanh toán
exports.returnUrl = async (req, res) => {
    const query = req.query;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_SecureHash = query.vnp_SecureHash;

    // Xác thực hash (bảo mật)
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sortedQuery = sortObject(query);
    const signData = qs.stringify(sortedQuery, { encode: false });
    const checkHash = crypto.createHmac('sha512', vnp_HashSecret).update(signData).digest('hex');

    if (vnp_SecureHash === checkHash) {
        // Thành công
        if (query.vnp_ResponseCode === '00') {
            // Lấy mã hóa đơn
            const ma_hoa_don = Buffer.from(query.vnp_ExtraData, 'base64').toString();
            // Update trạng thái hóa đơn
            await pool.query("UPDATE hoa_don SET trang_thai = 'Đã thanh toán' WHERE ma_hoa_don = $1", [ma_hoa_don]);
            // Có thể render HTML hoặc redirect về FE kèm trạng thái
            res.send('Thanh toán thành công!');
        } else {
            res.send('Thanh toán thất bại hoặc bị huỷ!');
        }
    } else {
        res.status(400).send('Chuỗi hash không hợp lệ!');
    }
};
