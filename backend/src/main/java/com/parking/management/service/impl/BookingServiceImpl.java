package com.parking.management.service.impl;

import com.parking.management.entity.Booking;
import com.parking.management.entity.Slot;
import com.parking.management.repository.BookingRepository;
import com.parking.management.repository.FloorRepository;
import com.parking.management.repository.ParkingRepository;
import com.parking.management.repository.SlotRepository;
import com.parking.management.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private static final int BOOKING_SLOT_HOLD_MINUTES = 30;

    @Autowired private BookingRepository bookingRepository;
    @Autowired private SlotRepository    slotRepository;
    @Autowired private FloorRepository   floorRepository;
    @Autowired private ParkingRepository parkingRepository;

    @Override
    @Transactional
    public Booking createBooking(Integer userId, int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime) {
        return createBooking(userId, vehicleTypeId, licensePlate, slotId, checkInTime, null);
    }

    @Override
    @Transactional
    public Booking createBooking(Integer userId, int vehicleTypeId, String licensePlate, Integer slotId,
                                 LocalDateTime checkInTime, LocalDateTime checkOutTime) {
        return createBookingInternal(userId, null, null, null, vehicleTypeId, licensePlate, slotId, checkInTime, checkOutTime);
    }

    @Override
    @Transactional
    public Booking createGuestBooking(String guestToken, String guestName, String guestPhone,
                                      int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime) {
        return createGuestBooking(guestToken, guestName, guestPhone, vehicleTypeId, licensePlate, slotId, checkInTime, null);
    }

    @Override
    @Transactional
    public Booking createGuestBooking(String guestToken, String guestName, String guestPhone,
                                      int vehicleTypeId, String licensePlate, Integer slotId,
                                      LocalDateTime checkInTime, LocalDateTime checkOutTime) {
        if (guestToken == null || guestToken.isBlank()) {
            throw new RuntimeException("Thieu ma dinh danh khach vang lai.");
        }
        if (guestPhone == null || guestPhone.isBlank()) {
            throw new RuntimeException("Vui long nhap so dien thoai de theo doi dat cho.");
        }
        return createBookingInternal(null, guestToken.trim(), guestName, guestPhone, vehicleTypeId, licensePlate, slotId, checkInTime, checkOutTime);
    }

    private Booking createBookingInternal(Integer userId, String guestToken, String guestName, String guestPhone,
                                          int vehicleTypeId, String licensePlate, Integer requestedSlotId,
                                          LocalDateTime checkInTime, LocalDateTime checkOutTime) {
        String normalizedPlate = licensePlate != null ? licensePlate.trim().toUpperCase() : null;

        if (normalizedPlate != null &&
                bookingRepository.existsActiveBookingByLicensePlate(normalizedPlate, LocalDateTime.now())) {
            throw new RuntimeException("Xe " + normalizedPlate + " dang co dat cho chua su dung. Vui long huy truoc khi dat moi.");
        }

        if (normalizedPlate != null) {
            Optional<Booking> pendingBooking = bookingRepository
                    .findFirstByLicensePlateAndStatusAndEndTimeAfterOrderByBookingIdDesc(
                            normalizedPlate, "PendingPayment", LocalDateTime.now());
            if (pendingBooking.isPresent() && isSameBookingOwner(pendingBooking.get(), userId, guestToken)) {
                return pendingBooking.get();
            }
        }

        if (checkInTime == null || checkOutTime == null) {
            throw new RuntimeException("Vui long nhap day du gio vao, gio ra va ngay dat truoc.");
        }
        if (!checkOutTime.isAfter(checkInTime)) {
            throw new RuntimeException("Gio ra phai sau gio vao.");
        }
        if (!checkInTime.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Gio vao phai lon hon thoi gian hien tai.");
        }

        Slot targetSlot = findReferenceSlot(vehicleTypeId, requestedSlotId);
        if (targetSlot == null) {
            throw new RuntimeException("Khong con slot trong cho loai xe nay.");
        }

        Booking booking = Booking.builder()
                .userId(userId)
                .guestToken(guestToken)
                .guestName(guestName)
                .guestPhone(guestPhone)
                .licensePlate(normalizedPlate)
                .slotId(targetSlot.getSlotId())
                .startTime(checkInTime)
                .endTime(checkOutTime)
                .status("PendingPayment")
                .build();
        return bookingRepository.save(booking);
    }

    private Slot findReferenceSlot(int vehicleTypeId, Integer requestedSlotId) {
        if (requestedSlotId != null) {
            Optional<Slot> optSlot = slotRepository.findById(requestedSlotId);
            if (optSlot.isEmpty()) throw new RuntimeException("Vi tri do khong ton tai.");
            Slot slot = optSlot.get();
            if (Boolean.TRUE.equals(slot.getDeleted())) {
                throw new RuntimeException("Vi tri do khong ton tai hoac da bi xoa.");
            }
            if (!"Available".equalsIgnoreCase(slot.getStatus())) {
                throw new RuntimeException("Vi tri " + slot.getSlotCode() + " hien khong con trong. Vui long chon vi tri khac.");
            }
            int slotVehicleTypeId = floorRepository.findById(slot.getFloorId())
                    .map(floor -> floor.getVehicleTypeId())
                    .orElseThrow(() -> new RuntimeException("Tang cua vi tri do khong ton tai."));
            if (slotVehicleTypeId != vehicleTypeId) {
                throw new RuntimeException("Vi tri da chon khong phu hop voi loai xe.");
            }
            return slot;
        }

        var floors = floorRepository.findByVehicleTypeId(vehicleTypeId);
        if (floors.isEmpty()) {
            throw new RuntimeException("Khong co tang nao cho loai xe nay.");
        }
        for (var floor : floors) {
            for (Slot slot : slotRepository.findByFloorId(floor.getFloorId())) {
                if ("Available".equalsIgnoreCase(slot.getStatus())) {
                    return slot;
                }
            }
        }
        return null;
    }

    private int getVehicleTypeIdBySlotId(Integer slotId) {
        if (slotId == null) {
            throw new RuntimeException("Thieu thong tin slot cua booking.");
        }
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Vi tri do khong ton tai."));
        return floorRepository.findById(slot.getFloorId())
                .map(floor -> floor.getVehicleTypeId())
                .orElseThrow(() -> new RuntimeException("Tang cua vi tri do khong ton tai."));
    }

    @Override
    @Transactional
    public Map<String, Object> createBookingDepositQR(int bookingId) throws Exception {
        return Map.of();
    }

    @Override
    @Transactional
    public void confirmBookingDeposit(int bookingId) {
        bookingRepository.findById(bookingId)
                .filter(booking -> "PendingPayment".equalsIgnoreCase(booking.getStatus()))
                .ifPresent(booking -> {
                    booking.setStatus("Confirmed");
                    bookingRepository.save(booking);
                });
    }

    @Override
    @Transactional
    public boolean cancelBooking(int bookingId, int userId) {
        Optional<Booking> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) return false;
        Booking booking = opt.get();
        if (booking.getUserId() == null || booking.getUserId() != userId) return false;
        return cancelConfirmedBooking(booking);
    }

    @Override
    @Transactional
    public boolean cancelGuestBooking(int bookingId, String guestToken) {
        if (guestToken == null || guestToken.isBlank()) return false;
        Optional<Booking> opt = bookingRepository.findByBookingIdAndGuestToken(bookingId, guestToken.trim());
        if (opt.isEmpty()) return false;
        return cancelConfirmedBooking(opt.get());
    }

    private boolean cancelConfirmedBooking(Booking booking) {
        if (!"Confirmed".equals(booking.getStatus()) && !"PendingPayment".equals(booking.getStatus())) return false;

        boolean alreadyCheckedIn = parkingRepository
                .findActiveSessionByLicensePlate(booking.getLicensePlate())
                .isPresent();
        if (alreadyCheckedIn) return false;
        if (booking.getEndTime().isBefore(LocalDateTime.now())) return false;

        booking.setStatus("Cancelled");
        bookingRepository.save(booking);
        releaseHeldSlotForBooking(booking);
        return true;
    }

    @Override
    @Transactional
    public void markBookingCheckedIn(String licensePlate) {
        bookingRepository.findActiveBookingByLicensePlate(
                licensePlate != null ? licensePlate.trim().toUpperCase() : "",
                LocalDateTime.now()
        ).ifPresent(booking -> {
            booking.setStatus("CheckedIn");
            bookingRepository.save(booking);
        });
    }

    @Override
    @Transactional
    public void markBookingCompleted(Integer bookingId, String licensePlate) {
        Optional<Booking> booking = bookingId != null
                ? bookingRepository.findById(bookingId)
                : bookingRepository.findFirstByLicensePlateAndStatusOrderByBookingIdDesc(
                        licensePlate != null ? licensePlate.trim().toUpperCase() : "", "CheckedIn");

        booking.filter(item -> "CheckedIn".equalsIgnoreCase(item.getStatus()))
                .ifPresent(item -> {
                    item.setStatus("Completed");
                    bookingRepository.save(item);
                });
    }

    @Scheduled(fixedDelay = 5 * 60 * 1000)
    @Transactional
    public void releaseExpiredBookings() {
        List<Booking> expired = bookingRepository.findExpiredBookings(LocalDateTime.now());
        for (Booking booking : expired) {
            boolean checkedIn = parkingRepository
                    .findActiveSessionByLicensePlate(booking.getLicensePlate())
                    .isPresent();
            if (!checkedIn) {
                booking.setStatus("Expired");
                bookingRepository.save(booking);
                releaseHeldSlotForBooking(booking);
            }
        }
    }

    @Scheduled(fixedDelay = 60 * 1000)
    @Transactional
    public void updateUpcomingBookingSlotReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime holdUntil = now.plusMinutes(BOOKING_SLOT_HOLD_MINUTES);

        releaseStaleBookedSlots(now, holdUntil);

        List<Booking> upcoming = bookingRepository.findUpcomingConfirmedBookings(now).stream()
                .filter(booking -> !booking.getStartTime().isAfter(holdUntil))
                .toList();

        for (Booking booking : upcoming) {
            reserveSlotForBooking(booking);
        }
    }

    private void releaseStaleBookedSlots(LocalDateTime now, LocalDateTime holdUntil) {
        for (Slot slot : slotRepository.findActiveSlots()) {
            if (!"Booked".equalsIgnoreCase(slot.getStatus()) || slot.getCurrentVehiclePlate() == null) {
                continue;
            }

            Optional<Booking> activeBooking = bookingRepository
                    .findFirstByLicensePlateAndStatusAndEndTimeAfterOrderByBookingIdDesc(
                            slot.getCurrentVehiclePlate(), "Confirmed", now);
            boolean shouldKeep = activeBooking
                    .filter(booking -> !booking.getStartTime().isAfter(holdUntil))
                    .isPresent();
            if (!shouldKeep) {
                slot.setStatus("Available");
                slot.setCurrentVehiclePlate(null);
                slotRepository.save(slot);
            }
        }
    }

    private void reserveSlotForBooking(Booking booking) {
        String plate = booking.getLicensePlate() == null ? "" : booking.getLicensePlate().trim().toUpperCase();
        if (plate.isBlank()) return;

        Optional<Slot> existingHeldSlot = slotRepository.findActiveSlots().stream()
                .filter(slot -> "Booked".equalsIgnoreCase(slot.getStatus()))
                .filter(slot -> plate.equalsIgnoreCase(slot.getCurrentVehiclePlate()))
                .findFirst();
        if (existingHeldSlot.isPresent()) {
            Slot slot = existingHeldSlot.get();
            if (booking.getSlotId() != slot.getSlotId()) {
                booking.setSlotId(slot.getSlotId());
                bookingRepository.save(booking);
            }
            return;
        }

        int vehicleTypeId = getVehicleTypeIdBySlotId(booking.getSlotId());
        Optional<Slot> preferredSlot = slotRepository.findById(booking.getSlotId())
                .filter(slot -> "Available".equalsIgnoreCase(slot.getStatus()))
                .filter(slot -> getVehicleTypeIdBySlotId(slot.getSlotId()) == vehicleTypeId);

        Slot slotToHold = preferredSlot.orElseGet(() -> slotRepository.findAvailableSlotsByVehicleType(vehicleTypeId)
                .stream()
                .findFirst()
                .orElse(null));
        if (slotToHold == null) return;

        slotToHold.setStatus("Booked");
        slotToHold.setCurrentVehiclePlate(plate);
        slotRepository.save(slotToHold);

        if (booking.getSlotId() != slotToHold.getSlotId()) {
            booking.setSlotId(slotToHold.getSlotId());
            bookingRepository.save(booking);
        }
    }

    private void releaseHeldSlotForBooking(Booking booking) {
        String plate = booking.getLicensePlate() == null ? "" : booking.getLicensePlate().trim().toUpperCase();
        if (plate.isBlank()) return;

        slotRepository.findActiveSlots().stream()
                .filter(slot -> "Booked".equalsIgnoreCase(slot.getStatus()))
                .filter(slot -> plate.equalsIgnoreCase(slot.getCurrentVehiclePlate()))
                .forEach(slot -> {
                    slot.setStatus("Available");
                    slot.setCurrentVehiclePlate(null);
                    slotRepository.save(slot);
                });
    }

    @Override
    public List<Map<String, Object>> getBookingsByUser(int userId) {
        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .map(this::toBookingDetail)
                .toList();
    }

    @Override
    public List<Map<String, Object>> getBookingsByGuest(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) return List.of();
        return bookingRepository.findByGuestTokenOrderByStartTimeDesc(guestToken.trim())
                .stream()
                .map(this::toBookingDetail)
                .toList();
    }

    @Override
    public Map<String, Object> getBookingDetail(int bookingId) {
        Optional<Booking> opt = bookingRepository.findById(bookingId);
        return opt.map(this::toBookingDetail).orElse(null);
    }

    @Override
    public List<Map<String, Object>> getConfirmedBookingsForStaff() {
        return bookingRepository.findVisibleStaffBookings(LocalDateTime.now())
                .stream()
                .map(this::toBookingDetail)
                .toList();
    }

    @Override
    public Map<String, Object> getCheckinCapacityWarning(int vehicleTypeId) {
        List<Slot> availableSlots = slotRepository.findAvailableSlotsByVehicleType(vehicleTypeId);
        List<Booking> upcoming = bookingRepository.findUpcomingConfirmedBookings(LocalDateTime.now())
                .stream()
                .filter(booking -> getVehicleTypeIdBySlotId(booking.getSlotId()) == vehicleTypeId)
                .toList();
        int overlapReserve = calculateMaxOverlap(upcoming);
        int heldBookedSlots = countHeldBookedSlotsByVehicleType(vehicleTypeId);
        Optional<Booking> nearestBooking = upcoming.stream().findFirst();
        boolean restricted = nearestBooking.isPresent() && (availableSlots.size() + heldBookedSlots) <= overlapReserve;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("restricted", restricted);
        result.put("availableSlots", availableSlots.size());
        result.put("heldBookedSlots", heldBookedSlots);
        result.put("overlapReserve", overlapReserve);
        nearestBooking.ifPresent(booking -> {
            result.put("nearestBookingStartTime", booking.getStartTime());
            result.put("latestCheckoutTime", booking.getStartTime().minusMinutes(BOOKING_SLOT_HOLD_MINUTES));
            result.put("nearestLicensePlate", booking.getLicensePlate());
        });
        return result;
    }

    private int countHeldBookedSlotsByVehicleType(int vehicleTypeId) {
        int count = 0;
        for (Slot slot : slotRepository.findActiveSlots()) {
            if ("Booked".equalsIgnoreCase(slot.getStatus())
                    && slot.getCurrentVehiclePlate() != null
                    && getVehicleTypeIdBySlotId(slot.getSlotId()) == vehicleTypeId) {
                count++;
            }
        }
        return count;
    }

    private Map<String, Object> toBookingDetail(Booking booking) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("bookingId", booking.getBookingId());
        detail.put("userId", booking.getUserId());
        detail.put("guestToken", booking.getGuestToken());
        detail.put("guestName", booking.getGuestName());
        detail.put("guestPhone", booking.getGuestPhone());
        detail.put("licensePlate", booking.getLicensePlate());
        detail.put("slotId", booking.getSlotId());
        detail.put("startTime", booking.getStartTime());
        detail.put("endTime", booking.getEndTime());
        detail.put("status", booking.getStatus());

        slotRepository.findById(booking.getSlotId()).ifPresent(slot -> {
            detail.put("slotCode", slot.getSlotCode());
            detail.put("slotName", slot.getSlotCode());
            detail.put("floorId", slot.getFloorId());
            floorRepository.findById(slot.getFloorId())
                    .ifPresent(floor -> detail.put("vehicleTypeId", floor.getVehicleTypeId()));
        });
        return detail;
    }

    private boolean isSameBookingOwner(Booking booking, Integer userId, String guestToken) {
        if (userId != null) {
            return Objects.equals(booking.getUserId(), userId);
        }
        return guestToken != null
                && booking.getGuestToken() != null
                && booking.getGuestToken().equals(guestToken.trim());
    }

    private int calculateMaxOverlap(List<Booking> bookings) {
        List<Map.Entry<LocalDateTime, Integer>> events = new ArrayList<>();
        for (Booking booking : bookings) {
            events.add(Map.entry(booking.getStartTime(), 1));
            events.add(Map.entry(booking.getEndTime(), -1));
        }
        events.sort((a, b) -> {
            int cmp = a.getKey().compareTo(b.getKey());
            return cmp != 0 ? cmp : Integer.compare(a.getValue(), b.getValue());
        });
        int current = 0;
        int max = 0;
        for (Map.Entry<LocalDateTime, Integer> event : events) {
            current += event.getValue();
            max = Math.max(max, current);
        }
        return max;
    }
}
