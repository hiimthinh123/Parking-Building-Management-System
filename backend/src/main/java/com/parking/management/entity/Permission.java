package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Permissions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PermissionID")
    private Integer permissionId;

    @Column(name = "PermissionKey", nullable = false, length = 100)
    private String permissionKey;   // VD: "manage_users"

    @Column(name = "PermissionName", nullable = false, length = 150)
    private String permissionName;  // VD: "Quản lý tài khoản người dùng"

    @Column(name = "Icon", length = 50)
    private String icon;            // FontAwesome class
}