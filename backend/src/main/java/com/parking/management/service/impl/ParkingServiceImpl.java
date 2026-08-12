package com.parking.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.parking.management.entity.Booking;
import com.parking.management.entity.ParkingSession;
import com.parking.management.entity.Payment;
import com.parking.management.entity.PricePolicy;
import com.parking.management.entity.Slot;
import com.parking.management.repository.BookingRepository;
import com.parking.management.repository.FloorRepository;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.repository.PaymentRepository;
import com.parking.management.repository.PricePolicyRepository;
import com.parking.management.repository.SlotRepository;
import com.parking.management.service.BookingService;
import com.parking.management.service.ParkingService;
import com.parking.management.service.PaymentService;
import com.parking.management.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ParkingServiceImpl implements ParkingService {

    @Autowired private ParkingRepository     parkingRepository;
    @Autowired private BookingRepository     bookingRepository;
    @Autowired private SlotService           slotService;
    @Autowired private PaymentService        paymentService;
    @Autowired private PaymentRepository     paymentRepository;
    @Autowired private PricePolicyRepository pricePolicyRepository;
    @Autowired private BookingService        bookingService;
    @Autowired private SlotRepository        slotRepository;
    @Autowired private FloorRepository       floorRepository;

    @Value("${plate.recognizer.api.key}")
    private String apiKey;

    @Override
    public List<ParkingSession> getAllParkingSessions() {
        return parkingRepository.findAll();
    }

    @Override
    public List<Integer> getCheckInMilestones(LocalDate date) {
        return parseMilestoneResult(parkingRepository.getCheckInTrafficByMilestones(date));
    }

    @Override
    public List<Integer> getCheckOutMilestones(LocalDate date) {
        return parseMilestoneResult(parkingRepository.getCheckOutTrafficByMilestones(date));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ParkingSession saveParkingSession(ParkingSession session) {
        String plate = session.getLicensePlate() != null ? session.getLicensePlate().trim().toUpperCase() : "";
        Optional<ParkingSession> existingActiveSession = parkingRepository.findActiveSessionByLicensePlate(plate);
        if (existingActiveSession.isPresent()) {
            throw new RuntimeException("Loi Check-in: Xe mang bien so " + plate + " hien da co trong bai do!");
        }

        var activeBookingOpt = bookingRepository.findActiveBookingByLicensePlate(plate, LocalDateTime.now());
        if (activeBookingOpt.isPresent()) {
            var booking = activeBookingOpt.get();
            int bookingVehicleTypeId = getVehicleTypeIdBySlotId(booking.getSlotId());
            session.setBookingId(booking.getBookingId());
            session.setUserId(booking.getUserId());
            session.setGuestToken(booking.getGuestToken());
            session.setVehicleTypeId(bookingVehicleTypeId);
            session.setCheckInTime(booking.getStartTime());
            session.setCheckOutTime(null);

            Integer chosenSlotId = session.getSlotId();
            Integer bookedSlotId = booking.getSlotId();

            if (chosenSlotId != null && !chosenSlotId.equals(bookedSlotId)) {
                // Nếu Staff đổi sang slot khác với slot đã book:
                // 1. Kiểm tra slot mới hợp lệ với loại xe
                validateSlotMatchesVehicleType(chosenSlotId, bookingVehicleTypeId);
                // 2. Giải phóng slot đã booked cũ về trạng thái "Available" để xe khác có thể đỗ
                slotService.releaseSlot(bookedSlotId);
                // 3. Sử dụng slot mới do Staff lựa chọn
                session.setSlotId(chosenSlotId);
                // 4. Cập nhật lại slotId mới vào Booking để giao diện phía User hiển thị đúng ô đỗ thực tế
                booking.setSlotId(chosenSlotId);
                bookingRepository.save(booking);
            } else {
                session.setSlotId(bookedSlotId);
            }
        } else {
            validateSlotMatchesVehicleType(session.getSlotId(), session.getVehicleTypeId());
        }

        session.setImageOutUrl(null);
        session.setExceptionType(null);
        session.setSessionStatus("Active");
        slotService.updateSlotStatusBySlotId(session.getSlotId(), "Occupied", plate);
        ParkingSession saved = parkingRepository.save(session);
        bookingService.markBookingCheckedIn(plate);
        return saved;
    }

    private void validateSlotMatchesVehicleType(Integer slotId, Integer vehicleTypeId) {
        if (slotId == null || vehicleTypeId == null) {
            throw new RuntimeException("Thieu thong tin vi tri hoac loai xe.");
        }
        int slotVehicleTypeId = getVehicleTypeIdBySlotId(slotId);
        if (slotVehicleTypeId != vehicleTypeId) {
            throw new RuntimeException("Vi tri da chon khong phu hop voi loai xe.");
        }
    }

    private int getVehicleTypeIdBySlotId(Integer slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Vi tri do khong ton tai."));
        return floorRepository.findById(slot.getFloorId())
                .map(floor -> floor.getVehicleTypeId())
                .orElseThrow(() -> new RuntimeException("Tang cua vi tri do khong ton tai."));
    }

    @Override
    public ParkingSession getSessionByPlate(String licensePlate) {
        ParkingSession session = parkingRepository
                .findActiveSessionByLicensePlate(licensePlate.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Xe mang bien so " + licensePlate + " hien khong co trong bai!"));
        enrichCheckoutPricing(session);
        return session;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ParkingSession checkOutParkingSession(ParkingSession session, String paymentMethod, boolean isOvertime) {
        parkingRepository.findById(session.getSessionId()).ifPresent(current -> {
            if (session.getExceptionType() == null || session.getExceptionType().isBlank()) {
                session.setExceptionType(current.getExceptionType());
            }
            if (session.getBookingId() == null) session.setBookingId(current.getBookingId());
            if (session.getGuestToken() == null) session.setGuestToken(current.getGuestToken());
        });
        if (session.getBookingId() != null) {
            bookingRepository.findById(session.getBookingId()).ifPresent(booking -> {
                session.setCheckInTime(booking.getStartTime());
                session.setCheckOutTime(booking.getEndTime());
            });
        }

        if (paymentRepository.existsBySessionIdAndStatus(session.getSessionId(), "SUCCESS")) {
            session.setSessionStatus("Completed");
            slotService.releaseSlot(session.getSlotId());
            bookingService.markBookingCompleted(session.getBookingId(), session.getLicensePlate());
            return parkingRepository.save(session);
        }

        float totalAmount = calculateCheckoutAmount(session);
        if ("LOST_TICKET".equalsIgnoreCase(session.getExceptionType())) {
            PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(session.getVehicleTypeId()).orElse(null);
            totalAmount += (policy != null && policy.getLostTicketPenalty() != null && policy.getLostTicketPenalty() > 0)
                    ? policy.getLostTicketPenalty() : 100_000f;
        }
        if (isOvertime) {
            totalAmount += 10_000f;
        }

        session.setSessionStatus("Completed");
        slotService.releaseSlot(session.getSlotId());
        bookingService.markBookingCompleted(session.getBookingId(), session.getLicensePlate());

        Payment payment = new Payment();
        payment.setSessionId(session.getSessionId());
        payment.setBookingId(session.getBookingId());
        payment.setGuestToken(session.getGuestToken());
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "Cash");
        payment.setPaymentTime(LocalDateTime.now());
        payment.setStatus("SUCCESS");
        paymentService.save(payment);

        return parkingRepository.save(session);
    }

    @Override
    public String scanLicensePlate(MultipartFile file) {
        try {
            String url = "https://api.platerecognizer.com/v1/plate-reader/";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Token " + apiKey.trim());

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
                }
            };
            body.add("upload", fileResource);
            body.add("regions", "vn");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            return parsePlateNumberFromJson(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Loi khi ket noi dich vu AI: " + e.getMessage());
        }
    }

    private String parsePlateNumberFromJson(String jsonString) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            JsonNode root = mapper.readTree(jsonString);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                return results.get(0).path("plate").asText().toUpperCase();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private float calculateCheckoutAmount(ParkingSession session) {
        float totalFee = calculateFee(session.getVehicleTypeId(), session.getCheckInTime(), LocalDateTime.now());
        if (session.getBookingId() == null) {
            return totalFee;
        }

        Optional<Payment> depositPayment = paymentRepository.findFirstByBookingIdOrderByPaymentTimeDesc(session.getBookingId())
                .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()));
        if (depositPayment.isPresent()) {
            float depositAmt = depositPayment.get().getAmount();
            return Math.max(0f, totalFee - depositAmt);
        }
        return totalFee;
    }

    private void enrichCheckoutPricing(ParkingSession session) {
        if (session == null) return;
        boolean depositPaid = false;
        float depositAmount = 0f;
        if (session.getBookingId() != null) {
            Optional<Payment> depositPayment = paymentRepository.findFirstByBookingIdOrderByPaymentTimeDesc(session.getBookingId())
                    .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()));
            if (depositPayment.isPresent()) {
                depositPaid = true;
                depositAmount = depositPayment.get().getAmount();
            }
            bookingRepository.findById(session.getBookingId()).ifPresent(booking -> {
                session.setBookingStartTime(booking.getStartTime());
                session.setBookingEndTime(booking.getEndTime());
            });
        }
        session.setDepositPaid(depositPaid);
        session.setDepositAmount(depositAmount);
        session.setCheckoutAmount(calculatePayableAmount(session));
    }

    private float calculatePayableAmount(ParkingSession session) {
        float amount = calculateCheckoutAmount(session);
        if ("LOST_TICKET".equalsIgnoreCase(session.getExceptionType())) {
            PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(session.getVehicleTypeId()).orElse(null);
            amount += (policy != null && policy.getLostTicketPenalty() != null && policy.getLostTicketPenalty() > 0)
                    ? policy.getLostTicketPenalty()
                    : 100_000f;
        }
        return amount;
    }

    private float calculateFee(Integer vehicleTypeId, LocalDateTime checkIn, LocalDateTime checkOut) {
        if (vehicleTypeId == null || checkIn == null || checkOut == null) return 0f;
        PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(vehicleTypeId).orElse(null);
        if (policy == null) return 0f;

        long minutes = Duration.between(checkIn, checkOut).toMinutes();
        if (minutes <= 0) return policy.getBasePrice();

        long extraMinutes = Math.max(0, minutes - 60);
        long extraHours = (long) Math.ceil(extraMinutes / 60.0);
        float fee = policy.getBasePrice() + (extraHours * policy.getHourlyRate());
        if (minutes > 480) {
            fee += policy.getOvertimeRate();
        }
        return fee;
    }

    private List<Integer> parseMilestoneResult(List<Object[]> rawData) {
        List<Integer> result = new ArrayList<>();
        if (rawData != null && !rawData.isEmpty()) {
            for (Object val : rawData.get(0)) {
                result.add(val != null ? ((Number) val).intValue() : 0);
            }
        }
        if (result.isEmpty()) {
            for (int i = 0; i < 8; i++) result.add(0);
        }
        return result;
    }
}
