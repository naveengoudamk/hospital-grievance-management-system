package com.hospital.grievance.dto.response;

import com.hospital.grievance.enums.InvestigationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationResponse {
    private Long id;
    private Long complaintId;
    private Long investigatorId;
    private String investigatorName;
    private String investigationSummary;
    private String findings;
    private String actionTaken;
    private InvestigationStatus investigationStatus;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
