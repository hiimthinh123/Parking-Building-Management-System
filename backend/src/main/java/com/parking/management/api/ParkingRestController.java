package com.parking.management.api;

import com.parking.management.entity.ParkingSession;
import com.parking.management.service.CloudinaryService;
import com.parking.management.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.GET, RequestMethod.OPTIONS})
public class ParkingRestController {

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * 1. API lấy toàn bộ danh sách phiên đỗ xe Endpoint: GET
     * http://localhost:8080/api/parking/sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<ParkingSession>> getAllParkingSessions() {
        List<ParkingSession> sessions = parkingService.getAllParkingSessions();
        return ResponseEntity.ok(sessions);
    }

    /**
     * 2. API lấy dữ liệu xe vào tích lũy phục vụ vẽ chart đường Endpoint: GET
     * http://localhost:8080/api/parking/chart/check-in
     */
    @GetMapping("/chart/check-in")
    public ResponseEntity<List<Integer>> getCheckIn(@RequestParam("targetDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Integer> counts = parkingService.getCheckInMilestones(date);
        return ResponseEntity.ok(counts);
    }

    /**
     * 3. API lấy dữ liệu xe ra tích lũy phục vụ vẽ chart đường Endpoint: GET
     * http://localhost:8080/api/parking/chart/check-out
     */
    @GetMapping("/chart/check-out")
    public ResponseEntity<List<Integer>> getCheckOut(@RequestParam("targetDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // BR-03 FIX: gọi đúng getCheckOutMilestones
        List<Integer> counts = parkingService.getCheckOutMilestones(date);
        return ResponseEntity.ok(counts);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createParkingSession(@RequestPart("sessionData") ParkingSession session,
                                                  @RequestPart(value = "imageIn", required = false) MultipartFile imageInFile) {
        try {
            if (imageInFile != null && !imageInFile.isEmpty()) {
                String imageUrl = cloudinaryService.uploadImage(imageInFile);
                session.setImageInUrl(imageUrl);
            }
            ParkingSession savedSession = parkingService.saveParkingSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/check-out/view")
    public ResponseEntity<ParkingSession> viewSession(@RequestParam("licensePlate") String licensePlate) {
        try {
            ParkingSession session = parkingService.getSessionByPlate(licensePlate);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<ParkingSession> checkOutParkingSession(@RequestPart("checkoutData") ParkingSession parkingSession,
                                                                 @RequestPart(value = "imageOut", required = false) MultipartFile imageOutFile,
                                                                 @RequestParam("paymentMethod") String paymentMethod,
                                                                 @RequestParam("isOvertime") boolean isOvertime) {

        if (imageOutFile != null && !imageOutFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageOutFile);
            parkingSession.setImageOutUrl(imageUrl); // Gán link ảnh online vào trường xe ra
        }
        ParkingSession savedSession = parkingService.checkOutParkingSession(parkingSession, paymentMethod, isOvertime);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSession);
    }

    @PostMapping("/scan-plate")
    public ResponseEntity<?> scanPlate(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng tải lên một hình ảnh!");
        }
        String licensePlate = parkingService.scanLicensePlate(file);

        Map<String, String> response = new HashMap<>();
        response.put("licensePlate", licensePlate);

        return ResponseEntity.ok(response);
    }
}