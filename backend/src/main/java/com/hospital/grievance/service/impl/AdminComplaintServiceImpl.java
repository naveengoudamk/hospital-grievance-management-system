package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.AssignComplaintRequest;
import com.hospital.grievance.dto.request.UpdatePriorityRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.entity.*;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.exception.InvalidStatusTransitionException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.service.AdminComplaintService;
import com.hospital.grievance.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminComplaintServiceImpl implements AdminComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final ComplaintMapper mapper;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintSummaryResponse> searchComplaints(
            ComplaintStatus status,
            Priority priority,
            Long categoryId,
            Long locationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String search,
            Pageable pageable
    ) {
        Page<Complaint> page = complaintRepository.searchComplaints(
                status, priority, categoryId, locationId, startDate, endDate, search, pageable
        );
        return PagedResponse.fromPage(page.map(mapper::toSummaryResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(a -> "COMPLAINT".equalsIgnoreCase(a.getEntityType()) &&
                        (complaint.getComplaintReference().equalsIgnoreCase(a.getEntityId()) || id.toString().equals(a.getEntityId())))
                .collect(Collectors.toList());

        return mapper.toDetailResponse(complaint, auditLogs);
    }

    @Override
    @Transactional
    public ComplaintDetailResponse assignComplaint(Long complaintId, AssignComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User member = userRepository.findById(request.getCommitteeMemberId())
                .filter(u -> u.getRole() == Role.ROLE_COMMITTEE_MEMBER && u.isActive())
                .orElseThrow(() -> new ResourceNotFoundException("Active committee member not found with id: " + request.getCommitteeMemberId()));

        User currentAdmin = getCurrentUserEntity();

        // Deactivate previous active assignments
        List<ComplaintAssignment> existingAssignments = assignmentRepository.findByComplaintId(complaintId);
        for (ComplaintAssignment assign : existingAssignments) {
            assign.setActive(false);
            assignmentRepository.save(assign);
        }

        // Create new assignment
        ComplaintAssignment assignment = ComplaintAssignment.builder()
                .complaint(complaint)
                .committeeMember(member)
                .assignedBy(currentAdmin)
                .assignedAt(LocalDateTime.now())
                .remarks(request.getRemarks())
                .active(true)
                .build();
        assignmentRepository.save(assignment);
        complaint.getAssignments().add(assignment);

        // Transition status to ASSIGNED if currently in SUBMITTED or UNDER_REVIEW
        ComplaintStatus oldStatus = complaint.getStatus();
        if (oldStatus == ComplaintStatus.SUBMITTED || oldStatus == ComplaintStatus.UNDER_REVIEW) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);

            ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                    .complaint(complaint)
                    .oldStatus(oldStatus)
                    .newStatus(ComplaintStatus.ASSIGNED)
                    .changedBy(currentAdmin != null ? currentAdmin.getFullName() : "Administrator")
                    .remarks("Assigned to committee member: " + member.getFullName() + (request.getRemarks() != null ? " (" + request.getRemarks() + ")" : ""))
                    .build();
            statusHistoryRepository.save(history);
            complaint.getStatusHistories().add(history);
        }

        complaintRepository.save(complaint);

        auditService.recordAction(
                AuditAction.COMPLAINT_ASSIGNED,
                "COMPLAINT",
                complaint.getComplaintReference(),
                null,
                "Assigned to " + member.getFullName() + " by " + (currentAdmin != null ? currentAdmin.getUsername() : "admin")
        );

        return getComplaintById(complaintId);
    }

    @Override
    @Transactional
    public ComplaintDetailResponse updateStatus(Long complaintId, UpdateStatusRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (!oldStatus.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + oldStatus + " to " + newStatus + ". Please follow the approved workflow."
            );
        }

        complaint.setStatus(newStatus);
        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            if (complaint.getResolvedAt() == null) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
        }

        User currentAdmin = getCurrentUserEntity();

        ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(currentAdmin != null ? currentAdmin.getFullName() : "Administrator")
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Status updated by administrator")
                .build();
        statusHistoryRepository.save(history);
        complaint.getStatusHistories().add(history);

        complaintRepository.save(complaint);

        auditService.recordAction(
                AuditAction.STATUS_CHANGED,
                "COMPLAINT",
                complaint.getComplaintReference(),
                oldStatus.name(),
                newStatus.name() + (request.getRemarks() != null ? " - " + request.getRemarks() : "")
        );

        return getComplaintById(complaintId);
    }

    @Override
    @Transactional
    public ComplaintDetailResponse updatePriority(Long complaintId, UpdatePriorityRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        Priority oldPriority = complaint.getPriority();
        Priority newPriority = request.getPriority();
        complaint.setPriority(newPriority);

        User currentAdmin = getCurrentUserEntity();

        ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                .complaint(complaint)
                .oldStatus(complaint.getStatus())
                .newStatus(complaint.getStatus())
                .changedBy(currentAdmin != null ? currentAdmin.getFullName() : "Administrator")
                .remarks("Priority changed from " + oldPriority + " to " + newPriority +
                        (request.getRemarks() != null ? " (" + request.getRemarks() + ")" : ""))
                .build();
        statusHistoryRepository.save(history);
        complaint.getStatusHistories().add(history);

        complaintRepository.save(complaint);

        auditService.recordAction(
                AuditAction.PRIORITY_CHANGED,
                "COMPLAINT",
                complaint.getComplaintReference(),
                oldPriority.name(),
                newPriority.name()
        );

        return getComplaintById(complaintId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getStatusHistory(Long complaintId) {
        return statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaintId).stream()
                .map(mapper::toStatusHistoryResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUserEntity() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
                return userRepository.findById(userDetails.getId()).orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }
}
