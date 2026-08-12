package com.parking.management.api;

import com.parking.management.entity.Booking;
import com.parking.management.repository.BookingRepository;
import com.parking.management.repository.FloorRepository;
import com.parking.management.repository.SlotRepository;
import com.parking.management.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingRestController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private FloorRepository floorRepository;

    /**
     * GET /api/bookings/by-plate?licensePlate=72H-11111
     * Staff dùng khi check-in: tra booking Confirmed của biển số này
     * Trả về { bookingId, guestToken, userId, slotId, slotCode, status }
     */
    @GetMapping("/by-plate")
    public ResponseEntity<?> getBookingByPlate(@RequestParam String licensePlate) {
        return bookingRepository
                .findActiveBookingByLicensePlate(
                        licensePlate.trim().toUpperCase(),
                        java.time.LocalDateTime.now())
                .map(b -> {
                    java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
                    result.put("bookingId",  b.getBookingId());
                    result.put("userId",     b.getUserId());
                    result.put("guestToken", b.getGuestToken());
                    result.put("slotId",     b.getSlotId());
                    result.put("status",     b.getStatus());
                    result.put("startTime",  b.getStartTime());
                    result.put("endTime",    b.getEndTime());
                    // Lấy thêm slotCode và floorId để hiển thị trên UI
                    slotRepository.findBySlotId(b.getSlotId()).ifPresent(slot -> {
                        result.put("slotCode", slot.getSlotCode());
                        result.put("floorId",  slot.getFloorId());
                        floorRepository.findById(slot.getFloorId())
                                .ifPresent(floor -> result.put("vehicleTypeId", floor.getVehicleTypeId()));
                    });
                    return ResponseEntity.ok(result);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 1. Tạo booking mới
     * POST /api/bookings/create
     * Body: { "userId":4, "vehicleTypeId":1, "licensePlate":"51H-123.45" }
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> body) {
        try {
            Integer userId    = body.get("userId") != null ? ((Number) body.get("userId")).intValue() : null;
            int vehicleTypeId = ((Number) body.get("vehicleTypeId")).intValue();
            String plate      = (String) body.get("licensePlate");
            Integer slotId    = body.get("slotId") != null ? ((Number) body.get("slotId")).intValue() : null;
            java.time.LocalDateTime checkInTime = null;
            if (body.get("checkInTime") != null) {
                checkInTime = java.time.LocalDateTime.parse((String) body.get("checkInTime"));
            }
            java.time.LocalDateTime checkOutTime = null;
            if (body.get("checkOutTime") != null) {
                checkOutTime = java.time.LocalDateTime.parse((String) body.get("checkOutTime"));
            }

            Booking booking = bookingService.createBooking(userId, vehicleTypeId, plate, slotId, checkInTime, checkOutTime);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/guest/create")
    public ResponseEntity<?> createGuestBooking(@RequestBody Map<String, Object> body) {
        try {
            String guestToken  = (String) body.get("guestToken");
            String guestName   = (String) body.get("guestName");
            String guestPhone  = (String) body.get("guestPhone");
            int vehicleTypeId  = ((Number) body.get("vehicleTypeId")).intValue();
            String plate       = (String) body.get("licensePlate");
            Integer slotId    = body.get("slotId") != null ? ((Number) body.get("slotId")).intValue() : null;
            java.time.LocalDateTime checkInTime = null;
            if (body.get("checkInTime") != null) {
                checkInTime = java.time.LocalDateTime.parse((String) body.get("checkInTime"));
            }
            java.time.LocalDateTime checkOutTime = null;
            if (body.get("checkOutTime") != null) {
                checkOutTime = java.time.LocalDateTime.parse((String) body.get("checkOutTime"));
            }

            Booking booking = bookingService.createGuestBooking(guestToken, guestName, guestPhone, vehicleTypeId, plate, slotId, checkInTime, checkOutTime);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm-deposit/{bookingId}")
    public ResponseEntity<?> confirmDeposit(@PathVariable int bookingId) {
        try {
            bookingService.confirmBookingDeposit(bookingId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 2. Lấy danh sách booking của user
     * GET /api/bookings/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getBookingsByUser(@PathVariable int userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    @GetMapping("/guest/{guestToken}")
    public ResponseEntity<List<Map<String, Object>>> getBookingsByGuest(@PathVariable String guestToken) {
        return ResponseEntity.ok(bookingService.getBookingsByGuest(guestToken));
    }


    /**
     * 3. Hủy booking
     * DELETE /api/bookings/cancel/{bookingId}?userId=4
     */
    @DeleteMapping("/cancel/{bookingId}")
    public ResponseEntity<Boolean> cancelBooking(@PathVariable int bookingId,
                                                 @RequestParam int userId) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, userId));
    }

    @DeleteMapping("/guest/cancel/{bookingId}")
    public ResponseEntity<Boolean> cancelGuestBooking(@PathVariable int bookingId,
                                                      @RequestParam String guestToken) {
        return ResponseEntity.ok(bookingService.cancelGuestBooking(bookingId, guestToken));
    }

    /**
     * 4. Chi tiết 1 booking (kèm slotCode)
     * GET /api/bookings/{bookingId}
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingDetail(@PathVariable int bookingId) {
        Map<String, Object> detail = bookingService.getBookingDetail(bookingId);
        return detail != null ? ResponseEntity.ok(detail) : ResponseEntity.notFound().build();
    }

    @GetMapping("/staff/confirmed")
    public ResponseEntity<List<Map<String, Object>>> getConfirmedBookingsForStaff() {
        return ResponseEntity.ok(bookingService.getConfirmedBookingsForStaff());
    }

    @GetMapping("/checkin-capacity-warning")
    public ResponseEntity<Map<String, Object>> getCheckinCapacityWarning(@RequestParam int vehicleTypeId) {
        return ResponseEntity.ok(bookingService.getCheckinCapacityWarning(vehicleTypeId));
    }
}
