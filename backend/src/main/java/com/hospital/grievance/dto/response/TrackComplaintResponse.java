package com.hospital.grievance.dto.response;

import com.hospital.grievance.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackComplaintResponse {
    private String complaintReference;
    private String categoryName;
    private String locationName;
    private ComplaintStatus currentStatus;
    private String statusDisplayName;
    private String statusMessage;
    private LocalDateTime submittedAt;
    private LocalDateTime incidentDate;
    private LocalDateTime resolvedAt;
    private int attachmentCount;
    private List<TrackingTimelineStep> timeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingTimelineStep {
        private String stepKey;
        private String title;
        private String description;
        private boolean completed;
        private boolean current;
        private LocalDateTime timestamp;
    }
}
