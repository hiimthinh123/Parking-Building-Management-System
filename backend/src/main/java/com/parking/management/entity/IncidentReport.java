package com.parking.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "IncidentReports")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IncidentID")
    private Integer incidentId;

    @Column(name = "SessionID")
    private Integer sessionId;

    @Column(name = "LicensePlate", length = 30)
    private String licensePlate;

    @Column(name = "IncidentType", length = 50)
    private String incidentType;

    @Column(name = "Status", length = 30)
    private String status;

    @Column(name = "AssignedSlotID")
    private Integer assignedSlotId;

    @Column(name = "ActualSlotCode", length = 30)
    private String actualSlotCode;

    @Column(name = "PenaltyAmount")
    private Float penaltyAmount;

    @Column(name = "EvidenceNote", length = 1000)
    private String evidenceNote;

    @Column(name = "ResolutionNote", length = 1000)
    private String resolutionNote;

    @Column(name = "CreatedBy", length = 80)
    private String createdBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "ResolvedAt")
    private LocalDateTime resolvedAt;
}
