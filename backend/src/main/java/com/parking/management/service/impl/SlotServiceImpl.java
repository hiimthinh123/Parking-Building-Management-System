package com.parking.management.service.impl;

import com.parking.management.entity.Slot;
import com.parking.management.repository.SlotRepository;
import com.parking.management.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SlotServiceImpl implements SlotService {

    @Autowired
    private SlotRepository slotRepository;

    private static final String SLOT_CODE_PATTERN = "^(XM|OT)-.+$";

    @Override
    public List<Slot> getSlotsByFloor(int floorId) {
        return slotRepository.findByFloorId(floorId);
    }

    @Override
    public boolean updateSlotStatus(String slotCode, String status, String currentVehiclePlate) {
        Optional<Slot> slotOptional = slotRepository.findFirstBySlotCode(slotCode);
        if (slotOptional.isPresent()) {
            Slot slot = slotOptional.get();
            if (isDeleted(slot)) return false;
            slot.setStatus(status);
            slot.setCurrentVehiclePlate("Occupied".equalsIgnoreCase(status)
                    ? currentVehiclePlate.trim().toUpperCase()
                    : null);
            slotRepository.save(slot);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateSlotStatusBySlotId(int slotId, String status, String currentVehiclePlate) {
        Optional<Slot> slotOptional = slotRepository.findBySlotId(slotId);
        if (slotOptional.isPresent()) {
            Slot slot = slotOptional.get();
            if (isDeleted(slot)) return false;
            slot.setStatus(status);
            slot.setCurrentVehiclePlate("Occupied".equalsIgnoreCase(status)
                    ? currentVehiclePlate.trim().toUpperCase()
                    : null);
            slotRepository.save(slot);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateSlotStatusBySlotId(int slotId, String status) {
        Optional<Slot> slotOptional = slotRepository.findBySlotId(slotId);
        if (slotOptional.isPresent()) {
            Slot slot = slotOptional.get();
            if (isDeleted(slot)) return false;
            if (slot.getStatus() != null && slot.getStatus().equalsIgnoreCase(status)) {
                return false;
            }
            slot.setStatus(status);
            slotRepository.save(slot);
            return true;
        }
        return false;
    }

    @Override
    public boolean setCurrentVehiclePlateNullBySlotId(int slotId) {
        Optional<Slot> slotOptional = slotRepository.findBySlotId(slotId);
        if (slotOptional.isPresent()) {
            Slot slot = slotOptional.get();
            if (isDeleted(slot)) return false;
            slot.setCurrentVehiclePlate(null);
            slotRepository.save(slot);
            return true;
        }
        return false;
    }

    @Override
    public List<Integer> getSlotCountByStatus(int floorId) {
        List<Object[]> rawData = slotRepository.getSlotCountByStatusAndFloor(floorId);
        return parseCountResult(rawData, 4);
    }

    @Override
    public List<Integer> getAllFloorsSlotCountByStatus() {
        List<Object[]> rawData = slotRepository.getAllFloorsSlotCountByStatus();
        return parseCountResult(rawData, 4);
    }

    @Override
    public List<Slot> getAvailableSlots(int vehicleTypeId) {
        // BR-09 FIX: dùng query đúng join Floor.vehicleTypeId
        return slotRepository.findAvailableSlotsByVehicleType(vehicleTypeId);
    }

    @Override
    public boolean createNewSlot(String slotCode, int floorId, String status) {
        String normalizedSlotCode = normalizeAndValidateSlotCode(slotCode);

        // 1. Kiểm tra xem đã có slot nào mang mã này ở TẦNG HIỆN TẠI chưa (kể cả active lẫn soft-deleted)
        Optional<Slot> slotOnSameFloorOpt = slotRepository.findFirstBySlotCodeAndFloorId(normalizedSlotCode, floorId);
        if (slotOnSameFloorOpt.isPresent()) {
            Slot existingSlot = slotOnSameFloorOpt.get();
            if (isDeleted(existingSlot)) {
                // Nếu slot ở tầng này đã bị xóa mềm trước đó, khôi phục lại record này
                existingSlot.setFloorId(floorId);
                existingSlot.setStatus(status);
                existingSlot.setDeleted(false);
                existingSlot.setCurrentVehiclePlate(null);
                return slotRepository.save(existingSlot).getSlotId() > 0;
            } else {
                throw new IllegalArgumentException("Mã vị trí đỗ [" + normalizedSlotCode + "] đã tồn tại ở tầng " + floorId + "!");
            }
        }

        // 2. Nếu ở tầng hiện tại chưa có, kiểm tra xem có slot bị xóa mềm ở tầng khác không (tái sử dụng record cũ để tránh trùng UNIQUE constraint trong DB nếu có)
        Optional<Slot> anyDeletedSlotOpt = slotRepository.findFirstBySlotCode(normalizedSlotCode);
        if (anyDeletedSlotOpt.isPresent()) {
            Slot deletedSlot = anyDeletedSlotOpt.get();
            if (isDeleted(deletedSlot)) {
                // Tái sử dụng record đã xóa mềm này cho tầng mới
                deletedSlot.setFloorId(floorId);
                deletedSlot.setStatus(status);
                deletedSlot.setDeleted(false);
                deletedSlot.setCurrentVehiclePlate(null);
                return slotRepository.save(deletedSlot).getSlotId() > 0;
            }
        }

        // 3. Nếu hoàn toàn chưa tồn tại bản ghi nào, tạo mới
        Slot newSlot = new Slot();
        newSlot.setSlotCode(normalizedSlotCode);
        newSlot.setFloorId(floorId);
        newSlot.setStatus(status);
        newSlot.setDeleted(false);

        try {
            return slotRepository.save(newSlot).getSlotId() > 0;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Mã vị trí đỗ [" + normalizedSlotCode + "] đã tồn tại trong cơ sở dữ liệu!");
        }
    }

    @Override
    public boolean updateSlotCode(int slotId, String newSlotCode) {
        String normalizedSlotCode = normalizeAndValidateSlotCode(newSlotCode);
        Slot slot = slotRepository.findBySlotId(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay slot can doi ten."));
        if (isDeleted(slot)) {
            throw new IllegalArgumentException("Slot da bi xoa, khong the doi ten.");
        }

        // Kiểm tra mã mới đã tồn tại ở TẦNG HIỆN TẠI cho slotId khác chưa
        Optional<Slot> targetSlotOpt = slotRepository.findFirstBySlotCodeAndFloorId(normalizedSlotCode, slot.getFloorId());
        if (targetSlotOpt.isPresent()) {
            Slot targetSlot = targetSlotOpt.get();
            if (targetSlot.getSlotId() != slotId) {
                if (!isDeleted(targetSlot)) {
                    throw new IllegalArgumentException("Mã vị trí đỗ này đã tồn tại ở tầng " + slot.getFloorId() + "!");
                } else {
                    // Nếu slot trùng mã ở tầng này đã bị xóa mềm, giải phóng mã của nó để tránh vi phạm UNIQUE key ở DB
                    targetSlot.setSlotCode(normalizedSlotCode + "_DELETED_" + targetSlot.getSlotId());
                    slotRepository.save(targetSlot);
                }
            }
        }

        return slotRepository.updateSlotCodeById(slotId, normalizedSlotCode) > 0;
    }

    @Override
    public boolean deleteSlotById(int slotId) {
        return slotRepository.findById(slotId).map(slot -> {
            if (isDeleted(slot)) return false;

            // 2. Kiểm tra trạng thái an toàn trước khi xóa
            String currentStatus = slot.getStatus() != null ? slot.getStatus().toLowerCase() : "";
            if ("occupied".equals(currentStatus) || "booked".equals(currentStatus)) {
                throw new IllegalStateException("Không thể xóa ô đỗ đang có xe hoặc đang được đặt trước!");
            }

            // 3. Nếu an toàn, tiến hành xóa
            slot.setDeleted(true);
            slot.setStatus("Deleted");
            slot.setCurrentVehiclePlate(null);
            slotRepository.save(slot);
            return true;

        }).orElse(false);
    }

    @Override
    public int findByStatusAndFloorId(String status, int floorId) {
        return slotRepository.countByStatusAndFloorId(status,   floorId);
    }

    @Override
    public void releaseSlot(int slotId) {
        // BR-14 FIX: Available + clear plate trong 1 lần save, tránh race condition
        slotRepository.findBySlotId(slotId).ifPresent(slot -> {
            if (isDeleted(slot)) return;
            slot.setStatus("Available");
            slot.setCurrentVehiclePlate(null);
            slotRepository.save(slot);
        });
    }

    // Hàm hỗ trợ bóc tách dữ liệu mảng Object[] từ DB sang List<Integer> an toàn
    private List<Integer> parseCountResult(List<Object[]> rawData, int expectedSize) {
        List<Integer> countList = new ArrayList<>();
        if (rawData != null && !rawData.isEmpty()) {
            Object[] row = rawData.get(0);
            for (Object val : row) {
                countList.add(val != null ? ((Number) val).intValue() : 0);
            }
        }
        // Dự phòng mảng chứa toàn số 0 nếu có sự cố hoặc dữ liệu trống
        if (countList.isEmpty()) {
            for (int i = 0; i < expectedSize; i++) {
                countList.add(0);
            }
        }
        return countList;
    }

    private String normalizeAndValidateSlotCode(String slotCode) {
        String normalized = slotCode != null ? slotCode.trim().toUpperCase() : "";
        if (!normalized.matches(SLOT_CODE_PATTERN)) {
            throw new IllegalArgumentException("Ten slot phai theo dinh dang XM-... hoac OT-....");
        }
        return normalized;
    }

    private boolean isDeleted(Slot slot) {
        return Boolean.TRUE.equals(slot.getDeleted());
    }
}
