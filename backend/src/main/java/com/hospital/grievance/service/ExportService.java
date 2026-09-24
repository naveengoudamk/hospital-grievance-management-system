package com.hospital.grievance.service;

import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;

public interface ExportService {

    ByteArrayInputStream exportComplaintsToCsv(
            ComplaintStatus status,
            Priority priority,
            Long categoryId,
            Long locationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String search
    );
}
