package com.hospital.grievance.dto.response;

import com.hospital.grievance.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryResponse {
    private Long id;
    private Long complaintId;
    private ComplaintStatus oldStatus;
    private ComplaintStatus newStatus;
    private String changedBy;
    private String remarks;
    private LocalDateTime changedAt;
}
