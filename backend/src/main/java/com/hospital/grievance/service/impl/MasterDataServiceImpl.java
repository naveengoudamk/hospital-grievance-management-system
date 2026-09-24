package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.CategoryRequest;
import com.hospital.grievance.dto.request.LocationRequest;
import com.hospital.grievance.dto.response.CategoryResponse;
import com.hospital.grievance.dto.response.LocationResponse;
import com.hospital.grievance.entity.ComplaintCategory;
import com.hospital.grievance.entity.Hospital;
import com.hospital.grievance.entity.Location;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.exception.DuplicateResourceException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.ComplaintCategoryRepository;
import com.hospital.grievance.repository.HospitalRepository;
import com.hospital.grievance.repository.LocationRepository;
import com.hospital.grievance.repository.SystemSettingRepository;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MasterDataServiceImpl implements MasterDataService {

    private final ComplaintCategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final HospitalRepository hospitalRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final ComplaintMapper mapper;
    private final AuditService auditService;

    @Value("${app.frontend.public-url:http://localhost:5173/public}")
    private String publicFrontendUrl;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        ComplaintCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapper.toCategoryResponse(cat);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Complaint category already exists with name: " + request.getName());
        }

        ComplaintCategory category = ComplaintCategory.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .severityDefault(request.getSeverityDefault() != null ? request.getSeverityDefault() : "MEDIUM")
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        ComplaintCategory saved = categoryRepository.save(category);

        auditService.recordAction(
                AuditAction.CATEGORY_CREATED,
                "CATEGORY",
                saved.getId().toString(),
                null,
                "Created category: " + saved.getName()
        );

        return mapper.toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String oldName = category.getName();
        category.setName(request.getName().trim());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getSeverityDefault() != null) category.setSeverityDefault(request.getSeverityDefault());
        if (request.getActive() != null) category.setActive(request.getActive());

        ComplaintCategory updated = categoryRepository.save(category);

        auditService.recordAction(
                AuditAction.CATEGORY_UPDATED,
                "CATEGORY",
                updated.getId().toString(),
                oldName,
                updated.getName()
        );

        return mapper.toCategoryResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getActiveLocations() {
        return locationRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(mapper::toLocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(mapper::toLocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getLocationById(Long id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        return mapper.toLocationResponse(loc);
    }

    @Override
    @Transactional
    public LocationResponse createLocation(LocationRequest request) {
        if (locationRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Hospital location already exists with name: " + request.getName());
        }

        Hospital hospital = getHospitalInfo();

        Location location = Location.builder()
                .hospital(hospital)
                .name(request.getName().trim())
                .description(request.getDescription())
                .floorNumber(request.getFloorNumber())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Location saved = locationRepository.save(location);

        auditService.recordAction(
                AuditAction.LOCATION_CREATED,
                "LOCATION",
                saved.getId().toString(),
                null,
                "Created location: " + saved.getName()
        );

        return mapper.toLocationResponse(saved);
    }

    @Override
    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        String oldName = location.getName();
        location.setName(request.getName().trim());
        if (request.getDescription() != null) location.setDescription(request.getDescription());
        if (request.getFloorNumber() != null) location.setFloorNumber(request.getFloorNumber());
        if (request.getActive() != null) location.setActive(request.getActive());

        Location updated = locationRepository.save(location);

        auditService.recordAction(
                AuditAction.LOCATION_UPDATED,
                "LOCATION",
                updated.getId().toString(),
                oldName,
                updated.getName()
        );

        return mapper.toLocationResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Hospital getHospitalInfo() {
        return hospitalRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(() -> {
                    Hospital h = Hospital.builder()
                            .name("City General Hospital & Research Center")
                            .address("100 Healthcare Boulevard, Metro City")
                            .phone("+1 (555) 234-5678")
                            .email("grievance@citygeneral.org")
                            .emergencyNumber("112 / +1 (555) 911-0000")
                            .active(true)
                            .build();
                    return hospitalRepository.save(h);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getPublicConfig() {
        Hospital hospital = getHospitalInfo();
        Map<String, String> config = new HashMap<>();
        config.put("hospitalName", hospital.getName());
        config.put("hospitalAddress", hospital.getAddress());
        config.put("hospitalPhone", hospital.getPhone());
        config.put("hospitalEmail", hospital.getEmail());
        config.put("emergencyNumber", hospital.getEmergencyNumber());
        config.put("publicUrl", publicFrontendUrl);

        systemSettingRepository.findAll().forEach(setting ->
                config.put(setting.getSettingKey(), setting.getSettingValue())
        );

        return config;
    }
}
