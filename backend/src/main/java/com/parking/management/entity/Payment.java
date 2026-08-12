package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private int paymentId;

    @Column(name = "SessionID")
    private Integer sessionId;

    @Column(name = "BookingID")
    private Integer bookingId;

    // Vấn đề 3: thêm orderId để map với PayOS orderCode
    // unique = true → ngăn duplicate webhook xử lý 2 lần cùng 1 đơn
    @Column(name = "OrderId", length = 100, unique = true)
    private String orderId;

    @Column(name = "PaymentLinkId", length = 100)
    private String paymentLinkId; // ID thực từ PayOS — dùng để construct checkoutUrl đúng

    @Column(name = "QrCode", length = 500, columnDefinition = "TEXT")
    private String qrCode;        // VietQR string — render thành ảnh QR ở frontend

    @Column(name = "GuestToken", length = 80)
    private String guestToken;

    @Column(name = "Amount")
    private float amount;

    @Column(name = "PaymentMethod")
    private String paymentMethod;

    @Column(name = "PaymentTime")
    private LocalDateTime paymentTime;

    @Column(name = "Status")
    private String status; // PENDING | SUCCESS | FAILED
}