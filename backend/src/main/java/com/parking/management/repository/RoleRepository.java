package com.parking.management.repository;

import com.parking.management.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    // Lấy danh sách PermissionID mà 1 Role đang sở hữu trong bảng trung gian RolePermission
    @Query(value = "SELECT PermissionID FROM RolePermission WHERE RoleID = :roleId", nativeQuery = true)
    List<Integer> findPermissionIdsByRole(@Param("roleId") int roleId);

    // Xóa toàn bộ quyền của 1 Role trong bảng trung gian
    @Modifying
    @Query(value = "DELETE FROM RolePermission WHERE RoleID = :roleId", nativeQuery = true)
    void deleteRolePermissions(@Param("roleId") int roleId);

    // Chèn quyền mới vào bảng trung gian
    @Modifying
    @Query(value = "INSERT INTO RolePermission (RoleID, PermissionID) VALUES (:roleId, :permissionId)", nativeQuery = true)
    void insertRolePermission(@Param("roleId") int roleId, @Param("permissionId") int permissionId);
}