package com.hospital.grievance.dto.request;

import com.hospital.grievance.enums.InvestigationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationRequest {

    @NotBlank(message = "Investigation summary is required")
    private String investigationSummary;

    private String findings;

    private String actionTaken;

    private InvestigationStatus status;

    private boolean completeInvestigation;
}
