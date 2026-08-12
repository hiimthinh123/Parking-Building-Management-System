package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Floors")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FloorID")
    private int floorId;

    @Column(name = "VehicleTypeID")
    private int vehicleTypeId;

    @Column(name = "FloorName", nullable = false, length = 50)
    private String floorName;

    @Column(name = "MaxCapacity")
    private int maxCapacity;
}