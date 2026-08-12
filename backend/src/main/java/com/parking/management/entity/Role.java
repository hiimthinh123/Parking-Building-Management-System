package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Roles") // Ánh xạ với bảng Roles trong DB
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleID") // Ánh xạ với cột khóa chính RoleID
    private Integer roleId;

    @Column(name = "RoleName", nullable = false, length = 50)
    private String roleName; // Admin, Manager, Staff, Driver
}