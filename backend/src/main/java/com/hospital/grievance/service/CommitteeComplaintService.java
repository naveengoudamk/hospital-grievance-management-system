package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.InvestigationRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CommitteeComplaintService {

    PagedResponse<ComplaintSummaryResponse> getAssignedComplaints(
            ComplaintStatus status,
            Priority priority,
            String search,
            Pageable pageable
    );

    ComplaintDetailResponse getAssignedComplaintById(Long complaintId);

    InvestigationResponse recordInvestigation(Long complaintId, InvestigationRequest request);

    ComplaintDetailResponse updateInvestigationStatus(Long complaintId, UpdateStatusRequest request);

    AttachmentResponse addInvestigationAttachment(Long complaintId, MultipartFile file);
}
