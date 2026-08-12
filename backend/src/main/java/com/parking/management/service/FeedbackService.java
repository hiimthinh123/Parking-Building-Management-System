package com.parking.management.service;

import com.parking.management.entity.Feedback;
import java.util.List;

public interface FeedbackService {
    Feedback submitFeedback(Integer userId, String category, String licensePlate, String description);
    Feedback submitGuestFeedback(String guestToken, String guestName, String guestPhone, String category, String licensePlate, String description);
    List<Feedback> getFeedbacksByUser(int userId);
    List<Feedback> getFeedbacksByGuest(String guestToken);
    List<Feedback> getFeedbacksByAssignee(String assignedTo);
}
