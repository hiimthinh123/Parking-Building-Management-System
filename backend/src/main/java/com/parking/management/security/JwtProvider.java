package com.parking.management.security; // Thay bằng tên package thực tế của bạn

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component // ◄ Bắt buộc phải có để Spring nhận diện được Bean này
public class JwtProvider {

    // Khởi tạo secret key an toàn cho thuật toán mã hóa HS256
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long jwtExpirationMs = 86400000; // Token có hạn trong 1 ngày

    // Hàm tạo chuỗi JWT khi đăng nhập thành công bằng tài khoản thường
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    // Hàm kiểm tra tính hợp lệ của Token hệ thống
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Hàm trích xuất Username từ Token ra để xử lý nghiệp vụ
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
}