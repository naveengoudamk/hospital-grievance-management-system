package com.hospital.grievance.mapper;

import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.entity.*;
import com.hospital.grievance.enums.ComplaintStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ComplaintMapper {

    public ComplaintSummaryResponse toSummaryResponse(Complaint complaint) {
        if (complaint == null) {
            return null;
        }

        String snippet = complaint.getDescription();
        if (snippet != null && snippet.length() > 140) {
            snippet = snippet.substring(0, 137) + "...";
        }

        // Get active assigned member name
        String assignedMemberName = null;
        Long assignedMemberId = null;
        if (complaint.getAssignments() != null) {
            for (ComplaintAssignment assignment : complaint.getAssignments()) {
                if (assignment.isActive() && assignment.getCommitteeMember() != null) {
                    assignedMemberName = assignment.getCommitteeMember().getFullName();
                    assignedMemberId = assignment.getCommitteeMember().getId();
                    break;
                }
            }
        }

        String invStatus = null;
        if (complaint.getInvestigations() != null && !complaint.getInvestigations().isEmpty()) {
            invStatus = complaint.getInvestigations().get(complaint.getInvestigations().size() - 1).getInvestigationStatus().name();
        }

        return ComplaintSummaryResponse.builder()
                .id(complaint.getId())
                .complaintReference(complaint.getComplaintReference())
                .categoryName(complaint.getCategory() != null ? complaint.getCategory().getName() : "Uncategorized")
                .categoryId(complaint.getCategory() != null ? complaint.getCategory().getId() : null)
                .locationName(complaint.getLocation() != null ? complaint.getLocation().getName() : "General / Not Specified")
                .locationId(complaint.getLocation() != null ? complaint.getLocation().getId() : null)
                .descriptionSnippet(snippet)
                .isAnonymous(complaint.isAnonymous())
                .complainantName(complaint.isAnonymous() ? "Anonymous Complainant" : complaint.getComplainantName())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .submittedAt(complaint.getSubmittedAt())
                .incidentDate(complaint.getIncidentDate())
                .attachmentCount(complaint.getAttachments() != null ? complaint.getAttachments().size() : 0)
                .assignedMemberName(assignedMemberName)
                .assignedMemberId(assignedMemberId)
                .investigationStatus(invStatus)
                .build();
    }

    public ComplaintDetailResponse toDetailResponse(Complaint complaint, List<AuditLog> auditLogs) {
        if (complaint == null) {
            return null;
        }

        List<AttachmentResponse> attachments = complaint.getAttachments() == null ? List.of() :
                complaint.getAttachments().stream().map(this::toAttachmentResponse).collect(Collectors.toList());

        List<AssignmentResponse> assignments = complaint.getAssignments() == null ? List.of() :
                complaint.getAssignments().stream().map(this::toAssignmentResponse).collect(Collectors.toList());

        List<InvestigationResponse> investigations = complaint.getInvestigations() == null ? List.of() :
                complaint.getInvestigations().stream().map(this::toInvestigationResponse).collect(Collectors.toList());

        List<StatusHistoryResponse> statusHistories = complaint.getStatusHistories() == null ? List.of() :
                complaint.getStatusHistories().stream()
                        .sorted(Comparator.comparing(ComplaintStatusHistory::getChangedAt))
                        .map(this::toStatusHistoryResponse)
                        .collect(Collectors.toList());

        List<AuditLogResponse> auditResponses = auditLogs == null ? List.of() :
                auditLogs.stream().map(this::toAuditLogResponse).collect(Collectors.toList());

        return ComplaintDetailResponse.builder()
                .id(complaint.getId())
                .complaintReference(complaint.getComplaintReference())
                .hospitalId(complaint.getHospital() != null ? complaint.getHospital().getId() : null)
                .hospitalName(complaint.getHospital() != null ? complaint.getHospital().getName() : null)
                .categoryId(complaint.getCategory() != null ? complaint.getCategory().getId() : null)
                .categoryName(complaint.getCategory() != null ? complaint.getCategory().getName() : null)
                .locationId(complaint.getLocation() != null ? complaint.getLocation().getId() : null)
                .locationName(complaint.getLocation() != null ? complaint.getLocation().getName() : "General / Not Specified")
                .description(complaint.getDescription())
                .isAnonymous(complaint.isAnonymous())
                .complainantName(complaint.isAnonymous() ? "Anonymous Complainant" : complaint.getComplainantName())
                .complainantPhone(complaint.isAnonymous() ? null : complaint.getComplainantPhone())
                .complainantEmail(complaint.isAnonymous() ? null : complaint.getComplainantEmail())
                .preferredContactMethod(complaint.getPreferredContactMethod())
                .incidentDate(complaint.getIncidentDate())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .submittedAt(complaint.getSubmittedAt())
                .updatedAt(complaint.getUpdatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .attachments(attachments)
                .assignments(assignments)
                .investigations(investigations)
                .statusHistories(statusHistories)
                .auditLogs(auditResponses)
                .build();
    }

    public AttachmentResponse toAttachmentResponse(ComplaintAttachment att) {
        if (att == null) return null;
        return AttachmentResponse.builder()
                .id(att.getId())
                .complaintId(att.getComplaint() != null ? att.getComplaint().getId() : null)
                .originalFileName(att.getOriginalFileName())
                .storedFileName(att.getStoredFileName())
                .fileType(att.getFileType())
                .fileSize(att.getFileSize())
                .downloadUrl("/api/public/complaints/attachments/" + att.getId())
                .uploadedAt(att.getUploadedAt())
                .build();
    }

    public AssignmentResponse toAssignmentResponse(ComplaintAssignment assign) {
        if (assign == null) return null;
        return AssignmentResponse.builder()
                .id(assign.getId())
                .complaintId(assign.getComplaint() != null ? assign.getComplaint().getId() : null)
                .committeeMemberId(assign.getCommitteeMember() != null ? assign.getCommitteeMember().getId() : null)
                .committeeMemberName(assign.getCommitteeMember() != null ? assign.getCommitteeMember().getFullName() : null)
                .committeeMemberEmail(assign.getCommitteeMember() != null ? assign.getCommitteeMember().getEmail() : null)
                .assignedById(assign.getAssignedBy() != null ? assign.getAssignedBy().getId() : null)
                .assignedByName(assign.getAssignedBy() != null ? assign.getAssignedBy().getFullName() : "System / Admin")
                .assignedAt(assign.getAssignedAt())
                .remarks(assign.getRemarks())
                .active(assign.isActive())
                .build();
    }

    public InvestigationResponse toInvestigationResponse(Investigation inv) {
        if (inv == null) return null;
        return InvestigationResponse.builder()
                .id(inv.getId())
                .complaintId(inv.getComplaint() != null ? inv.getComplaint().getId() : null)
                .investigatorId(inv.getInvestigator() != null ? inv.getInvestigator().getId() : null)
                .investigatorName(inv.getInvestigator() != null ? inv.getInvestigator().getFullName() : null)
                .investigationSummary(inv.getInvestigationSummary())
                .findings(inv.getFindings())
                .actionTaken(inv.getActionTaken())
                .investigationStatus(inv.getInvestigationStatus())
                .startedAt(inv.getStartedAt())
                .completedAt(inv.getCompletedAt())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    public StatusHistoryResponse toStatusHistoryResponse(ComplaintStatusHistory history) {
        if (history == null) return null;
        return StatusHistoryResponse.builder()
                .id(history.getId())
                .complaintId(history.getComplaint() != null ? history.getComplaint().getId() : null)
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy())
                .remarks(history.getRemarks())
                .changedAt(history.getChangedAt())
                .build();
    }

    public AuditLogResponse toAuditLogResponse(AuditLog log) {
        if (log == null) return null;
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(ComplaintCategory cat) {
        if (cat == null) return null;
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .severityDefault(cat.getSeverityDefault())
                .active(cat.isActive())
                .createdAt(cat.getCreatedAt())
                .build();
    }

    public LocationResponse toLocationResponse(Location loc) {
        if (loc == null) return null;
        return LocationResponse.builder()
                .id(loc.getId())
                .hospitalId(loc.getHospital() != null ? loc.getHospital().getId() : null)
                .name(loc.getName())
                .description(loc.getDescription())
                .floorNumber(loc.getFloorNumber())
                .active(loc.isActive())
                .createdAt(loc.getCreatedAt())
                .build();
    }

    public QrConfigResponse toQrConfigResponse(QrConfig qr) {
        if (qr == null) return null;
        return QrConfigResponse.builder()
                .id(qr.getId())
                .name(qr.getName())
                .publicUrl(qr.getPublicUrl())
                .qrCodeBase64(qr.getQrCodeBase64())
                .active(qr.isActive())
                .createdAt(qr.getCreatedAt())
                .updatedAt(qr.getUpdatedAt())
                .build();
    }

    public TrackComplaintResponse toTrackComplaintResponse(Complaint complaint) {
        if (complaint == null) return null;

        List<TrackComplaintResponse.TrackingTimelineStep> steps = new ArrayList<>();
        ComplaintStatus current = complaint.getStatus();

        int currentRank = getStatusRank(current);

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("SUBMITTED")
                .title("Complaint Submitted")
                .description("Your complaint has been safely recorded in the hospital registry.")
                .completed(currentRank >= 1)
                .current(current == ComplaintStatus.SUBMITTED)
                .timestamp(complaint.getSubmittedAt())
                .build());

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("UNDER_REVIEW")
                .title("Under Review")
                .description("Grievance desk is evaluating the reported issue and reviewing relevant records.")
                .completed(currentRank >= 2)
                .current(current == ComplaintStatus.UNDER_REVIEW)
                .build());

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("ASSIGNED")
                .title("Assigned to Officer / Committee")
                .description("Assigned to an authorized committee member or department officer for inquiry.")
                .completed(currentRank >= 3)
                .current(current == ComplaintStatus.ASSIGNED)
                .build());

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("INVESTIGATION")
                .title("Investigation & Fact-Finding")
                .description("Inquiry is underway to verify details and gather factual findings.")
                .completed(currentRank >= 4)
                .current(current == ComplaintStatus.INVESTIGATION)
                .build());

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("ACTION_TAKEN")
                .title("Action Taken")
                .description("Findings have been submitted and administrative or corrective actions initiated.")
                .completed(currentRank >= 5)
                .current(current == ComplaintStatus.ACTION_TAKEN)
                .build());

        steps.add(TrackComplaintResponse.TrackingTimelineStep.builder()
                .stepKey("RESOLVED")
                .title(current == ComplaintStatus.REJECTED ? "Review Concluded (Inadmissible)" : "Resolved & Closed")
                .description(current == ComplaintStatus.REJECTED
                        ? "Case review completed; could not be processed under the grievance policy."
                        : "Corrective measures finalized and complaint resolved by hospital administration.")
                .completed(currentRank >= 6)
                .current(current == ComplaintStatus.RESOLVED || current == ComplaintStatus.CLOSED || current == ComplaintStatus.REJECTED)
                .timestamp(complaint.getResolvedAt())
                .build());

        return TrackComplaintResponse.builder()
                .complaintReference(complaint.getComplaintReference())
                .categoryName(complaint.getCategory() != null ? complaint.getCategory().getName() : "General Grievance")
                .locationName(complaint.getLocation() != null ? complaint.getLocation().getName() : "General Hospital Campus")
                .currentStatus(complaint.getStatus())
                .statusDisplayName(complaint.getStatus().name().replace('_', ' '))
                .statusMessage(complaint.getStatus().getPublicDisplayMessage())
                .submittedAt(complaint.getSubmittedAt())
                .incidentDate(complaint.getIncidentDate())
                .resolvedAt(complaint.getResolvedAt())
                .attachmentCount(complaint.getAttachments() != null ? complaint.getAttachments().size() : 0)
                .timeline(steps)
                .build();
    }

    private int getStatusRank(ComplaintStatus status) {
        if (status == null) return 0;
        return switch (status) {
            case SUBMITTED -> 1;
            case UNDER_REVIEW -> 2;
            case ASSIGNED -> 3;
            case INVESTIGATION -> 4;
            case ACTION_TAKEN -> 5;
            case RESOLVED, CLOSED, REJECTED -> 6;
        };
    }
}
