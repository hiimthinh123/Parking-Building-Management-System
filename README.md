# Parking Building Management System

A web-based parking building management system for registered users, walk-in guests, staff, managers, and administrators.

## Overview

This project supports the main operations of a building parking system, including parking reservations, slot availability tracking, vehicle check-in/check-out, payments, pricing management, incident reporting, role-based access control, and real-time notifications.

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT, WebSocket/STOMP
- Frontend: React, Vite, Axios, React Router, Chart.js
- Database: Microsoft SQL Server
- Integrations: PayOS, Cloudinary, Google OAuth, Plate Recognizer

## Project Structure

```text
.
|-- backend/    # REST API, business logic, security, JPA entities
|-- frontend/   # React/Vite web app
|-- database/   # Database documentation and resources
|-- docs/       # Additional documentation
|-- README.md
|-- .gitignore
`-- LICSENSE
```

## Quick Local Setup

1. Install the required tools:
   - Java 17+
   - Maven 3.9+
   - Node.js 20+
   - SQL Server

2. Configure the backend:

```powershell
cd backend
Copy-Item application-example.properties .env
```

Update the database values and API keys in the newly created configuration file, or set the corresponding environment variables.

3. Run the backend:

```powershell
cd backend
mvn spring-boot:run
```

The backend runs by default at:

```text
http://localhost:8080
```

4. Run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs by default at:

```text
http://localhost:5173
```

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Database README](database/README.md)

## API Documentation

When the backend is running, Swagger UI can be accessed at:

```text
http://localhost:8080/swagger-ui.html
```

## License

See [LICSENSE](LICSENSE).
