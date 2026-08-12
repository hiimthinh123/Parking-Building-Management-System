package com.parking.management.service;

import com.parking.management.entity.Slot;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface SlotService {
    List<Slot> getSlotsByFloor(int floorId);
    boolean updateSlotStatus(String slotCode, String status, String currentVehiclePlate);
    boolean updateSlotStatusBySlotId(int slotId, String status, String currentVehiclePlate);
    boolean updateSlotStatusBySlotId(int slotId, String status);
    boolean setCurrentVehiclePlateNullBySlotId(int slotId);
    List<Integer> getSlotCountByStatus(int floorId);
    List<Integer> getAllFloorsSlotCountByStatus();
    List<Slot> getAvailableSlots(int vehicleTypeId);
    boolean createNewSlot(String slotCode, int floorId, String status);
    boolean updateSlotCode(int slotId, String newSlotCode);
    boolean deleteSlotById(int slotId);
    int findByStatusAndFloorId(String status, int floorId);

    /** Giải phóng slot: set Available + xóa currentVehiclePlate trong 1 lần save duy nhất */
    void releaseSlot(int slotId);
}
