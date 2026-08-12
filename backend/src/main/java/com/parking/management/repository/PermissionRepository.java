package com.parking.management.repository;

import com.parking.management.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    // Kế thừa findAll() xếp theo thứ tự mặc định ID
}