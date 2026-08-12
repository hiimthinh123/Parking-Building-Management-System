package com.parking.management.api;

import com.parking.management.entity.ParkingSession;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/barrier")
@CrossOrigin(origins = "*")
public class BarrierController {

    @Autowired private ParkingRepository parkingRepository;
    @Autowired private SlotRepository    slotRepository;

    /**
     * POST /api/barrier/open/{sessionId}
     * Staff bấm nút "Mở barrier" trên Dashboard sau khi nhận WebSocket notify
     * Chỉ cho phép mở nếu session đang ở READY_TO_OPEN (đã thanh toán)
     */
    @PostMapping("/open/{sessionId}")
    public ResponseEntity<?> openBarrier(@PathVariable int sessionId) {
        ParkingSession session = parkingRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên: " + sessionId));

        // Guard: chỉ cho mở nếu đã thanh toán xong (webhook đã set READY_TO_OPEN)
        if (!"READY_TO_OPEN".equals(session.getBarrierStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Xe chưa hoàn tất thanh toán hoặc barrier đã được mở."
            ));
        }

        session.setBarrierStatus("OPENED");
        parkingRepository.save(session);

        return ResponseEntity.ok(Map.of(
                "message",      "Barrier đã mở cho xe: " + session.getLicensePlate(),
                "licensePlate", session.getLicensePlate(),
                "sessionId",    sessionId
        ));
    }

    /** GET /api/barrier/status/{sessionId} — Frontend polling trạng thái barrier */
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<?> getBarrierStatus(@PathVariable int sessionId) {
        return parkingRepository.findById(sessionId)
                .map(s -> ResponseEntity.ok(Map.of(
                        "barrierStatus", s.getBarrierStatus() != null ? s.getBarrierStatus() : "LOCKED",
                        "sessionStatus", s.getSessionStatus()
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}