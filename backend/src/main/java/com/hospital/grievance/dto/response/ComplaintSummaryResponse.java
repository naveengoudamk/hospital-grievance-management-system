package com.hospital.grievance.dto.response;

import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintSummaryResponse {
    private Long id;
    private String complaintReference;
    private String categoryName;
    private Long categoryId;
    private String locationName;
    private Long locationId;
    private String descriptionSnippet;
    private boolean isAnonymous;
    private String complainantName;
    private Priority priority;
    private ComplaintStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime incidentDate;
    private int attachmentCount;
    private String assignedMemberName;
    private Long assignedMemberId;
    private String investigationStatus;
}
