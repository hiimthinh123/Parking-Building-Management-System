package com.parking.management.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.parking.management.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentRestController {

    @Autowired
    private PaymentService paymentService;

    /** GET /api/payments/amount/{sessionId} — Lấy phí hiện tại của phiên */
    @GetMapping("/amount/{sessionId}")
    public ResponseEntity<Float> getAmountBySessionId(@PathVariable int sessionId) {
        return ResponseEntity.ok(paymentService.getAmountBySessionId(sessionId));
    }

    /** GET /api/payments/daily-revenue */
    @GetMapping("/daily-revenue")
    public ResponseEntity<List<Float>> getDailyRevenue() {
        return ResponseEntity.ok(paymentService.getDailyRevenue());
    }

    /**
     * POST /api/payments/create-qr
     * Body: { "sessionId": 2 }
     * Returns: { qrCode, checkoutUrl, orderId, amount }
     */
    @PostMapping("/create-qr")
    public ResponseEntity<?> createQRPayment(@RequestBody Map<String, Object> body) {
        try {
            if (body.get("bookingId") != null) {
                int bookingId = Integer.parseInt(body.get("bookingId").toString());
                return ResponseEntity.ok(paymentService.createBookingDepositQR(bookingId));
            }
            int sessionId = Integer.parseInt(body.get("sessionId").toString());
            Long overrideAmount = body.get("amount") != null ? Long.parseLong(body.get("amount").toString()) : null;
            return ResponseEntity.ok(paymentService.createQRPayment(sessionId, overrideAmount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/payments/status/{orderId}
     * Polling: Frontend gọi mỗi 3 giây.
     * Gọi PayOS API trực tiếp để sync trạng thái — hoạt động kể cả khi webhook không đến được (localhost dev)
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        try {
            Map<String, Object> result = paymentService.checkAndSyncPaymentStatus(orderId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Fallback: trả status từ DB nếu PayOS API call fail
            return ResponseEntity.ok(Map.of("status", paymentService.getPaymentStatus(orderId)));
        }
    }

    /**
     * POST /api/payments/webhook
     * PayOS gọi vào đây khi user quét QR thành công.
     * Vấn đề 7 FIX: không cần @RequestHeader signature riêng vì PayOS SDK
     * tự verify chữ ký HMAC-SHA256 bên trong verifyPaymentWebhookData()
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody JsonNode body) {
        try {
            paymentService.confirmWebhook(body);
            return ResponseEntity.ok(Map.of("code", "00", "desc", "success"));
        } catch (Exception e) {
            // Trả 200 OK ngay cả khi lỗi để PayOS không retry vô hạn
            // Nhưng log lại để debug
            System.err.println("[WEBHOOK ERROR] " + e.getMessage());
            return ResponseEntity.ok(Map.of("code", "01", "desc", e.getMessage()));
        }
    }
}