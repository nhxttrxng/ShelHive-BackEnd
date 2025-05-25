const { VNPay, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const qs = require('qs');
const crypto = require('crypto');
const pool = require('../db/postgres');

// Khởi tạo cấu hình
const vnpay = new VNPay({
    tmnCode: '5SLG82S7',
    secureSecret: 'KWYL27X5GHQNWKECY8BINYDG7P6AF105',
    vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    testMode: true,
    hashAlgorithm: 'SHA512',
});

// Tạo link thanh toán
exports.createPayment = async (req, res) => {
    const { amount, ma_hoa_don, orderInfo, returnUrl } = req.body;

    const vnp_TxnRef = ma_hoa_don ? String(ma_hoa_don) : Date.now().toString();
    const vnp_OrderInfo = orderInfo
        ? orderInfo.replace(/[^\w\d]/g, '_').slice(0, 200)
        : `Thanh_toan_hoa_don_${vnp_TxnRef}`;
    const vnp_Amount = Number(amount);

    const vnp_ReturnUrl = returnUrl || 'http://221.132.33.173:3000/api/vnpay/return';
    const expire = new Date(Date.now() + 15 * 60 * 1000);

    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: vnp_Amount * 100,
        vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: vnp_ReturnUrl,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(expire),
    });

    return res.status(200).json(vnpayResponse);
};

// Hàm sortObject
function sortObject(obj) {
    return Object.keys(obj).sort().reduce((result, key) => {
        result[key] = obj[key];
        return result;
    }, {});
}

// Xử lý returnUrl
exports.returnUrl = async (req, res) => {
    const params = { ...req.query };
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const signData = qs.stringify(sortObject(params), { encode: false });
    const hash = crypto.createHmac('sha512', 'KWYL27X5GHQNWKECY8BINYDG7P6AF105')
        .update(signData, 'utf-8')
        .digest('hex');

    if (secureHash !== hash) return res.status(400).send('Chuỗi hash không hợp lệ!');

    if (params.vnp_ResponseCode === '00') {
        const ma_hoa_don = params.vnp_TxnRef;
        try {
            await pool.query(
                `UPDATE hoa_don 
                 SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW() 
                 WHERE ma_hoa_don = $1`,
                [ma_hoa_don]
            );
            res.send('Thanh toán thành công!');
        } catch (err) {
            console.error(err);
            res.status(500).send('Thanh toán thành công nhưng lỗi cập nhật hóa đơn!');
        }
    } else {
        res.status(400).send('Thanh toán không thành công!');
    }
};

