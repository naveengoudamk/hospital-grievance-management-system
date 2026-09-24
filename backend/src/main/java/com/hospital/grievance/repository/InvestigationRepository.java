package com.hospital.grievance.repository;

import com.hospital.grievance.entity.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
    List<Investigation> findByComplaintId(Long complaintId);
    Optional<Investigation> findFirstByComplaintIdOrderByCreatedAtDesc(Long complaintId);
    Optional<Investigation> findByComplaintIdAndInvestigatorId(Long complaintId, Long investigatorId);
}
