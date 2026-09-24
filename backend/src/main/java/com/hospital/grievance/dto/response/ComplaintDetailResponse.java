package com.hospital.grievance.dto.response;

import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDetailResponse {
    private Long id;
    private String complaintReference;
    private Long hospitalId;
    private String hospitalName;
    private Long categoryId;
    private String categoryName;
    private Long locationId;
    private String locationName;
    private String description;
    private boolean isAnonymous;
    private String complainantName;
    private String complainantPhone;
    private String complainantEmail;
    private String preferredContactMethod;
    private LocalDateTime incidentDate;
    private Priority priority;
    private ComplaintStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    private List<AttachmentResponse> attachments;
    private List<AssignmentResponse> assignments;
    private List<InvestigationResponse> investigations;
    private List<StatusHistoryResponse> statusHistories;
    private List<AuditLogResponse> auditLogs;
}
