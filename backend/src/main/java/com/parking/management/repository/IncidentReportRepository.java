package com.parking.management.repository;

import com.parking.management.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Integer> {
    List<IncidentReport> findTop20ByOrderByCreatedAtDesc();
    List<IncidentReport> findByLicensePlateOrderByCreatedAtDesc(String licensePlate);
    List<IncidentReport> findBySessionIdAndIncidentTypeAndStatusNotOrderByCreatedAtDesc(Integer sessionId, String incidentType, String status);
    List<IncidentReport> findByLicensePlateAndIncidentTypeAndStatusNotOrderByCreatedAtDesc(String licensePlate, String incidentType, String status);
    long countByStatusIn(List<String> statuses);
}
