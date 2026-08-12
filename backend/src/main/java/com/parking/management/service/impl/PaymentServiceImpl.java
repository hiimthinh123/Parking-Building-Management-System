package com.parking.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.parking.management.entity.*;
import com.parking.management.repository.*;
import com.parking.management.service.NotificationService;
import com.parking.management.service.PaymentService;
import com.parking.management.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

// ✅ IMPORT ĐÚNG — SDK 2.0.1 sub-client pattern
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final long MIN_QR_AMOUNT = 2_000L;

    @Autowired private PaymentRepository     paymentRepository;
    @Autowired private ParkingRepository     parkingRepository;
    @Autowired private PricePolicyRepository pricePolicyRepository;
    @Autowired private SlotRepository        slotRepository;
    @Autowired private NotificationService   notificationService;
    @Autowired private BookingService        bookingService;
    @Autowired private BookingRepository     bookingRepository;
    @Autowired private FloorRepository       floorRepository;

    @Value("${payos.client-id}")    private String clientId;
    @Value("${payos.api-key}")      private String apiKey;
    @Value("${payos.checksum-key}") private String checksumKey;

    private PayOS payOS;

    private long normalizeQrAmount(double amount) {
        return Math.max((long) Math.ceil(amount), MIN_QR_AMOUNT);
    }

    @PostConstruct
    public void init() {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    // ─────────────────────────────────────────────────────────
    // Doanh thu & Repository
    // ─────────────────────────────────────────────────────────

    @Override
    public float getAmountBySessionId(int sessionId) {
        Optional<Payment> existing = paymentRepository.findFirstBySessionIdOrderByPaymentTimeDesc(sessionId);
        if (existing.filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus())).isPresent()) {
            return existing.get().getAmount();
        }
        // Nếu chưa có Payment, tính phí realtime từ PricePolicy
        return parkingRepository.findById(sessionId)
                .map(this::calculatePayableAmount)
                .orElse(0.0f);
    }

    @Override
    public List<Float> getDailyRevenue() {
        List<Float> result = new ArrayList<>();
        List<Object[]> rawData = paymentRepository.getDailyRevenue();
        if (rawData != null && !rawData.isEmpty()) {
            Object[] row = rawData.get(0);
            result.add(row[0] != null ? ((Number) row[0]).floatValue() : 0.0f);
            result.add(row[1] != null ? ((Number) row[1]).floatValue() : 0.0f);
            result.add(row[2] != null ? ((Number) row[2]).floatValue() : 0.0f);
        }
        if (result.isEmpty()) { result.add(0f); result.add(0f); result.add(0f); }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    // ─────────────────────────────────────────────────────────
    // PayOS SDK 2.0.1 — Tạo QR
    // API: payOS.paymentRequests().create(CreatePaymentLinkRequest)
    //      → CreatePaymentLinkResponse { checkoutUrl, qrCode, orderCode, ... }
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createQRPayment(int sessionId) throws Exception {
        return createQRPayment(sessionId, null);
    }

    @Override
    public Map<String, Object> createQRPayment(int sessionId, Long overrideAmount) throws Exception {

        // 1. Lấy thông tin phiên gửi xe trước để tính toán số tiền realtime hiện tại
        ParkingSession session = parkingRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên gửi xe ID: " + sessionId));

        float calculatedAmount = calculatePayableAmount(session);
        long amountToPay = (overrideAmount != null && overrideAmount > 0)
                ? overrideAmount
                : normalizeQrAmount(calculatedAmount);

        // 2. Kiểm tra xem đã từng có giao dịch PENDING nào cho phiên này chưa
        Optional<Payment> existing = paymentRepository.findFirstBySessionIdOrderByPaymentTimeDesc(sessionId);
        if (existing.isPresent() && "PENDING".equals(existing.get().getStatus())) {
            Payment p = existing.get();

            // 🔥 ĐIỀU KIỆN QUYẾT ĐỊNH: Chỉ dùng lại đơn cũ ĐỂ TẠO QR nếu SỐ TIỀN KHÔNG THAY ĐỔI
            if ((long) p.getAmount() == amountToPay) {
                PaymentLink linkData = payOS.paymentRequests().get(Long.parseLong(p.getOrderId()));
                String linkStatus = linkData.getStatus() != null ? linkData.getStatus().toString() : "";

                if (!"EXPIRED".equals(linkStatus) && !"CANCELLED".equals(linkStatus)) {
                    String checkoutUrl = p.getPaymentLinkId() != null
                            ? "https://pay.payos.vn/web/" + p.getPaymentLinkId()
                            : "https://pay.payos.vn/web/" + p.getOrderId();
                    return Map.of(
                            "checkoutUrl", checkoutUrl,
                            "qrCode",      p.getQrCode() != null ? p.getQrCode() : "",
                            "orderId",     p.getOrderId(),
                            "amount",      amountToPay
                    );
                }
            }

            // Nếu số tiền đã thay đổi (ví dụ từ 1000đ lên 5000đ), đánh dấu đơn cũ là EXPIRED để luồng dưới tạo đơn mới
            p.setStatus("EXPIRED");
            paymentRepository.save(p);
        }

        // 3. Tiến hành tạo đơn hàng mới với số tiền chuẩn chỉnh
        long orderCode = System.currentTimeMillis() / 1000;

        String plate = session.getLicensePlate().replaceAll("[^A-Z0-9]", "");
        String description = ("BaiXe " + plate);
        if (description.length() > 25) description = description.substring(0, 25);

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amountToPay)
                .description(description)
                .returnUrl("http://localhost:3000/payment/success")
                .cancelUrl("http://localhost:3000/payment/cancel")
                .build();

        CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);

        // 4. Lưu vết giao dịch mới vào Database
        Payment payment = new Payment();
        payment.setSessionId(sessionId);
        payment.setBookingId(session.getBookingId());
        payment.setGuestToken(session.getGuestToken());
        payment.setAmount(amountToPay); // Lưu số tiền mới (ví dụ: 5000)
        payment.setOrderId(String.valueOf(orderCode));
        payment.setPaymentLinkId(response.getPaymentLinkId());
        payment.setQrCode(response.getQrCode());
        payment.setPaymentMethod("QR_PAYOS");
        payment.setStatus("PENDING");
        payment.setPaymentTime(null);
        paymentRepository.save(payment);

        return Map.of(
                "qrCode",      response.getQrCode() != null ? response.getQrCode() : "",
                "checkoutUrl", response.getCheckoutUrl(),
                "orderId",     orderCode,
                "amount",      amountToPay
        );
    }
    // ─────────────────────────────────────────────────────────
    // Polling status
    // ─────────────────────────────────────────────────────────

    @Override
    public String getPaymentStatus(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(Payment::getStatus)
                .orElse("NOT_FOUND");
    }

    // ─────────────────────────────────────────────────────────
    // PayOS SDK 2.0.1 — Webhook
    // API: payOS.webhooks().verify(Object webhookBody) → WebhookData
    //      WebhookData.getOrderCode() → Long
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmWebhook(JsonNode webhookBody) throws Exception {
        System.out.println("[WEBHOOK] Received: " + webhookBody.toString());

        // SDK 2.0.1 verify() nhận String (raw JSON), KHÔNG nhận JsonNode trực tiếp
        // Nếu truyền JsonNode thì HMAC verify sẽ fail vì serialization khác
        String rawJson = webhookBody.toString();
        WebhookData verifiedData = payOS.webhooks().verify(rawJson);

        System.out.println("[WEBHOOK] Verified orderCode: " + verifiedData.getOrderCode());
        System.out.println("[WEBHOOK] Verified code: " + verifiedData.getCode());

        // PayOS gửi cả 2 loại event: payment success (code="00") và test ping (code="00", orderCode=123)
        // Chỉ xử lý khi orderCode > 1000 (tránh test ping với orderCode=123)
        if (verifiedData.getOrderCode() == null || verifiedData.getOrderCode() <= 1000) {
            System.out.println("[WEBHOOK] Skipping test ping event");
            return;
        }

        String orderId = String.valueOf(verifiedData.getOrderCode());

        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            System.err.println("[WEBHOOK] Payment not found for orderId: " + orderId);
            // Không throw exception — trả 200 để PayOS không retry
            return;
        }

        Payment payment = paymentOpt.get();

        // Idempotent guard
        if (!"PENDING".equals(payment.getStatus())) {
            System.out.println("[WEBHOOK] Already processed, status: " + payment.getStatus());
            return;
        }

        payment.setStatus("SUCCESS");
        payment.setPaymentTime(LocalDateTime.now());
        paymentRepository.save(payment);
        System.out.println("[WEBHOOK] Payment saved SUCCESS for orderId: " + orderId);

        if (payment.getBookingId() != null) {
            bookingService.confirmBookingDeposit(payment.getBookingId());
        }

        if (payment.getSessionId() != null) {
            ParkingSession session = parkingRepository.findById(payment.getSessionId()).orElse(null);
            if (session != null) {
                session.setCheckOutTime(LocalDateTime.now());
                session.setSessionStatus("Completed");
                session.setExceptionType(null);

                if (session.getSlotId() != null) {
                    slotRepository.findBySlotId(session.getSlotId()).ifPresent(slot -> {
                        slot.setStatus("Available");
                        slot.setCurrentVehiclePlate(null);
                        slotRepository.save(slot);
                    });
                }

                session.setBarrierStatus("READY_TO_OPEN");
                parkingRepository.save(session);
                bookingService.markBookingCompleted(session.getBookingId(), session.getLicensePlate());

                notificationService.notifyStaffPaymentSuccess(session.getLicensePlate(), session.getSessionId());
                System.out.println("[WEBHOOK] Notified staff for plate: " + session.getLicensePlate());
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // Polling fallback: gọi PayOS API trực tiếp để check status
    // Dùng khi webhook không đến được (môi trường dev/localhost)
    // Frontend gọi GET /api/payments/status/{orderId} mỗi 3s
    // Nếu PayOS đã nhận tiền nhưng webhook chưa đến → tự sync DB
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createBookingDepositQR(int bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt chỗ: " + bookingId));

        // Tính tổng tiền ước tính đặt chỗ
        float totalEstimatedFee = calculateFee(
                slotRepository.findById(booking.getSlotId()).map(Slot::getFloorId).map(floorId -> floorRepository.findById(floorId).map(f -> f.getVehicleTypeId()).orElse(1)).orElse(1),
                booking.getStartTime(),
                booking.getEndTime()
        );
        // Tiền đặt cọc = 25% tổng tiền đặt chỗ (tối thiểu 1000đ)
        long depositAmount = normalizeQrAmount(totalEstimatedFee * 0.25f);
        long bookingDurationMinutes = ChronoUnit.MINUTES.between(booking.getStartTime(), booking.getEndTime());

        Optional<Payment> existing = paymentRepository.findFirstByBookingIdOrderByPaymentTimeDesc(bookingId);
        if (existing.isPresent() && "PENDING".equals(existing.get().getStatus())) {
            Payment p = existing.get();
            if ((long) p.getAmount() == depositAmount) {
                PaymentLink linkData = payOS.paymentRequests().get(Long.parseLong(p.getOrderId()));
                String linkStatus = linkData.getStatus() != null ? linkData.getStatus().toString() : "";
                if (!"EXPIRED".equals(linkStatus) && !"CANCELLED".equals(linkStatus)) {
                    String checkoutUrl = p.getPaymentLinkId() != null
                            ? "https://pay.payos.vn/web/" + p.getPaymentLinkId()
                            : "https://pay.payos.vn/web/" + p.getOrderId();
                    return Map.of(
                            "checkoutUrl", checkoutUrl,
                            "qrCode",      p.getQrCode() != null ? p.getQrCode() : "",
                            "orderId",     p.getOrderId(),
                            "amount",      depositAmount,
                            "totalEstimatedFee", totalEstimatedFee,
                            "bookingDurationMinutes", bookingDurationMinutes
                    );
                }
            }
            p.setStatus("EXPIRED");
            paymentRepository.save(p);
        }

        long orderCode = System.currentTimeMillis() / 1000;
        String plate = booking.getLicensePlate() != null ? booking.getLicensePlate().replaceAll("[^A-Z0-9]", "") : "";
        String description = ("CocDatCho " + plate);
        if (description.length() > 25) description = description.substring(0, 25);

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(depositAmount)
                .description(description)
                .returnUrl("http://localhost:3000/payment/success")
                .cancelUrl("http://localhost:3000/payment/cancel")
                .build();

        CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);

        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setGuestToken(booking.getGuestToken());
        payment.setAmount(depositAmount);
        payment.setOrderId(String.valueOf(orderCode));
        payment.setPaymentLinkId(response.getPaymentLinkId());
        payment.setQrCode(response.getQrCode());
        payment.setPaymentMethod("QR_PAYOS");
        payment.setStatus("PENDING");
        payment.setPaymentTime(null);
        paymentRepository.save(payment);

        return Map.of(
                "qrCode",      response.getQrCode() != null ? response.getQrCode() : "",
                "checkoutUrl", response.getCheckoutUrl(),
                "orderId",     orderCode,
                "amount",      depositAmount,
                "totalEstimatedFee", totalEstimatedFee,
                "bookingDurationMinutes", bookingDurationMinutes
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> checkAndSyncPaymentStatus(String orderId) throws Exception {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isEmpty()) return Map.of("status", "NOT_FOUND");

        Payment payment = paymentOpt.get();

        if ("SUCCESS".equals(payment.getStatus())) {
            return Map.of("status", "SUCCESS");
        }

        PaymentLink linkData = payOS.paymentRequests().get(Long.parseLong(orderId));
        String payosStatus = linkData.getStatus() != null ? linkData.getStatus().toString() : "";
        if ("PAID".equals(payosStatus)) {
            payment.setStatus("SUCCESS");
            payment.setPaymentTime(LocalDateTime.now());
            paymentRepository.save(payment);

            if (payment.getBookingId() != null) {
                bookingService.confirmBookingDeposit(payment.getBookingId());
            }

            if (payment.getSessionId() != null) {
                ParkingSession session = parkingRepository.findById(payment.getSessionId()).orElse(null);
                if (session != null) {
                    session.setCheckOutTime(LocalDateTime.now());
                    session.setSessionStatus("Completed");
                    session.setExceptionType(null);

                    if (session.getSlotId() != null) {
                        slotRepository.findBySlotId(session.getSlotId()).ifPresent(slot -> {
                            slot.setStatus("Available");
                            slot.setCurrentVehiclePlate(null);
                            slotRepository.save(slot);
                        });
                    }

                    session.setBarrierStatus("READY_TO_OPEN");
                    parkingRepository.save(session);
                    bookingService.markBookingCompleted(session.getBookingId(), session.getLicensePlate());

                    notificationService.notifyStaffPaymentSuccess(session.getLicensePlate(), session.getSessionId());
                }
            }
            return Map.of("status", "SUCCESS");
        }

        if ("EXPIRED".equals(payosStatus) || "CANCELLED".equals(payosStatus)) {
            payment.setStatus("EXPIRED");
            paymentRepository.save(payment);
            if (payment.getBookingId() != null) {
                bookingRepository.findById(payment.getBookingId())
                        .filter(booking -> "PendingPayment".equalsIgnoreCase(booking.getStatus()))
                        .ifPresent(booking -> {
                            booking.setStatus("PaymentExpired");
                            bookingRepository.save(booking);
                        });
            }
            return Map.of("status", "EXPIRED");
        }

        return Map.of("status", payment.getStatus());
    }

    private float calculateFee(Integer vehicleTypeId, LocalDateTime checkIn, LocalDateTime checkOut) {
        if (vehicleTypeId == null || checkIn == null || checkOut == null) return 0f;
        PricePolicy policy = pricePolicyRepository.findByVehicleTypeId(vehicleTypeId).orElse(null);
        if (policy == null) return 0f;

        long minutes = Duration.between(checkIn, checkOut).toMinutes();
        if (minutes <= 0) return policy.getBasePrice();

        long extraHours = (long) Math.ceil(Math.max(0, minutes - 60) / 60.0);
        float fee = policy.getBasePrice() + (extraHours * policy.getHourlyRate());
        if (minutes > 480 && policy.getOvertimeRate() != null) fee += policy.getOvertimeRate();
        return fee;
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
}
