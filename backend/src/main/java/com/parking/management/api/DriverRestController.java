package com.parking.management.api;

import com.parking.management.entity.ParkingSession;
import com.parking.management.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@CrossOrigin(origins = "*")
public class DriverRestController {

    @Autowired
    private DriverService driverService;

    /**
     * 1. Thông tin bãi đỗ xe + slot trống real-time + bảng giá
     * GET /api/driver/parking-info
     */
    @GetMapping("/parking-info")
    public ResponseEntity<Map<String, Object>> getParkingLotInfo() {
        return ResponseEntity.ok(driverService.getParkingLotInfo());
    }

    /**
     * 2 & 4. Active session của user (kèm phí dự kiến tại thời điểm gọi API)
     * GET /api/driver/active-session/{userId}
     * Trả về null nếu không có session đang hoạt động
     */
    @GetMapping("/active-session/{userId}")
    public ResponseEntity<?> getActiveSession(@PathVariable int userId) {
        Map<String, Object> session = driverService.getActiveSession(userId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.noContent().build();
    }

    @GetMapping("/guest/active-session/{guestToken}")
    public ResponseEntity<?> getGuestActiveSession(@PathVariable String guestToken) {
        Map<String, Object> session = driverService.getGuestActiveSession(guestToken);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.noContent().build();
    }

    /**
     * 3. Lịch sử các lần gửi xe
     * GET /api/driver/sessions/{userId}
     */
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<List<ParkingSession>> getSessionHistory(@PathVariable int userId) {
        return ResponseEntity.ok(driverService.getSessionHistory(userId));
    }

    @GetMapping("/guest/sessions/{guestToken}")
    public ResponseEntity<List<ParkingSession>> getGuestSessionHistory(@PathVariable String guestToken) {
        return ResponseEntity.ok(driverService.getGuestSessionHistory(guestToken));
    }

    /**
     * 5. Thanh toán
     * POST /api/driver/payment
     * Body: { "sessionId": 5, "paymentMethod": "MoMo" }
     */
    @PostMapping("/payment")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> body) {
        int sessionId       = (int) body.get("sessionId");
        String paymentMethod = body.containsKey("paymentMethod") ? (String) body.get("paymentMethod") : "Cash";
        return ResponseEntity.ok(driverService.processPayment(sessionId, paymentMethod));
    }

    @PostMapping("/guest/payment")
    public ResponseEntity<Map<String, Object>> processGuestPayment(@RequestBody Map<String, Object> body) {
        int sessionId        = ((Number) body.get("sessionId")).intValue();
        String guestToken    = (String) body.get("guestToken");
        String paymentMethod = body.containsKey("paymentMethod") ? (String) body.get("paymentMethod") : "Cash";
        return ResponseEntity.ok(driverService.processGuestPayment(sessionId, guestToken, paymentMethod));
    }
}
