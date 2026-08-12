package com.parking.management.api;

import com.parking.management.entity.Feedback;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.repository.SlotRepository;
import com.parking.management.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackRestController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private SlotRepository slotRepository;

    /**
     * Tra cứu vị trí xe đang đỗ theo biển số — dùng cho chức năng "Khó Tìm Xe"
     * GET /api/feedback/find-vehicle?licensePlate=51H-123.45
     * - Trả về slotCode + floorName nếu xe đang có Active session
     * - Trả về 404 + thông báo nếu không tìm thấy
     */
    @GetMapping("/find-vehicle")
    public ResponseEntity<?> findVehicle(@RequestParam String licensePlate) {
        String plate = licensePlate == null ? "" : licensePlate.trim().toUpperCase();
        if (plate.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập biển số xe."));

        return parkingRepository.findActiveSessionByLicensePlate(plate)
                .map(session -> {
                    Map<String, Object> result = new java.util.LinkedHashMap<>();
                    result.put("licensePlate", session.getLicensePlate());
                    result.put("slotId",       session.getSlotId());
                    result.put("checkInTime",  session.getCheckInTime());

                    // Lấy slotCode từ Slots table
                    slotRepository.findBySlotId(session.getSlotId()).ifPresent(slot -> {
                        result.put("slotCode", slot.getSlotCode());
                        result.put("floorId",  slot.getFloorId());
                    });
                    return ResponseEntity.ok(result);
                })
                .orElseGet(() -> ResponseEntity
                        .status(404)
                        .body(Map.of("error",
                                "Sai biển số xe/ Xe không tồn tại trong bãi. Vui lòng nhập lại !!!"))
                );
    }

    /**
     * 1. Gửi feedback / support ticket
     * POST /api/feedback/submit
     * Body: { "userId":4, "category":"LostCard", "description":"Tôi bị mất thẻ tầng 1 lô A" }
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body) {
        try {
            Integer userId   = body.get("userId") != null ? ((Number) body.get("userId")).intValue() : null;
            String category  = (String) body.get("category");
            String licensePlate = (String) body.get("licensePlate");
            String desc      = (String) body.get("description");

            if (category == null || desc == null || desc.trim().isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "Category và mô tả không được để trống."));

            Feedback feedback = feedbackService.submitFeedback(userId, category, licensePlate, desc.trim());
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/guest/submit")
    public ResponseEntity<?> submitGuestFeedback(@RequestBody Map<String, Object> body) {
        try {
            String guestToken = (String) body.get("guestToken");
            String guestName  = (String) body.get("guestName");
            String guestPhone = (String) body.get("guestPhone");
            String category   = (String) body.get("category");
            String licensePlate = (String) body.get("licensePlate");
            String desc       = (String) body.get("description");

            if (category == null || desc == null || desc.trim().isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "Category va mo ta khong duoc de trong."));

            Feedback feedback = feedbackService.submitGuestFeedback(guestToken, guestName, guestPhone, category, licensePlate, desc.trim());
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Lấy lịch sử feedback của user
     * GET /api/feedback/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByUser(@PathVariable int userId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByUser(userId));
    }

    @GetMapping("/guest/{guestToken}")
    public ResponseEntity<List<Feedback>> getFeedbacksByGuest(@PathVariable String guestToken) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByGuest(guestToken));
    }


    @GetMapping("/manager")
    public ResponseEntity<List<Feedback>> getManagerFeedbacks() {
        return ResponseEntity.ok(feedbackService.getFeedbacksByAssignee("MANAGER"));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<Feedback>> getStaffFeedbacks() {
        return ResponseEntity.ok(feedbackService.getFeedbacksByAssignee("STAFF"));
    }
}