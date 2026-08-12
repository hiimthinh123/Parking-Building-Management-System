package com.parking.management.service.impl;

import com.parking.management.entity.*;
import com.parking.management.repository.*;
import com.parking.management.service.DriverService;
import com.parking.management.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DriverServiceImpl implements DriverService {

    @Autowired private ParkingRepository     parkingRepository;
    @Autowired private SlotRepository        slotRepository;
    @Autowired private PaymentRepository     paymentRepository;
    @Autowired private PricePolicyRepository pricePolicyRepository;
    @Autowired private VehicleTypeRepository vehicleTypeRepository;
    @Autowired private BookingService        bookingService;

    // ──────────────────────────────────────────────────────────
    // Feature 1: Thông tin bãi đỗ xe
    // ──────────────────────────────────────────────────────────
    @Override
    public Map<String, Object> getParkingLotInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("operatingHours", "06:00 - 22:00 (Thứ Hai - Chủ Nhật)");
        info.put("address",        "Khu vực nội khu - Tòa nhà Parking Building");
        info.put("hotline",        "1900 xxxx");
        info.put("regulations", List.of(
                "Giữ nguyên vị trí đã đặt, không tự ý đổi chỗ.",
                "Không đỗ xe tràn ra khu vực đường đi.",
                "Giữ thẻ xe cẩn thận, mất thẻ phạt 100.000đ.",
                "Booking hết hạn sau 30 phút nếu chưa check-in."
        ));
        info.put("allowedVehicles", List.of("Xe máy", "Ô tô 4-7 chỗ", "Xe điện"));

        List<Object[]> slotCounts = slotRepository.getAllFloorsSlotCountByStatus();
        if (slotCounts != null && !slotCounts.isEmpty()) {
            Object[] row = slotCounts.get(0);
            info.put("totalOccupied",    row[0] != null ? ((Number) row[0]).intValue() : 0);
            info.put("totalAvailable",   row[1] != null ? ((Number) row[1]).intValue() : 0);
            info.put("totalBooked",      row[2] != null ? ((Number) row[2]).intValue() : 0);
            info.put("totalMaintenance", row[3] != null ? ((Number) row[3]).intValue() : 0);
        } else {
            info.put("totalOccupied", 0); info.put("totalAvailable", 0);
            info.put("totalBooked",   0); info.put("totalMaintenance", 0);
        }

        List<Map<String, Object>> pricingList = new ArrayList<>();
        for (VehicleType vt : vehicleTypeRepository.findAll()) {
            PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(vt.getVehicleTypeId()).orElse(null);
            Map<String, Object> pricing = new LinkedHashMap<>();
            pricing.put("vehicleTypeId",   vt.getVehicleTypeId());
            pricing.put("vehicleTypeName", vt.getTypeName());
            if (policy != null) {
                pricing.put("basePrice",         policy.getBasePrice());
                pricing.put("hourlyRate",         policy.getHourlyRate());
                pricing.put("overtimeRate",        policy.getOvertimeRate());   // BR-08: không còn bị zero
                pricing.put("lostTicketPenalty",   policy.getLostTicketPenalty());
            }
            pricingList.add(pricing);
        }
        info.put("pricingPolicies", pricingList);
        return info;
    }

    // ──────────────────────────────────────────────────────────
    // Feature 2 & 4: Active session + estimated fee
    // ──────────────────────────────────────────────────────────
    @Override
    public Map<String, Object> getActiveSession(int userId) {
        // BR-02 FIX: dùng query mới với LOWER(sessionStatus) = 'active'
        return parkingRepository.findActiveSessionByUserId(userId)
                .map(this::buildSessionDetail).orElse(null);
    }

    @Override
    public Map<String, Object> getGuestActiveSession(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) return null;
        return parkingRepository.findActiveSessionByGuestToken(guestToken.trim())
                .map(this::buildSessionDetail).orElse(null);
    }

    private Map<String, Object> buildSessionDetail(ParkingSession session) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sessionId",     session.getSessionId());
        result.put("slotId",        session.getSlotId());
        result.put("vehicleTypeId", session.getVehicleTypeId());
        result.put("licensePlate",  session.getLicensePlate());
        result.put("checkInTime",   session.getCheckInTime());
        result.put("sessionStatus", session.getSessionStatus());
        result.put("bookingId",     session.getBookingId());
        result.put("guestToken",    session.getGuestToken());
        result.put("exceptionType", session.getExceptionType());
        result.put("estimatedFee",  calculateFee(session.getVehicleTypeId(), session.getCheckInTime(), LocalDateTime.now()));
        slotRepository.findById(session.getSlotId()).ifPresent(slot -> {
            result.put("slotCode", slot.getSlotCode());
            result.put("floorId",  slot.getFloorId());
        });
        return result;
    }

    @Override
    public List<ParkingSession> getSessionHistory(int userId) {
        return parkingRepository.findByUserIdOrderByCheckInTimeDesc(userId);
    }

    @Override
    public List<ParkingSession> getGuestSessionHistory(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) return List.of();
        return parkingRepository.findByGuestTokenOrderByCheckInTimeDesc(guestToken.trim());
    }

    // ──────────────────────────────────────────────────────────
    // Feature 5: Thanh toán
    // ──────────────────────────────────────────────────────────
    @Override
    @Transactional
    public Map<String, Object> processPayment(int sessionId, String paymentMethod) {
        return processPaymentInternal(sessionId, null, paymentMethod);
    }

    @Override
    @Transactional
    public Map<String, Object> processGuestPayment(int sessionId, String guestToken, String paymentMethod) {
        return processPaymentInternal(sessionId, guestToken, paymentMethod);
    }

    private Map<String, Object> processPaymentInternal(int sessionId, String guestToken, String paymentMethod) {
        Map<String, Object> result = new LinkedHashMap<>();

        ParkingSession session = parkingRepository.findById(sessionId).orElse(null);
        if (session == null) {
            result.put("success", false);
            result.put("message", "Không tìm thấy phiên gửi xe.");
            return result;
        }

        if (guestToken != null && !guestToken.equals(session.getGuestToken())) {
            result.put("success", false);
            result.put("message", "Phiên gửi xe không thuộc khách vãng lai này.");
            return result;
        }

        if (!"Active".equalsIgnoreCase(session.getSessionStatus())) {
            result.put("success", false);
            result.put("message", "Phiên gửi xe không còn hoạt động.");
            return result;
        }

        // BR-15 FIX: chặn checkout nếu còn exceptionType chưa được Staff xử lý
        if (session.getExceptionType() != null && !session.getExceptionType().isBlank()) {
            result.put("success", false);
            result.put("message", "Xe đang có sự cố [" + session.getExceptionType() + "] chưa được Staff xử lý. Vui lòng liên hệ quầy.");
            return result;
        }

        // BR-10 FIX: chặn duplicate payment
        if (paymentRepository.existsBySessionIdAndStatus(sessionId, "SUCCESS")) {
            result.put("success", false);
            result.put("message", "Phiên gửi xe này đã được thanh toán trước đó.");
            return result;
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        float amount = calculateFee(session.getVehicleTypeId(), session.getCheckInTime(), checkOutTime);

        session.setCheckOutTime(checkOutTime);
        session.setSessionStatus("Completed");
        parkingRepository.save(session);
        bookingService.markBookingCompleted(session.getBookingId(), session.getLicensePlate());

        slotRepository.findById(session.getSlotId()).ifPresent(slot -> {
            slot.setStatus("Available");
            slot.setCurrentVehiclePlate(null);
            slotRepository.save(slot);
        });

        Payment payment = new Payment();
        payment.setSessionId(sessionId);
        payment.setGuestToken(session.getGuestToken());
        payment.setBookingId(session.getBookingId());
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "Cash");
        payment.setPaymentTime(checkOutTime);
        payment.setStatus("SUCCESS");
        paymentRepository.save(payment);

        result.put("success",       true);
        result.put("message",       "Thanh toán thành công!");
        result.put("amount",        amount);
        result.put("paymentMethod", payment.getPaymentMethod());
        result.put("checkOutTime",  checkOutTime);
        return result;
    }

    // ──────────────────────────────────────────────────────────
    // Tính phí gửi xe từ PricePolicy (dùng chung cho cả estimate lẫn checkout)
    // BR-01 FIX: đây là nguồn duy nhất tính phí cho Driver flow
    // BR-08 FIX: overtimeRate không còn bị zero bởi getPricePolicyByVehicleType
    // ──────────────────────────────────────────────────────────
    private float calculateFee(int vehicleTypeId, LocalDateTime checkIn, LocalDateTime checkOut) {
        PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(vehicleTypeId).orElse(null);
        if (policy == null) return 0f;

        long minutes    = Duration.between(checkIn, checkOut).toMinutes();
        if (minutes <= 0) return policy.getBasePrice();

        long extraMinutes = Math.max(0, minutes - 60);
        long extraHours   = (long) Math.ceil(extraMinutes / 60.0);
        float fee = policy.getBasePrice() + (extraHours * policy.getHourlyRate());

        if (minutes > 480) {
            fee += policy.getOvertimeRate();
        }
        return fee;
    }
}
