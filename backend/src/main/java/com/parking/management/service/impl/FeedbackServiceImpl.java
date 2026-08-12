package com.parking.management.service.impl;

import com.parking.management.entity.Feedback;
import com.parking.management.entity.IncidentReport;
import com.parking.management.entity.ParkingSession;
import com.parking.management.repository.FeedbackRepository;
import com.parking.management.repository.IncidentReportRepository;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    private static final Set<String> STAFF_CATEGORIES = Set.of("LostCard", "OccupiedSlot", "IncorrectFee", "PaymentError");

    @Override
    public Feedback submitFeedback(Integer userId, String category, String licensePlate, String description) {
        String assignee = resolveAssignee(category);
        String normalizedPlate = normalizePlate(licensePlate);
        validatePlateForStaffFeedback(assignee, normalizedPlate);
        Feedback feedback = Feedback.builder()
                .userId(userId)
                .category(category)
                .licensePlate(normalizedPlate)
                .description(description)
                .status(assignee.equals("STAFF") ? "Processing" : "Pending")
                .assignedTo(assignee)
                .createdAt(LocalDateTime.now())
                .build();
        Feedback saved = feedbackRepository.save(feedback);
        createStaffIncidentIfNeeded(saved);
        return saved;
    }

    @Override
    public Feedback submitGuestFeedback(String guestToken, String guestName, String guestPhone, String category, String licensePlate, String description) {
        if (guestToken == null || guestToken.isBlank())
            throw new RuntimeException("Thieu ma dinh danh khach vang lai.");
        if (guestPhone == null || guestPhone.isBlank())
            throw new RuntimeException("Vui long nhap so dien thoai de nhan ho tro.");

        String assignee = resolveAssignee(category);
        String normalizedPlate = normalizePlate(licensePlate);
        validatePlateForStaffFeedback(assignee, normalizedPlate);
        Feedback feedback = Feedback.builder()
                .guestToken(guestToken.trim())
                .guestName(guestName)
                .guestPhone(guestPhone)
                .category(category)
                .licensePlate(normalizedPlate)
                .description(description)
                .status(assignee.equals("STAFF") ? "Processing" : "Pending")
                .assignedTo(assignee)
                .createdAt(LocalDateTime.now())
                .build();
        Feedback saved = feedbackRepository.save(feedback);
        createStaffIncidentIfNeeded(saved);
        return saved;
    }

    @Override
    public List<Feedback> getFeedbacksByUser(int userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Feedback> getFeedbacksByGuest(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) return List.of();
        return feedbackRepository.findByGuestTokenOrderByCreatedAtDesc(guestToken.trim());
    }

    @Override
    public List<Feedback> getFeedbacksByAssignee(String assignedTo) {
        return feedbackRepository.findByAssignedToOrderByCreatedAtDesc(assignedTo);
    }

    private String resolveAssignee(String category) {
        return STAFF_CATEGORIES.contains(category) ? "STAFF" : "MANAGER";
    }

    private void createStaffIncidentIfNeeded(Feedback feedback) {
        if (!"STAFF".equals(feedback.getAssignedTo())) return;
        ParkingSession activeSession = null;
        if ("LostCard".equals(feedback.getCategory())) {
            activeSession = parkingRepository.findActiveSessionByLicensePlate(feedback.getLicensePlate()).orElse(null);
            if (activeSession != null) {
                activeSession.setExceptionType("LOST_TICKET");
                parkingRepository.save(activeSession);
            }
        }

        IncidentReport report = IncidentReport.builder()
                .sessionId(activeSession != null ? activeSession.getSessionId() : null)
                .licensePlate(feedback.getLicensePlate())
                .incidentType(mapIncidentType(feedback.getCategory()))
                .status("OPEN")
                .assignedSlotId(activeSession != null ? activeSession.getSlotId() : null)
                .penaltyAmount("LostCard".equals(feedback.getCategory()) ? 100000F : null)
                .evidenceNote(buildEvidenceNote(feedback))
                .resolutionNote("Phan anh tu user/guest can Staff xac minh tai quay.")
                .createdBy(feedback.getUserId() != null ? "USER-" + feedback.getUserId() : "GUEST")
                .createdAt(LocalDateTime.now())
                .build();

        incidentReportRepository.save(report);
    }

    private String mapIncidentType(String category) {
        if ("LostCard".equals(category)) return "LOST_TICKET";
        if ("OccupiedSlot".equals(category)) return "OCCUPIED_SLOT";
        if ("IncorrectFee".equals(category) || "PaymentError".equals(category)) return "PAYMENT_ERROR";
        return "CUSTOMER_REPORT";
    }

    private String buildEvidenceNote(Feedback feedback) {
        String reporter = feedback.getUserId() != null
                ? "UserID: " + feedback.getUserId()
                : "Guest: " + nullToDash(feedback.getGuestName()) + " - " + nullToDash(feedback.getGuestPhone());
        return "Nguon feedback #" + feedback.getFeedbackId() + " | Bien so: " + nullToDash(feedback.getLicensePlate()) + " | " + reporter + " | Noi dung: " + feedback.getDescription();
    }

    private String nullToDash(String value) {
        return value == null || value.isBlank() ? "--" : value;
    }

    private String normalizePlate(String licensePlate) {
        if (licensePlate == null) return null;
        String normalized = licensePlate.trim().toUpperCase();
        return normalized.isBlank() ? null : normalized;
    }

    private void validatePlateForStaffFeedback(String assignee, String licensePlate) {
        if ("STAFF".equals(assignee) && (licensePlate == null || licensePlate.isBlank())) {
            throw new RuntimeException("Vui long nhap bien so xe de Staff tra cuu va xu ly.");
        }
    }
}
