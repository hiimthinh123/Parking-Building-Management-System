package com.parking.management.service.impl;

import com.parking.management.entity.PricePolicy;
import com.parking.management.repository.PricePolicyRepository;
import com.parking.management.service.PricePolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PricePolicyServiceImpl implements PricePolicyService {

    @Autowired
    private PricePolicyRepository pricePolicyRepository;

    @Override
    @Transactional
    public boolean updatePricePolicy(PricePolicy policy) {
        PricePolicy existing = pricePolicyRepository.findByVehicleTypeId(policy.getVehicleTypeId()).orElse(null);

        if (existing != null) {
            // Giữ PK để JPA chạy UPDATE thay vì INSERT
            policy.setPolicyId(existing.getPolicyId());

            // Giữ nguyên overtimeRate và lostTicketPenalty từ DB nếu request không gửi lên
            // (Frontend ManagerTariff chỉ gửi basePrice + hourlyRate)
            if (policy.getOvertimeRate() == null) {
                policy.setOvertimeRate(existing.getOvertimeRate());
            }
            if (policy.getLostTicketPenalty() == null) {
                policy.setLostTicketPenalty(existing.getLostTicketPenalty());
            }

            // Bug 1 FIX: dùng floatToIntBits để so sánh giá trị Float wrapper an toàn, tránh NPE
            boolean baseSame     = safeFloatEquals(existing.getBasePrice(),         policy.getBasePrice());
            boolean hourlySame   = safeFloatEquals(existing.getHourlyRate(),        policy.getHourlyRate());
            boolean overtimeSame = safeFloatEquals(existing.getOvertimeRate(),      policy.getOvertimeRate());
            boolean penaltySame  = safeFloatEquals(existing.getLostTicketPenalty(), policy.getLostTicketPenalty());

            if (baseSame && hourlySame && overtimeSame && penaltySame) {
                return false; // không có gì thay đổi
            }
        }

        // effectiveDate luôn cập nhật ngày hiện tại khi thực sự có thay đổi
        if (policy.getEffectiveDate() == null) {
            policy.setEffectiveDate(java.time.LocalDate.now());
        }

        pricePolicyRepository.save(policy);
        return true;
    }

    // So sánh Float wrapper an toàn: null == null → true, null != value → false
    private boolean safeFloatEquals(Float a, Float b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return Float.floatToIntBits(a) == Float.floatToIntBits(b);
    }

    @Override
    public PricePolicy getPricePolicyByVehicleType(int vehicleTypeId) {
        // 🌟 SỬA TẠI ĐÂY: Tìm đúng theo cột VehicleTypeID thay vì tìm theo Khóa chính của bảng
        Optional<PricePolicy> policyOptional = pricePolicyRepository.findByVehicleTypeId(vehicleTypeId);
        return policyOptional.orElse(null);
    }

    @Override
    public int cleanUpOldPolicies() {
        return pricePolicyRepository.deleteOldPolicies();
    }

    @Override
    public List<PricePolicy> getAllPricePolicies() {
        // JpaRepository đã có sẵn hàm findAll(), chỉ cần gọi ra
        return pricePolicyRepository.findAll();
    }
}