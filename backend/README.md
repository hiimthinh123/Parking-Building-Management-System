# Backend

Backend cua Parking Building Management System duoc xay dung bang Java 17 va Spring Boot. Phan nay cung cap REST API, xac thuc JWT, phan quyen, quan ly bai do xe, thanh toan, upload anh va thong bao realtime.

## Cong nghe

- Java 17
- Spring Boot 4.1.0
- Spring Web MVC
- Spring Security
- Spring Data JPA
- SQL Server JDBC
- JWT
- WebSocket/STOMP
- Swagger/OpenAPI
- PayOS, Cloudinary, Google OAuth, Plate Recognizer

## Cau truc chinh

```text
src/main/java/com/parking/management
|-- api/         # REST controllers
|-- config/      # Cau hinh Spring, CORS, Security, WebSocket, Cloudinary
|-- entity/      # JPA entities
|-- repository/  # Spring Data repositories
|-- security/    # JWT provider va auth filter
`-- service/     # Business services va implementations
```

## Cau hinh

Backend doc cau hinh tu bien moi truong trong `src/main/resources/application.properties`.

Tham khao file mau:

```text
application-example.properties
```

Bien can co:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
CLOUDINARY_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID
PAYOS_CLIENT_ID
PAYOS_API_KEY
PAYOS_CHECKSUM_KEY
PLATE_RECOGNIZER_API_KEY
```

Vi du SQL Server:

```text
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
DB_USERNAME=sa
DB_PASSWORD=your_password
```

## Chay local

```powershell
mvn spring-boot:run
```

Ung dung mac dinh chay tai:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Kiem thu

```powershell
mvn test
```

## Ghi chu database

`spring.jpa.hibernate.ddl-auto=update` dang duoc cau hinh de Hibernate tu dong cap nhat schema khi ung dung chay. Nen sao luu database truoc khi chay voi du lieu that.
