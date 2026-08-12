package com.parking.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkingBuildingManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkingBuildingManagementApplication.class, args);
    }

}