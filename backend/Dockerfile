# === GIAI ĐOẠN 1: BUILD DỰ ÁN ===
# Sử dụng Image Maven kết hợp với Eclipse Temurin Java 21 chính thức
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# === GIAI ĐOẠN 2: KHỞI CHẠY ỨNG DỤNG ===
# Sử dụng bản JRE Eclipse Temurin Java 21 siêu nhẹ, tối ưu bộ nhớ cho Render
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]