const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();  // Đọc file .env

const authRoutes = require("./routes/auth.routes");  // Import routes

const app = express();
app.use(cors());
app.use(express.json());  // Xử lý JSON body

// Routes
app.use("/api/auth", authRoutes);  // Tạo route cho các API auth

// Port từ file .env hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
