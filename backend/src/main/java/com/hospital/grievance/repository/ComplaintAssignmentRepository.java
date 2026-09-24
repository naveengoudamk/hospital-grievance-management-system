package com.hospital.grievance.repository;

import com.hospital.grievance.entity.ComplaintAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintId(Long complaintId);
    Optional<ComplaintAssignment> findByComplaintIdAndActiveTrue(Long complaintId);
    boolean existsByComplaintIdAndCommitteeMemberIdAndActiveTrue(Long complaintId, Long memberId);
}
