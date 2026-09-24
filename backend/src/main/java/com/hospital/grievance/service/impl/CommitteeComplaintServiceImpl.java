package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.InvestigationRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.entity.*;
import com.hospital.grievance.enums.*;
import com.hospital.grievance.exception.ForbiddenException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.CommitteeComplaintService;
import com.hospital.grievance.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommitteeComplaintServiceImpl implements CommitteeComplaintService {

    private final ComplaintRepository complaintRepository;
    private final InvestigationRepository investigationRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ComplaintMapper mapper;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintSummaryResponse> getAssignedComplaints(
            ComplaintStatus status,
            Priority priority,
            String search,
            Pageable pageable
    ) {
        User currentUser = getCurrentUser();
        Page<Complaint> page = complaintRepository.findAssignedToMember(
                currentUser.getId(), status, priority, search, pageable
        );
        return PagedResponse.fromPage(page.map(mapper::toSummaryResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintDetailResponse getAssignedComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        validateAccess(complaint);

        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(a -> "COMPLAINT".equalsIgnoreCase(a.getEntityType()) &&
                        (complaint.getComplaintReference().equalsIgnoreCase(a.getEntityId()) || complaintId.toString().equals(a.getEntityId())))
                .collect(Collectors.toList());

        return mapper.toDetailResponse(complaint, auditLogs);
    }

    @Override
    @Transactional
    public InvestigationResponse recordInvestigation(Long complaintId, InvestigationRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User currentUser = getCurrentUser();
        validateAccess(complaint);

        Investigation investigation = investigationRepository.findFirstByComplaintIdOrderByCreatedAtDesc(complaintId)
                .orElseGet(() -> Investigation.builder()
                        .complaint(complaint)
                        .investigator(currentUser)
                        .startedAt(LocalDateTime.now())
                        .investigationStatus(InvestigationStatus.IN_PROGRESS)
                        .build());

        investigation.setInvestigationSummary(request.getInvestigationSummary());
        if (request.getFindings() != null) {
            investigation.setFindings(request.getFindings());
        }
        if (request.getActionTaken() != null) {
            investigation.setActionTaken(request.getActionTaken());
        }

        if (request.getStatus() != null) {
            investigation.setInvestigationStatus(request.getStatus());
        }

        // Check if completing
        if (request.isCompleteInvestigation() || request.getStatus() == InvestigationStatus.COMPLETED) {
            investigation.setInvestigationStatus(InvestigationStatus.COMPLETED);
            investigation.setCompletedAt(LocalDateTime.now());

            // Move complaint status to ACTION_TAKEN or RESOLVED
            ComplaintStatus oldStatus = complaint.getStatus();
            ComplaintStatus nextStatus = (request.getActionTaken() != null && !request.getActionTaken().isBlank())
                    ? ComplaintStatus.ACTION_TAKEN : ComplaintStatus.INVESTIGATION;

            if (oldStatus != nextStatus && oldStatus.canTransitionTo(nextStatus)) {
                complaint.setStatus(nextStatus);
                ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                        .complaint(complaint)
                        .oldStatus(oldStatus)
                        .newStatus(nextStatus)
                        .changedBy(currentUser.getFullName())
                        .remarks("Investigation completed by committee member: " + currentUser.getFullName())
                        .build();
                statusHistoryRepository.save(history);
                complaint.getStatusHistories().add(history);
            }
        } else if (complaint.getStatus() == ComplaintStatus.ASSIGNED || complaint.getStatus() == ComplaintStatus.UNDER_REVIEW) {
            // Move complaint status to INVESTIGATION
            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.INVESTIGATION);
            ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                    .complaint(complaint)
                    .oldStatus(oldStatus)
                    .newStatus(ComplaintStatus.INVESTIGATION)
                    .changedBy(currentUser.getFullName())
                    .remarks("Investigation started by committee member: " + currentUser.getFullName())
                    .build();
            statusHistoryRepository.save(history);
            complaint.getStatusHistories().add(history);
        }

        Investigation saved = investigationRepository.save(investigation);
        complaintRepository.save(complaint);

        auditService.recordAction(
                investigation.getInvestigationStatus() == InvestigationStatus.COMPLETED
                        ? AuditAction.INVESTIGATION_COMPLETED : AuditAction.INVESTIGATION_UPDATED,
                "INVESTIGATION",
                saved.getId().toString(),
                null,
                "Investigation updated for " + complaint.getComplaintReference() + " by " + currentUser.getUsername()
        );

        return mapper.toInvestigationResponse(saved);
    }

    @Override
    @Transactional
    public ComplaintDetailResponse updateInvestigationStatus(Long complaintId, UpdateStatusRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        validateAccess(complaint);
        User currentUser = getCurrentUser();

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        // Committee members can transition between INVESTIGATION and ACTION_TAKEN
        if (newStatus != ComplaintStatus.INVESTIGATION && newStatus != ComplaintStatus.ACTION_TAKEN) {
            throw new ForbiddenException("Committee members can only set status to INVESTIGATION or ACTION_TAKEN.");
        }

        complaint.setStatus(newStatus);
        ComplaintStatusHistory history = ComplaintStatusHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(currentUser.getFullName())
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Status updated during committee investigation")
                .build();
        statusHistoryRepository.save(history);
        complaint.getStatusHistories().add(history);

        complaintRepository.save(complaint);

        auditService.recordAction(
                AuditAction.STATUS_CHANGED,
                "COMPLAINT",
                complaint.getComplaintReference(),
                oldStatus.name(),
                newStatus.name()
        );

        return getAssignedComplaintById(complaintId);
    }

    @Override
    @Transactional
    public AttachmentResponse addInvestigationAttachment(Long complaintId, MultipartFile file) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        validateAccess(complaint);
        ComplaintAttachment attachment = fileStorageService.storeFile(file, complaint);
        complaint.getAttachments().add(attachment);
        complaintRepository.save(complaint);

        auditService.recordAction(
                AuditAction.INVESTIGATION_UPDATED,
                "COMPLAINT_ATTACHMENT",
                attachment.getId().toString(),
                null,
                "Evidence file uploaded by committee: " + attachment.getOriginalFileName()
        );

        return mapper.toAttachmentResponse(attachment);
    }

    private void validateAccess(Complaint complaint) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return; // Admin can access any complaint
        }
        boolean isAssigned = assignmentRepository.existsByComplaintIdAndCommitteeMemberIdAndActiveTrue(
                complaint.getId(), currentUser.getId()
        );
        if (!isAssigned) {
            throw new ForbiddenException("You do not have authorization to access this complaint. It is not currently assigned to you.");
        }
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
