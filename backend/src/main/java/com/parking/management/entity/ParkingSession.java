package com.parking.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

// MODIFIED: thêm bookingId và userId so với entity cũ
@Entity
@Table(name = "ParkingSessions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ParkingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SessionID")
    private Integer sessionId;

    @Column(name = "SlotID")
    private Integer slotId;

    @Column(name = "VehicleTypeID")
    private Integer vehicleTypeId;

    @Column(name = "BookingID")          // NEW: link về Booking nếu là gửi xe qua đặt chỗ
    private Integer bookingId;

    @Column(name = "UserID")             // NEW: ai đang gửi xe
    private Integer userId;

    @Column(name = "GuestToken", length = 80)
    private String guestToken;

    @Column(name = "LicensePlate")
    private String licensePlate;

    @Column(name = "CardNumber")
    private String cardNumber;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "CheckInTime")
    private LocalDateTime checkInTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "CheckOutTime")
    private LocalDateTime checkOutTime;

    @Column(name = "ImageInUrl")
    private String imageInUrl;

    @Column(name = "ImageOutUrl")
    private String imageOutUrl;

    @Column(name = "SessionStatus")
    // Active | Completed | Exception
    private String sessionStatus;

    @Column(name = "ExceptionType")
    private String exceptionType;

    // Vấn đề 3: thêm barrierStatus để Staff điều khiển mở cổng
    // LOCKED = chưa mở | OPENED = đã mở cho xe ra
    @Column(name = "BarrierStatus")
    private String barrierStatus;

    @Transient
    private Float checkoutAmount;

    @Transient
    private Boolean depositPaid;

    @Transient
    private Float depositAmount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Transient
    private LocalDateTime bookingStartTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Transient
    private LocalDateTime bookingEndTime;
}
