package com.parking.management.repository;

import com.parking.management.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Integer> {

    @Query("SELECT s FROM Slot s WHERE s.floorId = :floorId AND (s.deleted = false OR s.deleted IS NULL)")
    List<Slot> findByFloorId(@Param("floorId") int floorId);

    @Query("SELECT s FROM Slot s WHERE s.deleted = false OR s.deleted IS NULL")
    List<Slot> findActiveSlots();

    Optional<Slot> findBySlotCode(String slotCode);
    Optional<Slot> findFirstBySlotCode(String slotCode);
    Optional<Slot> findFirstBySlotCodeAndFloorId(String slotCode, int floorId);
    Optional<Slot> findBySlotId(int slotId);

    @Query("SELECT COUNT(s) > 0 FROM Slot s WHERE s.slotCode = :slotCode AND s.floorId = :floorId AND (s.deleted = false OR s.deleted IS NULL)")
    boolean existsActiveBySlotCodeAndFloorId(@Param("slotCode") String slotCode, @Param("floorId") int floorId);

    @Query("SELECT COUNT(s) > 0 FROM Slot s WHERE s.slotCode = :slotCode AND s.floorId = :floorId AND s.slotId <> :slotId AND (s.deleted = false OR s.deleted IS NULL)")
    boolean existsActiveBySlotCodeAndFloorIdAndSlotIdNot(@Param("slotCode") String slotCode, @Param("floorId") int floorId, @Param("slotId") int slotId);

    @Query("SELECT COUNT(s) FROM Slot s WHERE s.status = :status AND s.floorId = :floorId AND (s.deleted = false OR s.deleted IS NULL)")
    int countByStatusAndFloorId(@Param("status") String status, @Param("floorId") int floorId);

    @Modifying
    @Transactional // Bắt buộc phải có để Spring cho phép ghi dữ liệu
    @Query("UPDATE Slot s SET s.slotCode = :newSlotCode WHERE s.slotId = :slotId")
    int updateSlotCodeById(@Param("slotId") int slotId, @Param("newSlotCode") String newSlotCode);

    // Floor.VehicleTypeID is the source of truth for which vehicle type may use a slot.
    // This prevents a misnamed slot code (for example XM-* on a car floor) from being allocated.
    @Query("SELECT s FROM Slot s, Floor f " +
            "WHERE s.floorId = f.floorId " +
            "AND (s.deleted = false OR s.deleted IS NULL) " +
            "AND TRIM(LOWER(s.status)) = 'available' " +
            "AND f.vehicleTypeId = :vehicleTypeId")
    List<Slot> findAvailableSlotsByVehicleType(@Param("vehicleTypeId") int vehicleTypeId);

    @Query(value = "SELECT " +
            "  COUNT(CASE WHEN Status = 'Available' THEN 1 END) AS TotalAvailable, " +
            "  COUNT(CASE WHEN Status = 'Occupied' THEN 1 END) AS TotalOccupied, " +
            "  COUNT(CASE WHEN Status = 'Booked' THEN 1 END) AS TotalBooked, " +
            "  COUNT(CASE WHEN Status = 'Maintenance' OR Status = 'Locked' THEN 1 END) AS TotalMaintenance " +
            "FROM Slots " +
            "WHERE FloorID = :floorId AND (IsDeleted = 0 OR IsDeleted IS NULL)", nativeQuery = true)
    List<Object[]> getSlotCountByStatusAndFloor(@Param("floorId") int floorId);

    @Query(value = "SELECT " +
            "  COUNT(CASE WHEN Status = 'Occupied' THEN 1 END) AS TotalOccupied, " +
            "  COUNT(CASE WHEN Status = 'Available' THEN 1 END) AS TotalAvailable, " +
            "  COUNT(CASE WHEN Status = 'Booked' THEN 1 END) AS TotalBooked, " +
            "  COUNT(CASE WHEN Status = 'Maintenance' THEN 1 END) AS TotalMaintenance " +
            "FROM Slots WHERE IsDeleted = 0 OR IsDeleted IS NULL", nativeQuery = true)
    List<Object[]> getAllFloorsSlotCountByStatus();


}
