package com.parking.management.api;

import com.parking.management.entity.*;
import com.parking.management.security.JwtProvider;
import com.parking.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    // 1. API Xác thực đăng nhập
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> credentials) {
        User user = userService.authenticate(credentials.get("username"), credentials.get("password"));
        if (user != null) {
            user.setAccessToken(jwtProvider.generateToken(user.getUsername()));
            user.setTokenType("Bearer");
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).build(); // Trả về Unauthorized nếu sai tài khoản/mật khẩu
    }

    @PostMapping("/auth/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            User user = userService.loginWithGoogle(idToken);
            user.setAccessToken(jwtProvider.generateToken(user.getUsername()));
            user.setTokenType("Bearer");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // 2. API Đăng ký tài khoản (Tự động check trùng ở React trước hoặc gộp chung)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String username = user.getUsername() == null ? "" : user.getUsername().trim();
        String email = user.getEmail() == null ? "" : user.getEmail().trim();
        String phoneNumber = user.getPhoneNumber() == null ? "" : user.getPhoneNumber().trim();
        String password = user.getPasswordHash() == null ? "" : user.getPasswordHash();

        if (username.length() < 3 || username.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập phải có từ 3 đến 50 ký tự."));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải có ít nhất 6 ký tự."));
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không đúng định dạng."));
        }
        if (!phoneNumber.isEmpty() && !phoneNumber.matches("^0\\d{9}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."));
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber.isEmpty() ? null : phoneNumber);

        if (userService.checkUsernameDuplicate(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Tên đăng nhập đã được sử dụng."));
        }
        if (userService.isEmailExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email đã được sử dụng."));
        }
        if (user.getPhoneNumber() != null && userService.isPhoneNumberExists(user.getPhoneNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Số điện thoại đã được sử dụng."));
        }

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(user));
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Thông tin đăng ký đã tồn tại. Vui lòng kiểm tra lại."));
        }
    }

    // 3. API Lấy toàn bộ danh sách User
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 4. API Lấy User theo ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // 5. API Admin tạo mới User
    @PostMapping("/create")
    public ResponseEntity<Boolean> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    // 6. API Admin chỉnh sửa User
    @PutMapping("/update/{id}")
    public ResponseEntity<Boolean> updateUser(@PathVariable int id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateDriverProfile(@PathVariable int id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateDriverProfile(id, user);
            return updatedUser != null ? ResponseEntity.ok(updatedUser) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. API Xóa User
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Boolean> deleteUser(@PathVariable int id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }

    // 8. API Đảo trạng thái tài khoản (Khóa/Mở khóa)
    @PatchMapping("/toggle-status/{id}")
    public ResponseEntity<Boolean> toggleStatus(@PathVariable int id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    // 9. API Lấy danh sách Roles phục vụ Dropdown
    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }

    // ============= PHÂN HỆ MA TRẬN PHÂN QUYỀN =============

    // 10. API lấy toàn bộ danh sách phân quyền để vẽ bảng ma trận ở React
    @GetMapping("/permissions")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(userService.getAllPermissions());
    }

    // 11. API lấy các PermissionID mà Role đó đang có để tự động tích chọn checkbox trên React
    @GetMapping("/permissions/role/{roleId}")
    public ResponseEntity<List<Integer>> getPermissionIdsByRole(@PathVariable int roleId) {
        return ResponseEntity.ok(userService.getPermissionIdsByRole(roleId));
    }

    // 12. API Lưu cấu hình ma trận phân quyền mới
    @PostMapping("/permissions/save/{roleId}")
    public ResponseEntity<Boolean> saveRolePermissions(@PathVariable int roleId, @RequestBody List<Integer> permissionIds) {
        return ResponseEntity.ok(userService.saveRolePermissions(roleId, permissionIds));
    }
}
