package com.parking.management.service;

import com.parking.management.entity.Booking;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface BookingService {

    // Overloaded methods with custom slotId and checkInTime
    Booking createBooking(Integer userId, int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime);

    Booking createBooking(Integer userId, int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime, LocalDateTime checkOutTime);

    Booking createGuestBooking(String guestToken, String guestName, String guestPhone,
                               int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime);

    Booking createGuestBooking(String guestToken, String guestName, String guestPhone,
                               int vehicleTypeId, String licensePlate, Integer slotId, LocalDateTime checkInTime, LocalDateTime checkOutTime);

    // Deposit QR payment for booking
    Map<String, Object> createBookingDepositQR(int bookingId) throws Exception;

    // Confirm deposit success and change slot status to Booked
    void confirmBookingDeposit(int bookingId);

    // Lấy danh sách booking của user
    List<Map<String, Object>> getBookingsByUser(int userId);

    List<Map<String, Object>> getBookingsByGuest(String guestToken);

    // Đánh dấu booking đã check-in (gọi bởi ParkingService)
    void markBookingCheckedIn(String licensePlate);

    // Đánh dấu booking đã hoàn tất khi xe checkout.
    void markBookingCompleted(Integer bookingId, String licensePlate);

    // Hủy booking và release slot về "Available"
    boolean cancelBooking(int bookingId, int userId);

    boolean cancelGuestBooking(int bookingId, String guestToken);

    // Lấy thông tin chi tiết booking (kèm slotCode, floorName để hiển thị)
    Map<String, Object> getBookingDetail(int bookingId);

    List<Map<String, Object>> getConfirmedBookingsForStaff();

    Map<String, Object> getCheckinCapacityWarning(int vehicleTypeId);
}

