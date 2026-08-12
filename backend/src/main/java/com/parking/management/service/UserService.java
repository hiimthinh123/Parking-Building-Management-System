package com.parking.management.service;

import com.parking.management.entity.*;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

public interface UserService {
    // Phân hệ A: Quản lý tài khoản & Xác thực
    User authenticate(String username, String plainPassword);
    boolean checkUsernameDuplicate(String username);
    boolean isEmailExists(String email);
    boolean isPhoneNumberExists(String phoneNumber);
    boolean registerUser(User user);
    List<User> getAllUsers();
    User getUserById(int userId);
    boolean createUser(User user);
    boolean updateUser(int userId, User userDetails);
    User updateDriverProfile(int userId, User userDetails);
    boolean deleteUser(int userId);
    boolean toggleUserStatus(int userId);
    int countByRole(int roleId);
    List<Role> getAllRoles();
    User loginWithGoogle(String idTokenString) throws GeneralSecurityException, IOException;

    // Phân hệ B: Ma trận phân quyền
    List<Permission> getAllPermissions();
    List<Integer> getPermissionIdsByRole(int roleId);
    boolean saveRolePermissions(int roleId, List<Integer> permissionIds);
}