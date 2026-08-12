package com.parking.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo realtime đến Staff Dashboard qua WebSocket/STOMP
     * Frontend Staff subscribe: stompClient.subscribe('/topic/staff-notifications', callback)
     */
    public void notifyStaffPaymentSuccess(String licensePlate, Integer sessionId) {
        String payload = String.format(
                "{\"type\":\"PAYMENT_SUCCESS\",\"licensePlate\":\"%s\",\"sessionId\":%d,\"message\":\"Xe %s đã thanh toán — Nhấn mở barrier!\"}",
                licensePlate, sessionId, licensePlate
        );
        messagingTemplate.convertAndSend("/topic/staff-notifications", payload);
    }
}