const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();  // Đọc file .env

// Import các routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const otpRoutes = require("./routes/otp.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Xử lý JSON body

// Routes
app.use("/api/auth", authRoutes);  // Tạo route cho các API auth
app.use("/api/users", userRoutes); // Tạo route cho API lấy người dùng
app.use("/api/admins", adminRoutes); // Tạo route cho API lấy admin
app.use("/api/otps", otpRoutes);

// Port từ file .env hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
