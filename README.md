# Parking Building Management System

He thong quan ly bai do xe trong toa nha, gom ung dung web cho nguoi dung, nhan vien, quan ly va quan tri vien.

## Tong quan

Du an ho tro cac nghiep vu chinh cua bai do xe: dat cho, theo doi cho trong, check-in/check-out, thanh toan, quan ly gia, bao cao su co, phan quyen va thong bao thoi gian thuc.

## Tech stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT, WebSocket/STOMP
- Frontend: React, Vite, Axios, React Router, Chart.js
- Database: Microsoft SQL Server
- Tich hop: PayOS, Cloudinary, Google OAuth, Plate Recognizer

## Cau truc thu muc

```text
.
|-- backend/    # REST API, business logic, security, JPA entities
|-- frontend/   # React/Vite web app
|-- database/   # Huong dan va tai nguyen database
|-- docs/       # Tai lieu bo sung
|-- README.md
|-- .gitignore
`-- LICSENSE
```

## Chay nhanh local

1. Cai dat yeu cau:
   - Java 17+
   - Maven 3.9+
   - Node.js 20+
   - SQL Server

2. Cau hinh backend:

```powershell
cd backend
Copy-Item application-example.properties .env
```

Cap nhat cac gia tri database va API key trong file cau hinh moi tao, hoac set bien moi truong tuong ung.

3. Chay backend:

```powershell
cd backend
mvn spring-boot:run
```

Backend mac dinh chay tai `http://localhost:8080`.

4. Chay frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay tai `http://localhost:5173`.

## Tai lieu tung phan

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Database README](database/README.md)

## API docs

Khi backend dang chay, Swagger UI co the truy cap tai:

```text
http://localhost:8080/swagger-ui.html
```

## License

Xem file [LICSENSE](LICSENSE).
