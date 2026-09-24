package com.hospital.grievance.service.impl;

import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.entity.ComplaintAttachment;
import com.hospital.grievance.exception.FileValidationException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.repository.ComplaintAttachmentRepository;
import com.hospital.grievance.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final ComplaintAttachmentRepository attachmentRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "pdf"
    );

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("File upload directory initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileValidationException("Could not create directory for upload files: " + ex.getMessage());
        }
    }

    @Override
    public ComplaintAttachment storeFile(MultipartFile file, Complaint complaint) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        validateFile(file);

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFileName.contains("..")) {
            throw new FileValidationException("Invalid filename with path traversal sequence: " + originalFileName);
        }

        String extension = getExtension(originalFileName);
        String storedFileName = UUID.randomUUID() + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            ComplaintAttachment attachment = ComplaintAttachment.builder()
                    .complaint(complaint)
                    .originalFileName(originalFileName)
                    .storedFileName(storedFileName)
                    .filePath(targetLocation.toString())
                    .fileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .fileSize(file.getSize())
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException ex) {
            throw new FileValidationException("Could not store file " + originalFileName + ". Error: " + ex.getMessage());
        }
    }

    @Override
    public List<ComplaintAttachment> storeFiles(List<MultipartFile> files, Complaint complaint) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        List<ComplaintAttachment> savedAttachments = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                savedAttachments.add(storeFile(file, complaint));
            }
        }
        return savedAttachments;
    }

    @Override
    public Resource loadFileAsResource(String storedFileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + storedFileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path error: " + ex.getMessage());
        }
    }

    @Override
    public ComplaintAttachment getAttachmentById(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
    }

    @Override
    public void deleteFile(String storedFileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Could not delete file {}: {}", storedFileName, ex.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException("File size exceeds the 10MB limit: " + file.getOriginalFilename());
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new FileValidationException("File name cannot be empty");
        }

        String extension = getExtension(originalFileName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileValidationException("File extension ." + extension + " is not allowed. Approved formats: JPG, JPEG, PNG, PDF");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            log.warn("File MIME type {} for {} not in strict list, verified by extension .{}", contentType, originalFileName, extension);
        }
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }
}
