package com.parking.management.api;

import com.parking.management.entity.IncidentReport;
import com.parking.management.entity.ParkingSession;
import com.parking.management.entity.Payment;
import com.parking.management.entity.Slot;
import com.parking.management.entity.User;
import com.parking.management.repository.IncidentReportRepository;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.repository.PaymentRepository;
import com.parking.management.repository.SlotRepository;
import com.parking.management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffOperationsRestController {

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/monitoring")
    public ResponseEntity<Map<String, Object>> getMonitoringOverview() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("sessions", parkingRepository.findTop30ByOrderByCheckInTimeDesc());
        payload.put("slots", slotRepository.findActiveSlots());
        payload.put("openIncidentCount", incidentReportRepository.countByStatusIn(List.of("OPEN", "IN_REVIEW", "ESCALATED")));
        payload.put("recentIncidents", incidentReportRepository.findTop20ByOrderByCreatedAtDesc());
        payload.put("cameras", List.of(
                camera("CAM-01", "Cong vao o to C1", "ONLINE", "rtsp://camera.local/parking/c1"),
                camera("CAM-02", "Cong ra o to C2", "ONLINE", "rtsp://camera.local/parking/c2"),
                camera("CAM-03", "Tang 1 khu A", "MAINTENANCE", null),
                camera("CAM-04", "Tang 2 khu xe may", "NO_PERMISSION", null)
        ));
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/sessions/search")
    public ResponseEntity<ParkingSession> searchActiveSession(@RequestParam("licensePlate") String licensePlate) {
        return parkingRepository.findActiveSessionByLicensePlate(normalizePlate(licensePlate))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // NEW: tra cuu thong tin chu xe (User dang nhap hoac khach vang lai) theo bien so dang co session active
    @GetMapping("/sessions/owner")
    public ResponseEntity<Map<String, Object>> getSessionOwner(@RequestParam("licensePlate") String licensePlate) {
        ParkingSession session = parkingRepository.findActiveSessionByLicensePlate(normalizePlate(licensePlate))
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phien gui xe dang hoat dong."));

        Map<String, Object> result = new HashMap<>();
        result.put("session", session);

        if (session.getUserId() != null) {
            User user = userRepository.findById(session.getUserId()).orElse(null);
            if (user != null) {
                result.put("ownerType", "USER");
                result.put("ownerName", user.getFullName());
                result.put("ownerPhone", user.getPhoneNumber());
            }
        } else {
            result.put("ownerType", "GUEST");
            result.put("ownerName", "Khach vang lai");
            result.put("ownerPhone", null);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/incidents/payment-error")
    public ResponseEntity<IncidentReport> createPaymentErrorReport(@RequestBody IncidentReport request) {
        ParkingSession session = parkingRepository.findActiveSessionByLicensePlate(normalizePlate(request.getLicensePlate()))
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phien gui xe dang hoat dong."));
        String normalizedPlate = normalizePlate(session.getLicensePlate());

        List<IncidentReport> existingBySession = incidentReportRepository
                .findBySessionIdAndIncidentTypeAndStatusNotOrderByCreatedAtDesc(session.getSessionId(), "PAYMENT_ERROR", "RESOLVED");
        if (!existingBySession.isEmpty()) {
            session.setExceptionType("PAYMENT_ERROR");
            parkingRepository.save(session);
            return ResponseEntity.ok(existingBySession.get(0));
        }

        List<IncidentReport> existingByPlate = incidentReportRepository
                .findByLicensePlateAndIncidentTypeAndStatusNotOrderByCreatedAtDesc(normalizedPlate, "PAYMENT_ERROR", "RESOLVED");
        if (!existingByPlate.isEmpty()) {
            IncidentReport existing = existingByPlate.get(0);
            if (existing.getSessionId() == null) {
                existing.setSessionId(session.getSessionId());
                existing.setAssignedSlotId(session.getSlotId());
                incidentReportRepository.save(existing);
            }
            session.setExceptionType("PAYMENT_ERROR");
            parkingRepository.save(session);
            return ResponseEntity.ok(existing);
        }

        session.setExceptionType("PAYMENT_ERROR");
        parkingRepository.save(session);

        IncidentReport report = IncidentReport.builder()
                .sessionId(session.getSessionId())
                .licensePlate(normalizedPlate)
                .incidentType("PAYMENT_ERROR")
                .status("OPEN")
                .assignedSlotId(session.getSlotId())
                .evidenceNote(request.getEvidenceNote())
                .resolutionNote("Cho Staff xac nhan thanh toan thanh cong.")
                .createdBy(defaultStaff(request.getCreatedBy()))
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(incidentReportRepository.save(report));
    }

    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentReport>> getIncidents(@RequestParam(value = "licensePlate", required = false) String licensePlate) {
        if (licensePlate != null && !licensePlate.isBlank()) {
            return ResponseEntity.ok(incidentReportRepository.findByLicensePlateOrderByCreatedAtDesc(normalizePlate(licensePlate)));
        }
        return ResponseEntity.ok(incidentReportRepository.findTop20ByOrderByCreatedAtDesc());
    }

    @GetMapping("/slots/all")
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotRepository.findActiveSlots());
    }

    @PostMapping("/incidents/lost-ticket")
    public ResponseEntity<IncidentReport> createLostTicketReport(@RequestBody IncidentReport request) {
        ParkingSession session = parkingRepository.findActiveSessionByLicensePlate(normalizePlate(request.getLicensePlate()))
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phien gui xe dang hoat dong."));

        session.setExceptionType("LOST_TICKET");
        parkingRepository.save(session);

        String normalized = normalizePlate(request.getLicensePlate());
        List<IncidentReport> existingReports = incidentReportRepository.findByLicensePlateOrderByCreatedAtDesc(normalized);
        for (IncidentReport r : existingReports) {
            if (!"RESOLVED".equalsIgnoreCase(r.getStatus())) {
                r.setStatus("RESOLVED");
                r.setResolutionNote("Staff da xac minh va lap bien ban mat ve tai quay.");
                incidentReportRepository.save(r);
            }
        }

        IncidentReport report = IncidentReport.builder()
                .sessionId(session.getSessionId())
                .licensePlate(normalized)
                .incidentType("LOST_TICKET")
                .status("RESOLVED")
                .assignedSlotId(session.getSlotId())
                .penaltyAmount(request.getPenaltyAmount() != null ? request.getPenaltyAmount() : 100000F)
                .evidenceNote(request.getEvidenceNote())
                .resolutionNote("Da xac minh giay to, cho thanh toan phi gui xe va phi mat ve.")
                .createdBy(defaultStaff(request.getCreatedBy()))
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(incidentReportRepository.save(report));
    }

    @PostMapping("/incidents/wrong-slot")
    public ResponseEntity<IncidentReport> createWrongSlotReport(@RequestBody IncidentReport request) {
        ParkingSession session = parkingRepository.findActiveSessionByLicensePlate(normalizePlate(request.getLicensePlate()))
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay phien gui xe dang hoat dong."));

        // BR-07 FIX: chỉ cho phép chọn slot thực tế khi slot đó Available hoặc Blank
        Slot actualSlotEntity = slotRepository.findFirstBySlotCode(request.getActualSlotCode()).orElse(null);
        if (actualSlotEntity == null) {
            throw new IllegalArgumentException("Không tìm thấy slot với mã: " + request.getActualSlotCode());
        }
        String actualStatus = actualSlotEntity.getStatus();
        if (!"Available".equalsIgnoreCase(actualStatus) && !"Blank".equalsIgnoreCase(actualStatus)) {
            throw new IllegalArgumentException("Slot " + request.getActualSlotCode() + " đang ở trạng thái [" + actualStatus + "], không thể gán cho xe này.");
        }

        actualSlotEntity.setStatus("Occupied");
        actualSlotEntity.setCurrentVehiclePlate(normalizePlate(session.getLicensePlate()));
        slotRepository.save(actualSlotEntity);

        slotRepository.findBySlotId(session.getSlotId()).ifPresent(assignedSlot -> {
            if (!assignedSlot.getSlotCode().equalsIgnoreCase(request.getActualSlotCode())) {
                assignedSlot.setStatus("Available");
                assignedSlot.setCurrentVehiclePlate(null);
                slotRepository.save(assignedSlot);
            }
        });

        session.setSlotId(actualSlotEntity.getSlotId());
        session.setExceptionType("WRONG_PARKING_POSITION");
        parkingRepository.save(session);

        String normalized = normalizePlate(session.getLicensePlate());
        List<IncidentReport> existingReports = incidentReportRepository.findByLicensePlateOrderByCreatedAtDesc(normalized);
        for (IncidentReport r : existingReports) {
            if (!"RESOLVED".equalsIgnoreCase(r.getStatus())) {
                r.setStatus("RESOLVED");
                r.setResolutionNote("Staff da cap nhat vi tri thuc te.");
                incidentReportRepository.save(r);
            }
        }

        IncidentReport report = IncidentReport.builder()
                .sessionId(session.getSessionId())
                .licensePlate(normalized)
                .incidentType("WRONG_PARKING_POSITION")
                .status("RESOLVED")
                .assignedSlotId(session.getSlotId())
                .actualSlotCode(request.getActualSlotCode())
                .evidenceNote(request.getEvidenceNote())
                .resolutionNote("Da ghi nhan vi tri thuc te, can doi soat neu slot moi bi xung dot.")
                .createdBy(defaultStaff(request.getCreatedBy()))
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(incidentReportRepository.save(report));
    }

    @PutMapping("/incidents/{incidentId}/resolve")
    @Transactional
    public ResponseEntity<?> resolveIncident(@PathVariable Integer incidentId, @RequestBody IncidentReport request) {

        IncidentReport report = incidentReportRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay bien ban su co voi ID: " + incidentId));

        // [4] Bao ve du lieu: chặn chỉnh sửa biên bản đã đóng
        if ("RESOLVED".equalsIgnoreCase(report.getStatus())) {
            return ResponseEntity.badRequest().body("Bien ban nay da duoc dong truoc do, khong the chinh sua lai.");
        }

        // Xử lý side-effects theo từng loại sự cố trước khi đóng biên bản
        if (report.getSessionId() != null) {
            ParkingSession session = parkingRepository.findById(report.getSessionId()).orElse(null);
            if (session != null) {

                // [1] Mất vé: chỉ hạ cờ sau khi xác nhận đã nộp phạt thành công
                if ("LOST_TICKET".equalsIgnoreCase(report.getIncidentType())) {
                    Payment penalty = paymentRepository.findFirstBySessionIdOrderByPaymentTimeDesc(session.getSessionId()).orElse(null);
                    if (penalty == null || !"SUCCESS".equalsIgnoreCase(penalty.getStatus())) {
                        return ResponseEntity.badRequest().body("Khach chua hoan tat dong phi phat mat ve. Vui long thu phi truoc khi dong bien ban.");
                    }
                    session.setExceptionType(null);
                    parkingRepository.save(session);
                }

                // [2] Đỗ sai vị trí: slot đã được hoán đổi lúc tạo biên bản, chỉ hạ cờ
                else if ("WRONG_PARKING_POSITION".equalsIgnoreCase(report.getIncidentType())) {
                    session.setExceptionType(null);
                    parkingRepository.save(session);
                }

                // [3] Lỗi thanh toán: cập nhật số tiền thực tế (nếu có) và đánh dấu SUCCESS
                else if ("PAYMENT_ERROR".equalsIgnoreCase(report.getIncidentType())) {
                    Payment errPayment = paymentRepository.findFirstBySessionIdOrderByPaymentTimeDesc(session.getSessionId()).orElse(new Payment());
                    errPayment.setSessionId(session.getSessionId());
                    errPayment.setStatus("SUCCESS");
                    errPayment.setPaymentTime(LocalDateTime.now());
                    // BR-13 FIX: đảm bảo paymentMethod không null để hóa đơn có thể đối soát
                    if (errPayment.getPaymentMethod() == null) errPayment.setPaymentMethod("Cash");
                    // Cập nhật số tiền thực tế nếu Staff nhập (penaltyAmount dùng làm carrier)
                    if (request.getPenaltyAmount() != null) errPayment.setAmount(request.getPenaltyAmount());
                    paymentRepository.save(errPayment);

                    session.setExceptionType(null);
                    parkingRepository.save(session);
                }
            }
        }

        report.setStatus("RESOLVED");
        report.setResolutionNote(request.getResolutionNote() != null && !request.getResolutionNote().isBlank()
                ? request.getResolutionNote()
                : "Da duoc Staff xac minh va xu ly he thong.");
        report.setResolvedAt(LocalDateTime.now());

        return ResponseEntity.ok(incidentReportRepository.save(report));
    }

    private Map<String, String> camera(String cameraCode, String areaName, String status, String streamUrl) {
        Map<String, String> camera = new HashMap<>();
        camera.put("cameraCode", cameraCode);
        camera.put("areaName", areaName);
        camera.put("status", status);
        camera.put("streamUrl", streamUrl);
        return camera;
    }

    private String normalizePlate(String plate) {
        return plate == null ? "" : plate.trim().toUpperCase();
    }

    private String defaultStaff(String createdBy) {
        return createdBy == null || createdBy.isBlank() ? "STAFF" : createdBy;
    }
}
