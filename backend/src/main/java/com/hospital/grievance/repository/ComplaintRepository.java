package com.hospital.grievance.repository;

import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintReference(String complaintReference);

    long countByStatus(ComplaintStatus status);

    long countByPriority(Priority priority);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<ComplaintStatus> statuses);

    @Query("SELECT c.category.name, COUNT(c) FROM Complaint c GROUP BY c.category.name")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT c.location.name, COUNT(c) FROM Complaint c WHERE c.location IS NOT NULL GROUP BY c.location.name")
    List<Object[]> countComplaintsByLocation();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatus();

    @Query("SELECT c FROM Complaint c " +
           "LEFT JOIN c.category cat " +
           "LEFT JOIN c.location loc " +
           "WHERE (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:categoryId IS NULL OR cat.id = :categoryId) " +
           "AND (:locationId IS NULL OR loc.id = :locationId) " +
           "AND (:startDate IS NULL OR c.submittedAt >= :startDate) " +
           "AND (:endDate IS NULL OR c.submittedAt <= :endDate) " +
           "AND (:search IS NULL OR (" +
           "  LOWER(c.complaintReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  (c.complainantName IS NOT NULL AND LOWER(c.complainantName) LIKE LOWER(CONCAT('%', :search, '%')))" +
           "))")
    Page<Complaint> searchComplaints(
            @Param("status") ComplaintStatus status,
            @Param("priority") Priority priority,
            @Param("categoryId") Long categoryId,
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c " +
           "JOIN c.assignments a " +
           "WHERE a.committeeMember.id = :memberId AND a.active = true " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:search IS NULL OR (" +
           "  LOWER(c.complaintReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))" +
           "))")
    Page<Complaint> findAssignedToMember(
            @Param("memberId") Long memberId,
            @Param("status") ComplaintStatus status,
            @Param("priority") Priority priority,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c ORDER BY c.submittedAt DESC")
    List<Complaint> findTop10RecentComplaints(Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.priority = 'CRITICAL' AND c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') ORDER BY c.submittedAt DESC")
    List<Complaint> findActiveCriticalComplaints(Pageable pageable);
}
