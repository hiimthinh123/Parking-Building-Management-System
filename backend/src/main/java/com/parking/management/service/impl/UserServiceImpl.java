package com.parking.management.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.parking.management.entity.*;
import com.parking.management.repository.*;
import com.parking.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    private final String GOOGLE_CLIENT_ID = "850421414212-pa96p4s13gfn8bgavvh879d1gb01s1pc.apps.googleusercontent.com";

    @Override
    public User authenticate(String username, String plainPassword) {
        User user = userRepository
                .findByUsernameAndPasswordHashAndStatus(username, plainPassword, 1)
                .orElse(null);

        // Thêm đoạn này
        if (user != null) {
            roleRepository.findById(user.getRoleId())
                    .ifPresent(role -> user.setRoleName(role.getRoleName()));
        }
        return user;
    }

    @Override
    public boolean checkUsernameDuplicate(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean isPhoneNumberExists(String phoneNumber) {
        return phoneNumber != null && !phoneNumber.trim().isEmpty() && userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public boolean registerUser(User user) {
        user.setRoleId(4); // Mặc định là Driver giống code cũ
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(1);
        userRepository.save(user);
        return true;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(int userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @Override
    public boolean createUser(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(1);
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean updateUser(int userId, User userDetails) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(userDetails.getFullName());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            user.setEmail(userDetails.getEmail());
            user.setRoleId(userDetails.getRoleId());
            userRepository.save(user);
            return true;
        }
        return false;
    }

@Transactional
@Override
public User updateDriverProfile(int userId, User userDetails) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null || user.getRoleId() == null || user.getRoleId() != 4) return null;

    String email = userDetails.getEmail() == null ? "" : userDetails.getEmail().trim();
    String phone = userDetails.getPhoneNumber() == null ? "" : userDetails.getPhoneNumber().trim();
    if (email.isEmpty() || phone.isEmpty()
            || userRepository.existsByEmailAndUserIdNot(email, userId)
            || userRepository.existsByPhoneNumberAndUserIdNot(phone, userId)) {
        throw new IllegalArgumentException("Email hoặc số điện thoại đã được sử dụng.");
    }

    user.setFullName(userDetails.getFullName() == null ? "" : userDetails.getFullName().trim());
    user.setEmail(email);
    user.setPhoneNumber(phone);
    if (userDetails.getPasswordHash() != null && !userDetails.getPasswordHash().isBlank()) {
        user.setPasswordHash(userDetails.getPasswordHash());
    }
    userRepository.save(user);
    roleRepository.findById(user.getRoleId()).ifPresent(role -> user.setRoleName(role.getRoleName()));
    return user;
}

    @Override
    @Transactional
    public boolean deleteUser(int userId) {
        try {
            userRepository.deleteById(userId);
            return true;
        } catch (Exception e) {
            System.err.println("Lỗi xóa user (có thể dính FK): " + e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public boolean toggleUserStatus(int userId) {
        return userRepository.toggleUserStatus(userId) > 0;
    }

    @Override
    public int countByRole(int roleId) {
        // Viết nhanh bằng cách đếm danh sách lọc
        return (int) userRepository.findAll().stream().filter(u -> u.getRoleId() == roleId).count();
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public User loginWithGoogle(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                .build();
        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new RuntimeException("Mã xác thực Google không hợp lệ!");
        }
        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(email.split("@")[0] + "_" + System.currentTimeMillis()); // Tạo username ngẫu nhiên không trùng
            newUser.setEmail(email);
            newUser.setPasswordHash("123");
            newUser.setFullName(name);
            newUser.setRoleId(4);
            newUser.setStatus(1);
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });
    }

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public List<Integer> getPermissionIdsByRole(int roleId) {
        return roleRepository.findPermissionIdsByRole(roleId);
    }

    @Override
    @Transactional // Thay thế quản lý Transaction thủ công bằng batch
    public boolean saveRolePermissions(int roleId, List<Integer> permissionIds) {
        if (roleId == 1) return true; // Giữ nguyên logic cũ: Admin luôn giữ full quyền

        roleRepository.deleteRolePermissions(roleId);

        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (int pid : permissionIds) {
                roleRepository.insertRolePermission(roleId, pid);
            }
        }
        return true;
    }
}
