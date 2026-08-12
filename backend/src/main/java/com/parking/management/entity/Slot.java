package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Slots", uniqueConstraints = @UniqueConstraint(columnNames = {"SlotCode", "FloorID"}))
@Data
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SlotID")
    private int slotId;

    @Column(name = "FloorID")
    private int floorId;

    @Column(name = "SlotCode")
    private String slotCode;

    @Column(name = "Status")
    private String status;

    @Column(name = "CurrentVehiclePlate")
    private String currentVehiclePlate;

    @Column(name = "IsDeleted")
    private Boolean deleted = false;
}
