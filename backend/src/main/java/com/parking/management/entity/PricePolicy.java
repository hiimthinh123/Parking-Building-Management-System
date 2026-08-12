package com.parking.management.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "PricePolicies")
public class PricePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PolicyID")
    private Integer policyId;

    @Column(name = "VehicleTypeID")
    private Integer vehicleTypeId;

    @Column(name = "BasePrice")
    private Float basePrice;

    @Column(name = "HourlyRate")
    private Float hourlyRate;

    @Column(name = "OvertimeRate")
    private Float overtimeRate;

    @Column(name = "LostTicketPenalty")
    private Float lostTicketPenalty;

    // Bug 2 FIX: đổi LocalDateTime -> LocalDate để khớp kiểu DATE trong DB
    @Column(name = "EffectiveDate")
    private LocalDate effectiveDate;

    public Integer getPolicyId() { return policyId; }
    public void setPolicyId(Integer policyId) { this.policyId = policyId; }

    public Integer getVehicleTypeId() { return vehicleTypeId; }
    public void setVehicleTypeId(Integer vehicleTypeId) { this.vehicleTypeId = vehicleTypeId; }

    public Float getBasePrice() { return basePrice; }
    public void setBasePrice(Float basePrice) { this.basePrice = basePrice; }

    public Float getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Float hourlyRate) { this.hourlyRate = hourlyRate; }

    public Float getOvertimeRate() { return overtimeRate; }
    public void setOvertimeRate(Float overtimeRate) { this.overtimeRate = overtimeRate; }

    public Float getLostTicketPenalty() { return lostTicketPenalty; }
    public void setLostTicketPenalty(Float lostTicketPenalty) { this.lostTicketPenalty = lostTicketPenalty; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
}