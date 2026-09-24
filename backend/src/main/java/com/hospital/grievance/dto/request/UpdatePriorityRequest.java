package com.hospital.grievance.dto.request;

import com.hospital.grievance.enums.Priority;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePriorityRequest {

    @NotNull(message = "Priority is required")
    private Priority priority;

    private String remarks;
}
