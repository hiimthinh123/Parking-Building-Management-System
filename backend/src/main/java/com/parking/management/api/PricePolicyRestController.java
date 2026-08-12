package com.parking.management.api;

import com.parking.management.entity.PricePolicy;
import com.parking.management.service.PricePolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-policies")
@CrossOrigin(origins = "*") // Ngăn lỗi chặn bảo mật CORS giúp React ở cổng 5173/3000 kết nối mượt mà
public class PricePolicyRestController {

    @Autowired
    private PricePolicyService pricePolicyService;

    /**
     * 1. API lấy thông tin chính sách giá dựa trên loại phương tiện
     * Endpoint: GET http://localhost:8080/api/price-policies/vehicle-type/{vehicleTypeId}
     * Trả về chuỗi cấu trúc JSON biểu phí cho React đọc
     */
    @GetMapping("/vehicle-type/{vehicleTypeId}")
    public ResponseEntity<PricePolicy> getPricePolicyByVehicleType(@PathVariable int vehicleTypeId) {
        PricePolicy policy = pricePolicyService.getPricePolicyByVehicleType(vehicleTypeId);
        if (policy != null) {
            return ResponseEntity.ok(policy);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<PricePolicy>> getAllPricePolicies() {
        List<PricePolicy> list = pricePolicyService.getAllPricePolicies();
        return ResponseEntity.ok(list);
    }

    /**
     * 2. API cập nhật biểu phí mới có cơ chế kiểm tra trùng lặp thông số
     * Endpoint: POST http://localhost:8080/api/price-policies/update
     * Dữ liệu truyền từ Form React lên nằm trong Body dưới dạng JSON:
     * {
     * "vehicleTypeId": 1,
     * "basePrice": 5000,
     * "hourlyRate": 2000,
     * "overtimeRate": 1000,
     * "effectiveDate": "2026-06-16"
     * }
     */
    @PostMapping("/update")
    public ResponseEntity<Boolean> updatePricePolicy(@RequestBody PricePolicy policy) {
        boolean isSuccess = pricePolicyService.updatePricePolicy(policy);
        if(isSuccess){
            pricePolicyService.cleanUpOldPolicies();
        }
        return ResponseEntity.ok(isSuccess);
    }

}