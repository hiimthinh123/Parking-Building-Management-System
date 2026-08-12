package com.parking.management.repository;

import com.parking.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // 1. Phục vụ hàm authenticate (So khớp Username, Password thuần và Status = 1)
    Optional<User> findByUsernameAndPasswordHashAndStatus(String username, String passwordHash, int status);


    // 2. Các hàm kiểm tra trùng lặp tự động bằng Derived Query
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByEmail(String email);
    boolean existsByEmailAndUserIdNot(String email, Integer userId);
    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, Integer userId);

    // 3. Hàm đảo ngược Status (Toggle Status) bằng câu lệnh UPDATE Native
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE Users SET Status = CASE WHEN Status = 1 THEN 0 ELSE 1 END WHERE UserID = :userId", nativeQuery = true)
    int toggleUserStatus(@Param("userId") int userId);
}