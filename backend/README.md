# Backend

This is the backend service for the Parking Building Management System. It provides REST APIs, JWT authentication, role-based authorization, parking operations, payment handling, image upload support, and real-time notifications.

## Tech Stack

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

## Main Structure

```text
src/main/java/com/parking/management
|-- api/         # REST controllers
|-- config/      # Spring, CORS, Security, WebSocket, Cloudinary configuration
|-- entity/      # JPA entities
|-- repository/  # Spring Data repositories
|-- security/    # JWT provider and authentication filter
`-- service/     # Business services and implementations
```

## Configuration

The backend reads configuration values from environment variables in:

```text
src/main/resources/application.properties
```

Use this sample file as a reference:

```text
application-example.properties
```

Required variables:

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

Example SQL Server connection:

```text
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
DB_USERNAME=sa
DB_PASSWORD=your_password
```

## Run Locally

```powershell
mvn spring-boot:run
```

The backend runs by default at:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Tests

```powershell
mvn test
```

## Database Note

The current configuration uses:

```text
spring.jpa.hibernate.ddl-auto=update
```

This allows Hibernate to update the schema automatically when the application starts. Back up the database before running this configuration with real data.
