package com.hospital.grievance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {
    private long totalComplaints;
    private long newComplaints;
    private long underReview;
    private long assigned;
    private long underInvestigation;
    private long actionTaken;
    private long resolved;
    private long closed;
    private long rejected;
    private long criticalCount;

    private Map<String, Long> categoryDistribution;
    private Map<String, Long> locationDistribution;
    private Map<String, Long> statusDistribution;

    private List<ComplaintSummaryResponse> recentComplaints;
    private List<ComplaintSummaryResponse> criticalComplaints;
}
