const qs = require('qs');
const crypto = require('crypto');
require('dotenv').config();
const pool = require('../db/postgres'); // Thay đổi tuỳ theo DB pool bạn đang dùng

// Helper: Format date cho VNPAY (yyyyMMddHHmmss)
function dateToVNPayFormat(date) {
    const pad = n => n < 10 ? '0' + n : n;
    return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

// Helper: Sort object by key
function sortObject(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => sorted[key] = obj[key]);
    return sorted;
}

// Helper: Verify returnUrl
function verifyReturnUrl(params, secureHash, secretKey) {
    const sortedParams = sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hash = crypto.createHmac("sha512", secretKey)
        .update(signData, 'utf-8')
        .digest("hex");
    return hash === secureHash;
}

exports.createPayment = (req, res) => {
    // Lấy IP client, luôn chuyển về IPv4 nếu là ::1
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress || '127.0.0.1';
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') ipAddr = '127.0.0.1';

    // Lấy biến môi trường
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    // Parse params từ body
    const { amount, orderDescription, orderType, bankCode, language, ma_hoa_don } = req.body;
    const date = new Date();

    // Tham số bắt buộc
    const createDate = dateToVNPayFormat(date);
    const expireDate = dateToVNPayFormat(new Date(date.getTime() + 15 * 60 * 1000)); // +15 phút
    const orderId = date.getTime().toString().slice(-8); // hoặc random
    const vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Amount': amount * 100, // VNPAY yêu cầu nhân 100
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': orderDescription || `Thanh toan hoa don ${ma_hoa_don || ''}`,
        'vnp_OrderType': orderType || 'other',
        'vnp_Locale': language || 'vn',
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate,
        'vnp_ExpireDate': expireDate,
        'vnp_ExtraData': ma_hoa_don ? Buffer.from(ma_hoa_don + '').toString('base64') : '',
    };
    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    // Sort và tạo secure hash
    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const signed = crypto.createHmac("sha512", secretKey)
        .update(signData, 'utf-8')
        .digest("hex");
    sortedParams['vnp_SecureHash'] = signed;

    // Build URL
    const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });

    // FE lấy paymentUrl, hoặc res.redirect nếu làm web
    return res.json({ paymentUrl });
};

// API xử lý returnUrl
exports.returnUrl = async (req, res) => {
    const params = { ...req.query };
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // Tự verify hash (không phụ thuộc vnpay lib)
    const isValid = verifyReturnUrl(params, secureHash, process.env.VNP_HASH_SECRET);
    if (!isValid) return res.status(400).send('Chuỗi hash không hợp lệ!');

    if (params.vnp_ResponseCode === '00') {
        const ma_hoa_don = Buffer.from(params.vnp_ExtraData, 'base64').toString();
        try {
            await pool.query(
                "UPDATE hoa_don SET trang_thai = 'Đã thanh toán' WHERE ma_hoa_don = $1",
                [ma_hoa_don]
            );
            res.send('Thanh toán thành công!');
        } catch (err) {
            res.status(500).send('Thanh toán thành công nhưng lỗi DB!');
        }
    } else {
        res.send('Thanh toán thất bại hoặc bị huỷ!');
    }
};
