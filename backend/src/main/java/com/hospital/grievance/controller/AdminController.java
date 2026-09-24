package com.hospital.grievance.controller;

import com.hospital.grievance.dto.request.*;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;
    private final AdminComplaintService adminComplaintService;
    private final UserService userService;
    private final MasterDataService masterDataService;
    private final QrCodeGeneratorService qrCodeGeneratorService;
    private final AuditService auditService;
    private final ExportService exportService;

    // --- DASHBOARD ---
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getDashboardMetrics() {
        DashboardMetricsResponse metrics = dashboardService.getAdminDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    // --- COMPLAINTS MANAGEMENT ---
    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintSummaryResponse>>> getComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ComplaintSummaryResponse> result = adminComplaintService.searchComplaints(
                status, priority, categoryId, locationId, startDate, endDate, search, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintDetailResponse complaint = adminComplaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.ok(complaint));
    }

    @PutMapping("/complaints/{id}/priority")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriorityRequest request
    ) {
        ComplaintDetailResponse response = adminComplaintService.updatePriority(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Complaint priority updated successfully"));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        ComplaintDetailResponse response = adminComplaintService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Complaint status updated successfully"));
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request
    ) {
        ComplaintDetailResponse response = adminComplaintService.assignComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Complaint assigned successfully"));
    }

    @GetMapping("/complaints/{id}/history")
    public ResponseEntity<ApiResponse<List<StatusHistoryResponse>>> getStatusHistory(@PathVariable Long id) {
        List<StatusHistoryResponse> history = adminComplaintService.getStatusHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/complaints/export")
    public ResponseEntity<Resource> exportComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search
    ) {
        ByteArrayInputStream in = exportService.exportComplaintsToCsv(
                status, priority, categoryId, locationId, startDate, endDate, search
        );
        InputStreamResource file = new InputStreamResource(in);
        String filename = "complaints_export_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }

    // --- USER MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        PagedResponse<UserResponse> result = userService.getUsers(role, active, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/committee-members")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getActiveCommitteeMembers() {
        List<UserResponse> members = userService.getActiveCommitteeMembers();
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "User created successfully"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "User updated successfully"));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        UserResponse response = userService.toggleUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok(response, "User status updated successfully"));
    }

    // --- CATEGORIES MANAGEMENT ---
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = masterDataService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = masterDataService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Category created successfully"));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = masterDataService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Category updated successfully"));
    }

    // --- LOCATIONS MANAGEMENT ---
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getAllLocations() {
        List<LocationResponse> locations = masterDataService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.ok(locations));
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<LocationResponse>> createLocation(@Valid @RequestBody LocationRequest request) {
        LocationResponse response = masterDataService.createLocation(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Location created successfully"));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request
    ) {
        LocationResponse response = masterDataService.updateLocation(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Location updated successfully"));
    }

    // --- AUDIT LOGS ---
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<AuditLogResponse> logs = auditService.searchAuditLogs(
                action, entityType, entityId, username, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    // --- UNIVERSAL QR CODE MANAGEMENT ---
    @GetMapping("/qr")
    public ResponseEntity<ApiResponse<QrConfigResponse>> getActiveQr() {
        QrConfigResponse qrConfig = qrCodeGeneratorService.getActiveQrConfig();
        return ResponseEntity.ok(ApiResponse.ok(qrConfig));
    }

    @PostMapping("/qr/generate")
    public ResponseEntity<ApiResponse<QrConfigResponse>> generateQr(@Valid @RequestBody QrGenerateRequest request) {
        QrConfigResponse qrConfig = qrCodeGeneratorService.generateQrCode(request);
        return ResponseEntity.ok(ApiResponse.ok(qrConfig, "Universal QR Code regenerated successfully"));
    }

    @GetMapping("/qr/download")
    public ResponseEntity<byte[]> downloadQrImage(
            @RequestParam(defaultValue = "600") int width,
            @RequestParam(defaultValue = "600") int height
    ) {
        byte[] pngBytes = qrCodeGeneratorService.getQrCodePngBytes(width, height);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"hospital-universal-qr.png\"")
                .body(pngBytes);
    }
}
