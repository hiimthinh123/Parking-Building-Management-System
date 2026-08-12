package com.parking.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class SecurityAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider; // File JwtProvider xử lý token thường bạn đã tạo

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.startsWith("/api/users/login")
                || path.startsWith("/api/users/register")
                || path.startsWith("/api/users/auth/google")
                || path.startsWith("/api/driver/parking-info")
                || path.startsWith("/api/driver/guest/active-session/")
                || path.startsWith("/api/driver/guest/session/")
                || path.startsWith("/api/bookings/guest/")
                || path.startsWith("/api/feedback/find-vehicle")
                || path.startsWith("/api/feedback/guest/")
                || path.startsWith("/api/payments/create-qr")
                || path.startsWith("/api/payments/status/")
                || path.startsWith("/api/payments/webhook");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 🔓 1. Đăng ký các cổng API CÔNG KHAI (Không chặn)
        // 🔒 2. Đối với các API BẢO MẬT (nhập xe, xuất xe...)
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorizedError(response, "Thiếu token thông hành (Hợp lệ)! Access Denied.");
            return;
        }

        String token = authHeader.substring(7);

        try {
            boolean isAuthenticated = jwtProvider.validateToken(token);
            String identifier = isAuthenticated ? jwtProvider.getUsernameFromToken(token) : null;

            if (isAuthenticated && identifier != null) {
                // Tạo đối tượng Authentication chuẩn của Spring Security
                // Cấp một danh sách quyền rỗng (Collections.emptyList()) để đánh dấu User hợp lệ
                org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication =
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                identifier, null, java.util.Collections.emptyList()
                        );

                // Nạp thẳng vào hệ thống để các Controller bên dưới có thể đọc được ngay
                org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);

                // (Tùy chọn) Dự phòng thêm vào attribute request nếu code cũ dùng HttpServletRequest
                request.setAttribute("authenticatedUser", identifier);

                filterChain.doFilter(request, response);
            } else {
                sendUnauthorizedError(response, "Token không hợp lệ hoặc đã hết hạn!");
            }

        } catch (Exception e) {
            sendUnauthorizedError(response, "Lỗi xác thực hệ thống: " + e.getMessage());
        }
    }

    // Hàm phụ trợ trả về mã lỗi 401 nhanh gọn chuẩn RESTful
    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, X-Requested-With");

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"" + message + "\"}");
    }
}
