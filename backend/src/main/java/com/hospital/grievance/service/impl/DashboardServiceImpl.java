package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.response.ComplaintSummaryResponse;
import com.hospital.grievance.dto.response.DashboardMetricsResponse;
import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.exception.ForbiddenException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.ComplaintRepository;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardMetricsResponse getAdminDashboardMetrics() {
        long totalComplaints = complaintRepository.count();
        long newComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReview = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long underInvestigation = complaintRepository.countByStatus(ComplaintStatus.INVESTIGATION);
        long actionTaken = complaintRepository.countByStatus(ComplaintStatus.ACTION_TAKEN);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long closed = complaintRepository.countByStatus(ComplaintStatus.CLOSED);
        long rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);
        long criticalCount = complaintRepository.countByPriority(Priority.CRITICAL);

        // Category breakdown
        Map<String, Long> categoryDistribution = new HashMap<>();
        List<Object[]> catRows = complaintRepository.countComplaintsByCategory();
        for (Object[] row : catRows) {
            String catName = (String) row[0];
            Long count = (Long) row[1];
            categoryDistribution.put(catName, count);
        }

        // Location breakdown
        Map<String, Long> locationDistribution = new HashMap<>();
        List<Object[]> locRows = complaintRepository.countComplaintsByLocation();
        for (Object[] row : locRows) {
            String locName = (String) row[0];
            Long count = (Long) row[1];
            locationDistribution.put(locName, count);
        }

        // Status breakdown
        Map<String, Long> statusDistribution = new HashMap<>();
        List<Object[]> statusRows = complaintRepository.countComplaintsByStatus();
        for (Object[] row : statusRows) {
            ComplaintStatus status = (ComplaintStatus) row[0];
            Long count = (Long) row[1];
            statusDistribution.put(status.name(), count);
        }

        // Recent 10 complaints
        List<ComplaintSummaryResponse> recentComplaints = complaintRepository.findTop10RecentComplaints(PageRequest.of(0, 10))
                .stream()
                .map(mapper::toSummaryResponse)
                .collect(Collectors.toList());

        // Active critical complaints
        List<ComplaintSummaryResponse> criticalComplaints = complaintRepository.findActiveCriticalComplaints(PageRequest.of(0, 10))
                .stream()
                .map(mapper::toSummaryResponse)
                .collect(Collectors.toList());

        return DashboardMetricsResponse.builder()
                .totalComplaints(totalComplaints)
                .newComplaints(newComplaints)
                .underReview(underReview)
                .assigned(assigned)
                .underInvestigation(underInvestigation)
                .actionTaken(actionTaken)
                .resolved(resolved)
                .closed(closed)
                .rejected(rejected)
                .criticalCount(criticalCount)
                .categoryDistribution(categoryDistribution)
                .locationDistribution(locationDistribution)
                .statusDistribution(statusDistribution)
                .recentComplaints(recentComplaints)
                .criticalComplaints(criticalComplaints)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCommitteeDashboardMetrics() {
        User user = getCurrentUser();

        List<Complaint> assignedComplaints = complaintRepository.findAssignedToMember(
                user.getId(), null, null, null, PageRequest.of(0, 100)
        ).getContent();

        long totalAssigned = assignedComplaints.size();
        long inProgress = assignedComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED || c.getStatus() == ComplaintStatus.INVESTIGATION)
                .count();
        long completed = assignedComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ACTION_TAKEN || c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED)
                .count();
        long criticalAssigned = assignedComplaints.stream()
                .filter(c -> c.getPriority() == Priority.CRITICAL && c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
                .count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalAssigned", totalAssigned);
        metrics.put("inProgress", inProgress);
        metrics.put("completed", completed);
        metrics.put("criticalAssigned", criticalAssigned);
        metrics.put("recentAssigned", assignedComplaints.stream().limit(5).map(mapper::toSummaryResponse).collect(Collectors.toList()));

        return metrics;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new ForbiddenException("User is not authenticated");
        }
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ForbiddenException("User account not found"));
    }
}
