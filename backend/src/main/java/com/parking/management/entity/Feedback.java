package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Feedbacks")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FeedbackID")
    private int feedbackId;

    @Column(name = "UserID", nullable = true)
    private Integer userId;

    @Column(name = "GuestToken", length = 80)
    private String guestToken;

    @Column(name = "GuestName", length = 100)
    private String guestName;

    @Column(name = "GuestPhone", length = 30)
    private String guestPhone;

    @Column(name = "Category", length = 50)
    // LostCard | IncorrectFee | MissingVehicle | OccupiedSlot | Others
    private String category;

    @Column(name = "LicensePlate", length = 30)
    private String licensePlate;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "Status", length = 30)
    // Pending | Processing | Resolved
    private String status;

    @Column(name = "AssignedTo", length = 30)
    // STAFF | MANAGER
    private String assignedTo;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
}
