
````
.
ShelHive-BackEnd/
├── controllers/
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── invoice.controller.js
│   ├── motel.controller.js
│   ├── notification.controller.js
│   ├── otp.controller.js
│   ├── report.controller.js
│   ├── room.controller.js
│   ├── stat.controller.js
│   └── user.controller.js
├── db/
│   └── postgres.js           # File cấu hình và kết nối PostgreSQL
├── models/
│   ├── index.js              # Khởi tạo Sequelize và liên kết models
│   ├── admin.model.js
│   ├── user.model.js
│   ├── daytro.model.js
│   ├── phong.model.js
│   ├── hoadon.model.js
│   ├── thongbao.model.js
│   ├── phananh.model.js
│   ├── otp.model.js
│   ├── thanhvien.model.js
│   └── giahan.model.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── invoice.routes.js
│   ├── motel.routes.js
│   ├── notification.routes.js
│   ├── otp.routes.js
│   ├── report.routes.js
│   ├── room.routes.js
│   ├── stat.routes.js
│   └── user.routes.js
├── middlewares/
│   ├── validate.middleware.js
│   └── auth.middleware.js     # Middleware xác thực nếu có
├── .env                       # Biến môi trường (PORT, DB, JWT, ...)
├── .gitignore
├── package.json
├── server.js                  # Entry point chạy server
└── README.md
