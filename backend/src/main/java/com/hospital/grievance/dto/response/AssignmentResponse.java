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
public class AssignmentResponse {
    private Long id;
    private Long complaintId;
    private Long committeeMemberId;
    private String committeeMemberName;
    private String committeeMemberEmail;
    private Long assignedById;
    private String assignedByName;
    private LocalDateTime assignedAt;
    private String remarks;
    private boolean active;
}
