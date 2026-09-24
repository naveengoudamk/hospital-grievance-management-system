package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.PublicComplaintRequest;
import com.hospital.grievance.dto.request.TrackComplaintRequest;
import com.hospital.grievance.dto.response.PublicComplaintResponse;
import com.hospital.grievance.dto.response.TrackComplaintResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PublicComplaintService {

    PublicComplaintResponse submitComplaint(PublicComplaintRequest request, List<MultipartFile> files);

    TrackComplaintResponse trackComplaint(TrackComplaintRequest request);
}
