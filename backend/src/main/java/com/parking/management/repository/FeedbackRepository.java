package com.parking.management.repository;

import com.parking.management.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    // Lấy lịch sử feedback của 1 user, mới nhất trước
    List<Feedback> findByUserIdOrderByCreatedAtDesc(int userId);

    List<Feedback> findByGuestTokenOrderByCreatedAtDesc(String guestToken);

    List<Feedback> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
}
