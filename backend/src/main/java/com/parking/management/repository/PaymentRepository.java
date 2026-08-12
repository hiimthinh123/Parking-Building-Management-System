package com.parking.management.repository;

import com.parking.management.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findFirstBySessionIdOrderByPaymentTimeDesc(int sessionId);

    Optional<Payment> findFirstByBookingIdOrderByPaymentTimeDesc(int bookingId);

    // Vấn đề 4: dùng để webhook tìm Payment theo orderCode PayOS gửi về
    Optional<Payment> findByOrderId(String orderId);

    boolean existsBySessionIdAndStatus(int sessionId, String status);


    @Query(value = "SELECT "
            + "  COALESCE(SUM(p.Amount), 0) AS TotalRevenue, "
            + "  COALESCE(SUM(CASE WHEN ps.VehicleTypeID = 2 THEN p.Amount ELSE 0 END), 0) AS CarRevenue, "
            + "  COALESCE(SUM(CASE WHEN ps.VehicleTypeID = 1 THEN p.Amount ELSE 0 END), 0) AS BikeRevenue "
            + "FROM Payments p "
            + "INNER JOIN ParkingSessions ps ON p.SessionID = ps.SessionID "
            + "WHERE p.Status = 'SUCCESS' "
            + "AND CAST(p.PaymentTime AS DATE) = CAST(GETDATE() AS DATE)", nativeQuery = true)
    List<Object[]> getDailyRevenue();

}