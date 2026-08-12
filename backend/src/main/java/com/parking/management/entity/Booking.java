package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Bookings")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingID")
    private int bookingId;

    @Column(name = "UserID", nullable = true)
    private Integer userId;

    @Column(name = "GuestToken", length = 80)
    private String guestToken;

    @Column(name = "GuestName", length = 100)
    private String guestName;

    @Column(name = "GuestPhone", length = 30)
    private String guestPhone;

    @Column(name = "LicensePlate", length = 30)
    private String licensePlate;

    @Column(name = "SlotID")
    private int slotId;

    @Column(name = "StartTime")
    private LocalDateTime startTime;

    @Column(name = "EndTime")
    private LocalDateTime endTime;

    @Column(name = "Status", length = 50)
    private String status;
}
