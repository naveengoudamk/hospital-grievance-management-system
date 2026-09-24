package com.hospital.grievance.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackComplaintRequest {

    @NotBlank(message = "Complaint reference is required")
    private String complaintReference;

    @NotBlank(message = "Tracking token is required")
    private String trackingToken;
}
