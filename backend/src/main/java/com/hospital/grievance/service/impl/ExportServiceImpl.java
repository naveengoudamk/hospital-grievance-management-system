package com.hospital.grievance.service.impl;

import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.repository.ComplaintRepository;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.ExportService;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final ComplaintRepository complaintRepository;
    private final AuditService auditService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportComplaintsToCsv(
            ComplaintStatus status,
            Priority priority,
            Long categoryId,
            Long locationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String search
    ) {
        Page<Complaint> page = complaintRepository.searchComplaints(
                status, priority, categoryId, locationId, startDate, endDate, search,
                PageRequest.of(0, 5000, Sort.by(Sort.Direction.DESC, "submittedAt"))
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            // CSV Header
            writer.writeNext(new String[]{
                    "Complaint Reference",
                    "Category",
                    "Location",
                    "Priority",
                    "Status",
                    "Is Anonymous",
                    "Complainant Name",
                    "Complainant Phone",
                    "Complainant Email",
                    "Submitted Date",
                    "Incident Date",
                    "Resolved Date",
                    "Description Snippet"
            });

            for (Complaint c : page.getContent()) {
                String snippet = c.getDescription() != null
                        ? c.getDescription().replace("\n", " ").replace("\r", " ")
                        : "";
                if (snippet.length() > 200) {
                    snippet = snippet.substring(0, 197) + "...";
                }

                writer.writeNext(new String[]{
                        c.getComplaintReference(),
                        c.getCategory() != null ? c.getCategory().getName() : "",
                        c.getLocation() != null ? c.getLocation().getName() : "General",
                        c.getPriority() != null ? c.getPriority().name() : "",
                        c.getStatus() != null ? c.getStatus().name() : "",
                        String.valueOf(c.isAnonymous()),
                        c.isAnonymous() ? "ANONYMOUS" : (c.getComplainantName() != null ? c.getComplainantName() : ""),
                        c.isAnonymous() ? "N/A" : (c.getComplainantPhone() != null ? c.getComplainantPhone() : ""),
                        c.isAnonymous() ? "N/A" : (c.getComplainantEmail() != null ? c.getComplainantEmail() : ""),
                        c.getSubmittedAt() != null ? c.getSubmittedAt().format(DATE_FORMATTER) : "",
                        c.getIncidentDate() != null ? c.getIncidentDate().format(DATE_FORMATTER) : "",
                        c.getResolvedAt() != null ? c.getResolvedAt().format(DATE_FORMATTER) : "",
                        snippet
                });
            }

            auditService.recordAction(
                    AuditAction.DATA_EXPORTED,
                    "COMPLAINTS_CSV",
                    "EXPORT",
                    null,
                    "Exported " + page.getTotalElements() + " complaints to CSV"
            );

        } catch (Exception e) {
            log.error("Error generating complaints CSV export: {}", e.getMessage(), e);
            throw new RuntimeException("Could not generate CSV export: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
