package com.hospital.grievance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicComplaintRequest {

    @NotNull(message = "Complaint category is required")
    private Long categoryId;

    private Long locationId;

    @NotBlank(message = "Description of the issue is required")
    @Size(min = 10, max = 4000, message = "Description must be between 10 and 4000 characters")
    private String description;

    @Builder.Default
    private boolean isAnonymous = false;

    private String complainantName;

    private String complainantPhone;

    private String complainantEmail;

    private String preferredContactMethod;

    private LocalDateTime incidentDate;
}
