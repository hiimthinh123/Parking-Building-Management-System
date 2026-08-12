package com.parking.management.repository;

import com.parking.management.entity.PricePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PricePolicyRepository extends JpaRepository<PricePolicy, Integer> {

    // Kiểm tra trùng lặp thông số chính sách giá (Thay thế câu lệnh SQL sqlSelect cũ)
    boolean existsByVehicleTypeIdAndBasePriceAndHourlyRate(int vehicleTypeId, float basePrice, float hourlyRate);
    Optional<PricePolicy> findByVehicleTypeId(int vehicleTypeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PricePolicy p WHERE p.policyId < (SELECT MAX(p2.policyId) FROM PricePolicy p2 WHERE p2.vehicleTypeId = p.vehicleTypeId)")
    int deleteOldPolicies();
}