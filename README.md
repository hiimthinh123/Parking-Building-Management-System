# Parking Building Management System

Hệ thống quản lý bãi đỗ xe trong tòa nhà, gồm web cho người dùng, khách vãng lai, nhân viên, quản lý và quản trị viên
## Tổng quan

Dự án hỗ trợ các nghiệp vụ chính của bãi đỗ xe: đặt chỗ, theo dõi chỗ trống, check-in/check-out, thanh toán, quản lý giá, báo cáo sự cố, phân quyền và thông báo thời gian thực
## Tech stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT, WebSocket/STOMP
- Frontend: React, Vite, Axios, React Router, Chart.js
- Database: Microsoft SQL Server
- Tich hop: PayOS, Cloudinary, Google OAuth, Plate Recognizer

## Cấu trúc thư mục
```text
.
|-- backend/    # REST API, business logic, security, JPA entities
|-- frontend/   # React/Vite web app
|-- database/   # Hướng dẫn và tài nguyên database
|-- docs/       # Tài liệu bổ sung
|-- README.md
|-- .gitignore
`-- LICSENSE
```

## Chạy nhanh local

1. Cài đặt yêu cầu:
   - Java 17+
   - Maven 3.9+
   - Node.js 20+
   - SQL Server

2. Cấu hình backend:

```powershell
cd backend
Copy-Item application-example.properties .env
```

Cập nhật các giá trị database và API key trong file cấu hình mới tạo, hoặc set biến mỗi trường tương ứng
3. Chay backend:

```powershell
cd backend
mvn spring-boot:run
```

Backend mặc định chạy tại `http://localhost:8080`.

4. Chạy frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Tài liệu từng phần

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Database README](database/README.md)

## API docs

Khi backend đang chạy, Swagger UI có thể truy cập tại:
```text
http://localhost:8080/swagger-ui.html
```

## License

Xem file [LICSENSE](LICSENSE).
