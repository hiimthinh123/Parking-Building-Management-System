package com.parking.management.repository;

import com.parking.management.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Integer> {

    // Lấy tất cả floors theo vehicleTypeId
    List<Floor> findByVehicleTypeId(int vehicleTypeId);
}