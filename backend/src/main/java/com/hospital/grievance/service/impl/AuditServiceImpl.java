package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.response.AuditLogResponse;
import com.hospital.grievance.dto.response.PagedResponse;
import com.hospital.grievance.entity.AuditLog;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.AuditLogRepository;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ComplaintMapper mapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAction(AuditAction action, String entityType, String entityId, String oldValue, String newValue) {
        Long userId = null;
        String username = "ANONYMOUS";

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
                userId = userDetails.getId();
                username = userDetails.getUsername();
            } else if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                username = auth.getName();
            }
        } catch (Exception e) {
            log.debug("Could not resolve current user for audit: {}", e.getMessage());
        }

        recordActionWithUser(userId, username, action, entityType, entityId, oldValue, newValue);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordActionWithUser(Long userId, String username, AuditAction action, String entityType, String entityId, String oldValue, String newValue) {
        String ipAddress = resolveClientIp();

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
        log.info("AUDIT: User [{}] performed [{}] on [{}] (ID: {})", username, action, entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> searchAuditLogs(
            AuditAction action,
            String entityType,
            String entityId,
            String username,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Page<AuditLog> page = auditLogRepository.searchAuditLogs(
                action, entityType, entityId, username, startDate, endDate, pageable
        );
        return PagedResponse.fromPage(page.map(mapper::toAuditLogResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getAuditActionSummary() {
        java.util.List<Object[]> results = auditLogRepository.countByActionGroup();
        java.util.Map<String, Long> summary = new java.util.LinkedHashMap<>();
        for (Object[] row : results) {
            if (row != null && row.length >= 2 && row[0] != null) {
                summary.put(row[0].toString(), (Long) row[1]);
            }
        }
        return summary;
    }

    private String resolveClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xfHeader = request.getHeader("X-Forwarded-For");
                if (xfHeader != null && !xfHeader.isEmpty() && !"unknown".equalsIgnoreCase(xfHeader)) {
                    return xfHeader.split(",")[0].trim();
                }
                String realIp = request.getHeader("X-Real-IP");
                if (realIp != null && !realIp.isEmpty() && !"unknown".equalsIgnoreCase(realIp)) {
                    return realIp.trim();
                }
                String cfIp = request.getHeader("CF-Connecting-IP");
                if (cfIp != null && !cfIp.isEmpty() && !"unknown".equalsIgnoreCase(cfIp)) {
                    return cfIp.trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }
}
