package com.hospital.grievance.dto.request;

import com.hospital.grievance.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequest {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    private String remarks;
}
