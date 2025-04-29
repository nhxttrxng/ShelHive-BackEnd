const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();  // Đọc file .env

// Import các routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const motelRoutes = require("./routes/motel.routes");
const statRoutes = require("./routes/stat.routes");
const roomRoutes = require("./routes/room.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const extensionRoutes = require("./routes/extension.routes");
const notificationRoutes = require("./routes/notification.routes");
const reportRoutes = require("./routes/report.routes");
const otpRoutes = require("./routes/otp.routes");
const invoiceNotificationRoutes = require("./routes/invoiceNotification.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Xử lý JSON body

// Routes
app.use("/api/auth", authRoutes);  // Tạo route cho các API auth
app.use("/api/users", userRoutes); // Tạo route cho API lấy người dùng
app.use("/api/admins", adminRoutes); // Tạo route cho API lấy admin
app.use("/api/motels", motelRoutes);
//app.use("/api/stats", statRoutes); // Tạo route cho API lấy thống kê
app.use("/api/rooms", roomRoutes); // Tạo route cho API lấy phòng
app.use("/api/invoices", invoiceRoutes); // Tạo route cho API lấy hóa đơn
app.use("/api/extensions", extensionRoutes); // Tạo route cho API gia hạn hóa đơn
app.use("/api/notifications", notificationRoutes); // Tạo route cho API lấy thông báo
app.use("/api/reports", reportRoutes); // Tạo route cho API lấy báo cáo
app.use("/api/otps", otpRoutes);
app.use("/api/invoice-notifications", invoiceNotificationRoutes); // Tạo route cho API thông báo hóa đơn

// Port từ file .env hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
