package com.hospital.grievance.service;

import com.hospital.grievance.dto.response.AuditLogResponse;
import com.hospital.grievance.dto.response.PagedResponse;
import com.hospital.grievance.enums.AuditAction;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AuditService {

    void recordAction(AuditAction action, String entityType, String entityId, String oldValue, String newValue);

    void recordActionWithUser(Long userId, String username, AuditAction action, String entityType, String entityId, String oldValue, String newValue);

    PagedResponse<AuditLogResponse> searchAuditLogs(
            AuditAction action,
            String entityType,
            String entityId,
            String username,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );
}
