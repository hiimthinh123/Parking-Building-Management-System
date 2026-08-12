package com.parking.management.service;

import com.parking.management.entity.ParkingSession;
import java.util.List;
import java.util.Map;

public interface DriverService {

    // Feature 1: Thông tin bãi đỗ xe + slot trống real-time
    Map<String, Object> getParkingLotInfo();

    // Feature 2 & 4: Lấy active session của user (kèm phí dự kiến realtime)
    Map<String, Object> getActiveSession(int userId);

    Map<String, Object> getGuestActiveSession(String guestToken);

    // Feature 4: Lịch sử các lần gửi xe của user
    List<ParkingSession> getSessionHistory(int userId);

    List<ParkingSession> getGuestSessionHistory(String guestToken);

    // Feature 5: Xử lý thanh toán
    Map<String, Object> processPayment(int sessionId, String paymentMethod);

    Map<String, Object> processGuestPayment(int sessionId, String guestToken, String paymentMethod);
}
