package com.parking.management.service;

import com.parking.management.entity.ParkingSession;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

public interface ParkingService {
    List<ParkingSession> getAllParkingSessions();
    List<Integer> getCheckInMilestones(LocalDate date);
    List<Integer> getCheckOutMilestones(LocalDate date);
    ParkingSession saveParkingSession(ParkingSession session);
    ParkingSession getSessionByPlate(String licensePlate);
    ParkingSession checkOutParkingSession(ParkingSession session, String paymentMethod, boolean isOvertime);
    String scanLicensePlate(MultipartFile file);
}