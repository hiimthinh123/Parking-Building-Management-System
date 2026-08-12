package com.parking.management.api;

import com.parking.management.entity.Slot;
import com.parking.management.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class SlotRestController {
    @Autowired
    private SlotService slotService;

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<Slot>> getSlotsByFloor(@PathVariable int floorId) {
        return ResponseEntity.ok(slotService.getSlotsByFloor(floorId));
    }

    @PutMapping("/update-status")
    public ResponseEntity<Boolean> updateSlotStatus(@RequestParam(required = false) String slotCode,
                                                    @RequestParam(required = false) Integer slotId,
                                                    @RequestParam String status,
                                                    @RequestParam(required = false) String currentVehiclePlate) {
        if ("Occupied".equalsIgnoreCase(status)
                && (currentVehiclePlate == null || currentVehiclePlate.isBlank())) {
            return ResponseEntity.badRequest().body(false);
        }

        boolean isUpdated = slotId != null
                ? slotService.updateSlotStatusBySlotId(slotId, status, currentVehiclePlate)
                : slotService.updateSlotStatus(slotCode, status, currentVehiclePlate);
        return ResponseEntity.ok(isUpdated);
    }

    @GetMapping("/count/floor/{floorId}")
    public ResponseEntity<List<Integer>> getSlotCountByStatus(@PathVariable int floorId) {
        return ResponseEntity.ok(slotService.getSlotCountByStatus(floorId));
    }

    @GetMapping("/status/{status}/floor/{floorId}")
    public ResponseEntity<Integer> getSlotCountByStatusAndFloorId(@PathVariable String status,
                                                                  @PathVariable int floorId) {
        return ResponseEntity.ok(slotService.findByStatusAndFloorId(status, floorId));
    }

    @GetMapping("/count/all")
    public ResponseEntity<List<Integer>> getAllFloorsSlotCountByStatus() {
        return ResponseEntity.ok(slotService.getAllFloorsSlotCountByStatus());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Slot>> getAvailableSlots(@RequestParam("vehicleTypeId") int vehicleTypeId) {
        List<Slot> availableSlots = slotService.getAvailableSlots(vehicleTypeId);
        if (availableSlots.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(availableSlots);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSlot(@RequestParam String slotCode,
                                        @RequestParam int floorId,
                                        @RequestParam String status) {
        try {
            return ResponseEntity.ok(slotService.createNewSlot(slotCode, floorId, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/rename")
    public ResponseEntity<?> renameSlot(@RequestParam int slotId,
                                        @RequestParam String newSlotCode) {
        try {
            return ResponseEntity.ok(slotService.updateSlotCode(slotId, newSlotCode));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{slotId}")
    public ResponseEntity<Boolean> deleteSlot(@PathVariable int slotId) {
        return ResponseEntity.ok(slotService.deleteSlotById(slotId));
    }
}
