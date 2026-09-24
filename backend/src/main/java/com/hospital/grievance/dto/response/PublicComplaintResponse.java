package com.hospital.grievance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicComplaintResponse {
    private String complaintReference;
    private String trackingToken;
    private String status;
    private String message;
    private LocalDateTime submittedAt;
    private String categoryName;
    private String locationName;
}
