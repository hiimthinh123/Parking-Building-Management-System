# Database

Thu muc nay dung de luu tai lieu, script khoi tao, backup mau hoac ghi chu lien quan den database cua Parking Building Management System.

## Cac file SQL

- `schema.sql`: tao bang, index, default, unique constraint va foreign key.
- `seed.sql`: du lieu nen bat buoc de app chay, gom role, permission, user mau, loai xe, tang, slot va bang gia.
- `sample-data.sql`: du lieu demo/test nhu booking, parking session, payment, feedback va incident report.

## He quan tri

Du an su dung Microsoft SQL Server.

Database mac dinh trong file cau hinh mau:

```text
system_database
```

Chuoi ket noi mau:

```text
jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
```

## Cach chuan bi database local

1. Cai SQL Server va SQL Server Management Studio hoac Azure Data Studio.
2. Tao database:

```sql
CREATE DATABASE system_database;
GO
```

3. Cap nhat bien moi truong backend:

```text
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=system_database;encrypt=true;trustServerCertificate=true;
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

4. Chay lan luot cac file SQL:

```text
schema.sql
seed.sql
sample-data.sql
```

`sample-data.sql` la tuy chon, chi can chay khi muon co du lieu demo.

5. Chay backend. Hibernate se tao/cap nhat bang theo entity vi cau hinh hien tai la:

```text
spring.jpa.hibernate.ddl-auto=update
```

## Khuyen nghi

- Khong commit file backup database lon vao Git.
- Dat script SQL tai thu muc nay neu can seed data hoac migrate thu cong.
- Sao luu du lieu truoc khi thay doi schema.
- Voi moi truong production, nen dung migration tool nhu Flyway hoac Liquibase thay cho `ddl-auto=update`.
