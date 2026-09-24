package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.AssignComplaintRequest;
import com.hospital.grievance.dto.request.UpdatePriorityRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminComplaintService {

    PagedResponse<ComplaintSummaryResponse> searchComplaints(
            ComplaintStatus status,
            Priority priority,
            Long categoryId,
            Long locationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String search,
            Pageable pageable
    );

    ComplaintDetailResponse getComplaintById(Long id);

    ComplaintDetailResponse assignComplaint(Long complaintId, AssignComplaintRequest request);

    ComplaintDetailResponse updateStatus(Long complaintId, UpdateStatusRequest request);

    ComplaintDetailResponse updatePriority(Long complaintId, UpdatePriorityRequest request);

    List<StatusHistoryResponse> getStatusHistory(Long complaintId);
}
