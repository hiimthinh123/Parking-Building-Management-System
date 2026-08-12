package com.parking.management.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userId;

    @Column(name = "RoleID")
    private Integer roleId;

    @Column(name = "Username", nullable = false, unique = true, length = 50)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "PasswordHash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "FullName", length = 100)
    private String fullName;

    @Column(name = "PhoneNumber", length = 15)
    private String phoneNumber;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "Status")
    private Integer status;

    @Transient // 🌟 THẦN CHÚ: Giúp giữ lại biến để truyền dữ liệu lên React nhưng không map vào bảng Users trong DB
    private String roleName;

    @Transient
    private String accessToken;

    @Transient
    private String tokenType;
}
