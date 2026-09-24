package com.hospital.grievance.service;

import com.hospital.grievance.dto.response.AttachmentResponse;
import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.entity.ComplaintAttachment;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileStorageService {

    ComplaintAttachment storeFile(MultipartFile file, Complaint complaint);

    List<ComplaintAttachment> storeFiles(List<MultipartFile> files, Complaint complaint);

    Resource loadFileAsResource(String storedFileName);

    ComplaintAttachment getAttachmentById(Long attachmentId);

    void deleteFile(String storedFileName);
}
