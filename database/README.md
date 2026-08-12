# Database

This folder contains database documentation, initialization scripts, sample data, and database-related notes for the Parking Building Management System.

## SQL Files

- `schema.sql`: creates tables, indexes, default values, unique constraints, and foreign keys.
- `seed.sql`: inserts required base data for the application, including roles, permissions, sample users, vehicle types, floors, slots, and pricing policies.
- `sample-data.sql`: inserts optional demo/test data such as bookings, parking sessions, payments, feedback, and incident reports.

## Database System

The project uses Microsoft SQL Server.

Default database name used in the sample configuration:

```text
system_database
```

Sample connection string:

```text
jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
```

## Local Database Setup

1. Install SQL Server and SQL Server Management Studio or Azure Data Studio.

2. Create the database:

```sql
CREATE DATABASE system_database;
GO
```

3. Update backend environment variables:

```text
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

4. Run the SQL files in this order:

```text
schema.sql
seed.sql
sample-data.sql
```

`sample-data.sql` is optional and should only be used when demo data is needed.

5. Run the backend application.

The current backend configuration uses:

```text
spring.jpa.hibernate.ddl-auto=update
```

## Recommendations

- Do not commit large database backup files to Git.
- Store SQL seed or migration scripts in this folder.
- Back up real data before changing the schema.
- For production environments, consider using Flyway or Liquibase instead of `ddl-auto=update`.
