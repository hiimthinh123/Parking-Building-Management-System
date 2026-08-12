package com.parking.management.repository;

import com.parking.management.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Transactional(rollbackFor = Exception.class)
@Repository
public interface ParkingRepository extends JpaRepository<ParkingSession, Integer> {

    @Query(value = "SELECT "
            + "  COUNT(CASE WHEN CheckInTime < DATEADD(HOUR, 6, CAST(:targetDate AS DATETIME)) THEN 1 END) AS Before6h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 6, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 8, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From6to8h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 8, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 10, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From8to10h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 10, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 12, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From10to12h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 12, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 14, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From12to14h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 14, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 16, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From14to16h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 16, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 18, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From16to18h, "
            + "  COUNT(CASE WHEN CheckInTime >= DATEADD(HOUR, 18, CAST(:targetDate AS DATETIME)) AND CheckInTime < DATEADD(HOUR, 24, CAST(:targetDate AS DATETIME)) THEN 1 END) AS From18to20h "
            + "FROM ParkingSessions "
            + "WHERE CheckInTime >= CAST(:targetDate AS DATETIME) "
            + "  AND CheckInTime < DATEADD(DAY, 1, CAST(:targetDate AS DATETIME))", nativeQuery = true)
    List<Object[]> getCheckInTrafficByMilestones(LocalDate targetDate);

    @Query(value = "SELECT "
            + "  COUNT(CASE WHEN CheckOutTime < DATEADD(HOUR, 6, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutBefore6h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 6, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 8, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom6to8h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 8, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 10, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom8to10h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 10, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 12, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom10to12h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 12, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 14, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom12to14h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 14, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 16, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom14to16h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 16, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 18, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom16to18h, "
            + "  COUNT(CASE WHEN CheckOutTime >= DATEADD(HOUR, 18, CAST(:targetDate AS DATETIME)) AND CheckOutTime < DATEADD(HOUR, 24, CAST(:targetDate AS DATETIME)) THEN 1 END) AS OutFrom18to20h "
            + "FROM ParkingSessions "
            + "WHERE CheckOutTime >= CAST(:targetDate AS DATETIME) "
            + "  AND CheckOutTime < DATEADD(DAY, 1, CAST(:targetDate AS DATETIME))", nativeQuery = true)
    List<Object[]> getCheckOutTrafficByMilestones(LocalDate targetDate);

    @Query("SELECT p FROM ParkingSession p WHERE p.licensePlate = :licensePlate AND LOWER(p.sessionStatus) = 'active'")
    Optional<ParkingSession> findActiveSessionByLicensePlate(@Param("licensePlate") String licensePlate);

    List<ParkingSession> findTop30ByOrderByCheckInTimeDesc();

    // 1. Dành cho hàm getActiveSession — dùng LOWER để tránh case mismatch Active/ACTIVE
    @Query("SELECT p FROM ParkingSession p WHERE p.userId = :userId AND LOWER(p.sessionStatus) = 'active'")
    Optional<ParkingSession> findActiveSessionByUserId(@Param("userId") int userId);

    // 2. Dành cho hàm getSessionHistory
    List<ParkingSession> findByUserIdOrderByCheckInTimeDesc(int userId);

    @Query("SELECT p FROM ParkingSession p WHERE p.guestToken = :guestToken AND LOWER(p.sessionStatus) = 'active'")
    Optional<ParkingSession> findActiveSessionByGuestToken(@Param("guestToken") String guestToken);

    List<ParkingSession> findByGuestTokenOrderByCheckInTimeDesc(String guestToken);
}