package com.hospital.grievance.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignComplaintRequest {

    @NotNull(message = "Committee member ID is required")
    private Long committeeMemberId;

    private String remarks;
}
