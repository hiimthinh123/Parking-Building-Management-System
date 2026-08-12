package com.parking.management.repository;

import com.parking.management.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Lấy tất cả booking của 1 user, mới nhất trước
    List<Booking> findByUserIdOrderByStartTimeDesc(int userId);

    List<Booking> findByGuestTokenOrderByStartTimeDesc(String guestToken);

    // Lấy booking đang active của 1 user (Confirmed và chưa hết giờ endTime)
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.status = 'Confirmed' AND b.endTime > :now")
    List<Booking> findActiveBookingsByUser(@Param("userId") int userId, @Param("now") LocalDateTime now);

    // Tìm booking đang giữ slot cụ thể
    Optional<Booking> findBySlotIdAndStatus(int slotId, String status);

    Optional<Booking> findByBookingIdAndGuestToken(int bookingId, String guestToken);

    Optional<Booking> findFirstByLicensePlateAndStatusOrderByBookingIdDesc(String licensePlate, String status);

    Optional<Booking> findFirstByLicensePlateAndStatusAndEndTimeAfterOrderByBookingIdDesc(String licensePlate, String status, LocalDateTime now);

    // Tra booking Confirmed đang còn hiệu lực theo biển số — dùng cho Staff check-in
    @Query("SELECT b FROM Booking b WHERE b.licensePlate = :plate AND b.status = 'Confirmed' AND b.endTime > :now ORDER BY b.startTime ASC")
    Optional<Booking> findActiveBookingByLicensePlate(@Param("plate") String plate, @Param("now") java.time.LocalDateTime now);

    // Lấy các booking đã hết hạn nhưng chưa bị cancel (để scheduler tự động hủy)
    @Query("SELECT b FROM Booking b WHERE b.status = 'Confirmed' AND b.endTime < :now")
    List<Booking> findExpiredBookings(@Param("now") LocalDateTime now);

    // Kiểm tra xe đã có booking Confirmed hoặc PendingPayment chưa (BR-11)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.licensePlate = :plate AND b.status = 'Confirmed' AND b.endTime > :now")
    boolean existsActiveBookingByLicensePlate(@Param("plate") String plate, @Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.status = 'Confirmed' AND b.endTime > :now ORDER BY b.startTime ASC")
    List<Booking> findUpcomingConfirmedBookings(@Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('Confirmed', 'CheckedIn') AND b.endTime > :now ORDER BY b.startTime ASC")
    List<Booking> findVisibleStaffBookings(@Param("now") LocalDateTime now);
}
