package com.hospital.grievance.controller;

import com.hospital.grievance.dto.request.InvestigationRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.service.CommitteeComplaintService;
import com.hospital.grievance.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/committee")
@PreAuthorize("hasAnyAuthority('ROLE_COMMITTEE_MEMBER', 'ROLE_ADMIN')")
@RequiredArgsConstructor
public class CommitteeController {

    private final CommitteeComplaintService committeeComplaintService;
    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> metrics = dashboardService.getCommitteeDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintSummaryResponse>>> getAssignedComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ComplaintSummaryResponse> response = committeeComplaintService.getAssignedComplaints(
                status, priority, search, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> getAssignedComplaintById(@PathVariable Long id) {
        ComplaintDetailResponse response = committeeComplaintService.getAssignedComplaintById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/complaints/{id}/investigation")
    public ResponseEntity<ApiResponse<InvestigationResponse>> recordInvestigation(
            @PathVariable Long id,
            @Valid @RequestBody InvestigationRequest request
    ) {
        InvestigationResponse response = committeeComplaintService.recordInvestigation(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Investigation details saved"));
    }

    @PutMapping("/complaints/{id}/investigation")
    public ResponseEntity<ApiResponse<InvestigationResponse>> updateInvestigation(
            @PathVariable Long id,
            @Valid @RequestBody InvestigationRequest request
    ) {
        InvestigationResponse response = committeeComplaintService.recordInvestigation(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Investigation updated"));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        ComplaintDetailResponse response = committeeComplaintService.updateInvestigationStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Investigation status updated"));
    }

    @PostMapping(value = "/complaints/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        AttachmentResponse response = committeeComplaintService.addInvestigationAttachment(id, file);
        return ResponseEntity.ok(ApiResponse.ok(response, "Evidence file uploaded"));
    }
}
