const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const momoUrl = process.env.MOMO_URL;
const notifyUrl = process.env.MOMO_NOTIFY_URL;

exports.createPayment = async (req, res) => {
    const { amount, orderInfo, ma_hoa_don, returnUrl } = req.body;
    const orderId = Date.now().toString(); // unique orderId

    // MoMo dùng mã hóa đơn trong extraData
    const extraData = Buffer.from(ma_hoa_don).toString('base64');

    const requestId = orderId;
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: returnUrl,
        ipnUrl: notifyUrl,
        extraData,
        requestType: 'captureWallet',
        lang: 'vi',
        signature
    };

    try {
        const response = await axios.post(momoUrl, requestBody);
        return res.json(response.data); // FE sẽ lấy payUrl từ đây để mở MoMo App
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi kết nối MoMo', error: err.message });
    }
};

// IPN Callback từ MoMo
exports.paymentCallback = async (req, res) => {
    try {
        const data = req.body;
        // Kiểm tra trạng thái thanh toán
        if (data.resultCode == 0) {
            // Lấy mã hóa đơn từ extraData (giải mã base64)
            const ma_hoa_don = Buffer.from(data.extraData, 'base64').toString();
            // Cập nhật DB hóa đơn ở đây (giả sử bạn có pool/query)
            await pool.query(`
                UPDATE hoa_don SET trang_thai = 'Đã thanh toán'
                WHERE ma_hoa_don = $1
            `, [ma_hoa_don]);
            // Có thể lưu thêm orderId, transId vào DB nếu muốn

            return res.status(200).json({ message: 'Đã cập nhật trạng thái hóa đơn thành Đã thanh toán' });
        } else {
            return res.status(200).json({ message: 'Thanh toán thất bại hoặc bị huỷ' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi xử lý callback MoMo', error: err.message });
    }
};
