package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.PublicComplaintRequest;
import com.hospital.grievance.dto.request.TrackComplaintRequest;
import com.hospital.grievance.dto.response.PublicComplaintResponse;
import com.hospital.grievance.dto.response.TrackComplaintResponse;
import com.hospital.grievance.entity.*;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.exception.InvalidComplaintException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.FileStorageService;
import com.hospital.grievance.service.PublicComplaintService;
import com.hospital.grievance.util.ReferenceNumberGenerator;
import com.hospital.grievance.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicComplaintServiceImpl implements PublicComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final HospitalRepository hospitalRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final FileStorageService fileStorageService;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final TokenGenerator tokenGenerator;
    private final ComplaintMapper complaintMapper;
    private final AuditService auditService;

    @Override
    @Transactional
    public PublicComplaintResponse submitComplaint(PublicComplaintRequest request, List<MultipartFile> files) {
        ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                .filter(ComplaintCategory::isActive)
                .orElseThrow(() -> new InvalidComplaintException("Selected complaint category does not exist or is inactive."));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .filter(Location::isActive)
                    .orElseThrow(() -> new InvalidComplaintException("Selected hospital location does not exist or is inactive."));
        }

        Hospital hospital = hospitalRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(() -> hospitalRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new InvalidComplaintException("No active hospital profile configured in system.")));

        // Validation for non-anonymous submissions
        if (!request.isAnonymous()) {
            if (request.getComplainantName() == null || request.getComplainantName().trim().isBlank()) {
                throw new InvalidComplaintException("Name is required when complaint is not marked anonymous.");
            }
            if (request.getComplainantPhone() == null || request.getComplainantPhone().trim().isBlank()) {
                throw new InvalidComplaintException("Phone number is required when complaint is not marked anonymous.");
            }
        }

        // Generate unique reference number
        String complaintReference = referenceNumberGenerator.generateComplaintReference();
        while (complaintRepository.findByComplaintReference(complaintReference).isPresent()) {
            complaintReference = referenceNumberGenerator.generateComplaintReference();
        }

        // Generate tracking token and hash
        String rawTrackingToken = tokenGenerator.generateTrackingToken(16);
        String tokenHash = tokenGenerator.hashToken(rawTrackingToken);

        // Determine default priority from category default
        Priority initialPriority = Priority.MEDIUM;
        if (category.getSeverityDefault() != null) {
            try {
                initialPriority = Priority.valueOf(category.getSeverityDefault().toUpperCase());
            } catch (Exception ignored) {}
        }

        Complaint complaint = Complaint.builder()
                .complaintReference(complaintReference)
                .hospital(hospital)
                .location(location)
                .category(category)
                .description(request.getDescription().trim())
                .isAnonymous(request.isAnonymous())
                .complainantName(request.isAnonymous() ? null : request.getComplainantName().trim())
                .complainantPhone(request.isAnonymous() ? null : request.getComplainantPhone().trim())
                .complainantEmail(request.isAnonymous() || request.getComplainantEmail() == null ? null : request.getComplainantEmail().trim())
                .preferredContactMethod(request.getPreferredContactMethod())
                .incidentDate(request.getIncidentDate() != null ? request.getIncidentDate() : LocalDateTime.now())
                .priority(initialPriority)
                .status(ComplaintStatus.SUBMITTED)
                .trackingTokenHash(tokenHash)
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Store attachments if any
        if (files != null && !files.isEmpty()) {
            List<ComplaintAttachment> attachments = fileStorageService.storeFiles(files, savedComplaint);
            savedComplaint.getAttachments().addAll(attachments);
        }

        // Record initial status history
        ComplaintStatusHistory initialHistory = ComplaintStatusHistory.builder()
                .complaint(savedComplaint)
                .oldStatus(null)
                .newStatus(ComplaintStatus.SUBMITTED)
                .changedBy(request.isAnonymous() ? "Public Complainant (Anonymous)" : "Public Complainant: " + request.getComplainantName())
                .remarks("Grievance submitted via Universal QR Code Portal")
                .build();
        statusHistoryRepository.save(initialHistory);

        // Audit entry
        auditService.recordAction(
                AuditAction.COMPLAINT_SUBMITTED,
                "COMPLAINT",
                savedComplaint.getComplaintReference(),
                null,
                "Complaint registered under category " + category.getName() + " (Anonymous: " + request.isAnonymous() + ")"
        );

        return PublicComplaintResponse.builder()
                .complaintReference(savedComplaint.getComplaintReference())
                .trackingToken(rawTrackingToken)
                .status(savedComplaint.getStatus().name())
                .categoryName(category.getName())
                .locationName(location != null ? location.getName() : "General Hospital Area")
                .submittedAt(savedComplaint.getSubmittedAt())
                .message("Complaint submitted successfully. Please save your Reference Number and Tracking Token to monitor review progress.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TrackComplaintResponse trackComplaint(TrackComplaintRequest request) {
        String ref = request.getComplaintReference().trim().toUpperCase();
        Complaint complaint = complaintRepository.findByComplaintReference(ref)
                .orElseThrow(() -> new ResourceNotFoundException("No grievance record found with the provided Reference Number and Tracking Token."));

        if (!tokenGenerator.matches(request.getTrackingToken().trim(), complaint.getTrackingTokenHash())) {
            log.warn("Invalid tracking token attempt for complaint reference: {}", ref);
            throw new ResourceNotFoundException("No grievance record found with the provided Reference Number and Tracking Token.");
        }

        return complaintMapper.toTrackComplaintResponse(complaint);
    }
}
