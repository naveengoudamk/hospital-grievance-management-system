package com.hospital.grievance.service;

import com.hospital.grievance.dto.response.DashboardMetricsResponse;

import java.util.Map;

public interface DashboardService {

    DashboardMetricsResponse getAdminDashboardMetrics();

    Map<String, Object> getCommitteeDashboardMetrics();
}
