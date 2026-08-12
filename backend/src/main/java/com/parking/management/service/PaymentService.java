package com.parking.management.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.parking.management.entity.Payment;

import java.util.List;
import java.util.Map;

public interface PaymentService {
    float getAmountBySessionId(int sessionId);
    List<Float> getDailyRevenue();
    Payment save(Payment payment);

    // Vấn đề 5: bổ sung 3 method cho luồng PayOS
    Map<String, Object> createQRPayment(int sessionId) throws Exception;
    Map<String, Object> createQRPayment(int sessionId, Long overrideAmount) throws Exception;
    Map<String, Object> createBookingDepositQR(int bookingId) throws Exception;
    String getPaymentStatus(String orderId);
    void confirmWebhook(JsonNode webhookBody) throws Exception;
    // Polling fallback: check PayOS API trực tiếp khi webhook không đến được (localhost dev)
    Map<String, Object> checkAndSyncPaymentStatus(String orderId) throws Exception;
}