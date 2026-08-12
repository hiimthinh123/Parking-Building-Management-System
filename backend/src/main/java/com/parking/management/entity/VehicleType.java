package com.parking.management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "VehicleTypes")
@Data
public class VehicleType {
    @Id
    @Column(name = "VehicleTypeID")
    private int vehicleTypeId;

    @Column(name = "TypeName")
    private String typeName;
}