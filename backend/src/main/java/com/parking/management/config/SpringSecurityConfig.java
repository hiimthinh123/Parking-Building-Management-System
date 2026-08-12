package com.parking.management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SpringSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt tính năng chống giả mạo request (CSRF) để React gọi API mượt mà
                .csrf(csrf -> csrf.disable())

                // 2. Cho phép toàn bộ request đi qua tầng Spring Security mặc định
                // (Vì chúng ta đã có SecurityAuthFilter của riêng mình tự check Token ở ngoài rồi)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )

                // 3. Tắt Form Login mặc định (Cái giao diện đăng nhập màu xanh của Spring)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}