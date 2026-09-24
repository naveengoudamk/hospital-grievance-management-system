package com.hospital.grievance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hospital.grievance.dto.request.PublicComplaintRequest;
import com.hospital.grievance.dto.request.TrackComplaintRequest;
import com.hospital.grievance.dto.response.*;
import com.hospital.grievance.entity.ComplaintAttachment;
import com.hospital.grievance.service.FileStorageService;
import com.hospital.grievance.service.MasterDataService;
import com.hospital.grievance.service.PublicComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicComplaintController {

    private final PublicComplaintService publicComplaintService;
    private final MasterDataService masterDataService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostMapping(value = "/complaints", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<PublicComplaintResponse>> submitComplaintMultipart(
            @RequestPart("complaint") String complaintJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            PublicComplaintRequest request = objectMapper.readValue(complaintJson, PublicComplaintRequest.class);
            PublicComplaintResponse response = publicComplaintService.submitComplaint(request, files);
            return ResponseEntity.ok(ApiResponse.ok(response, "Complaint submitted successfully"));
        } catch (Exception ex) {
            log.error("Failed to parse complaint submission request: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid complaint submission payload: " + ex.getMessage());
        }
    }

    @PostMapping(value = "/complaints/json", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<PublicComplaintResponse>> submitComplaintJson(
            @Valid @RequestBody PublicComplaintRequest request
    ) {
        PublicComplaintResponse response = publicComplaintService.submitComplaint(request, null);
        return ResponseEntity.ok(ApiResponse.ok(response, "Complaint submitted successfully"));
    }

    @PostMapping("/complaints/track")
    public ResponseEntity<ApiResponse<TrackComplaintResponse>> trackComplaint(
            @Valid @RequestBody TrackComplaintRequest request
    ) {
        TrackComplaintResponse response = publicComplaintService.trackComplaint(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Tracking details retrieved"));
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicConfig() {
        Map<String, String> config = masterDataService.getPublicConfig();
        return ResponseEntity.ok(ApiResponse.ok(config));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories() {
        List<CategoryResponse> categories = masterDataService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getActiveLocations() {
        List<LocationResponse> locations = masterDataService.getActiveLocations();
        return ResponseEntity.ok(ApiResponse.ok(locations));
    }

    @GetMapping("/complaints/attachments/{id}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
        ComplaintAttachment attachment = fileStorageService.getAttachmentById(id);
        Resource resource = fileStorageService.loadFileAsResource(attachment.getStoredFileName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }
}
