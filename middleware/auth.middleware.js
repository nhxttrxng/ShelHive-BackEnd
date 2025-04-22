const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret'; // Sử dụng secret key để mã hóa JWT, thường lưu trong .env

// Middleware kiểm tra token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']; // Lấy token từ header Authorization

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  // Nếu token có dạng 'Bearer <token>', cắt lấy phần token
  const tokenWithoutBearer = token.split(' ')[1];

  // Kiểm tra và giải mã token
  jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Lưu thông tin người dùng đã giải mã vào request để sử dụng sau
    req.user = decoded;

    // Nếu cần, có thể kiểm tra vai trò của người dùng (admin/user)
    if (req.user.role && req.user.role === 'admin') {
      req.isAdmin = true; // Đánh dấu người dùng là admin nếu cần thiết
    }

    next(); // Tiếp tục với request
  });
};

// Middleware kiểm tra quyền admin (nếu cần)
const verifyAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Export middleware
module.exports = { verifyToken, verifyAdmin };