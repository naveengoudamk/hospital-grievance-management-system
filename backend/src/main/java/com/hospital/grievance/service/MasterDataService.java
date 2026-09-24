package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.CategoryRequest;
import com.hospital.grievance.dto.request.LocationRequest;
import com.hospital.grievance.dto.response.CategoryResponse;
import com.hospital.grievance.dto.response.LocationResponse;
import com.hospital.grievance.entity.Hospital;

import java.util.List;
import java.util.Map;

public interface MasterDataService {

    List<CategoryResponse> getActiveCategories();

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    List<LocationResponse> getActiveLocations();

    List<LocationResponse> getAllLocations();

    LocationResponse getLocationById(Long id);

    LocationResponse createLocation(LocationRequest request);

    LocationResponse updateLocation(Long id, LocationRequest request);

    Hospital getHospitalInfo();

    Map<String, String> getPublicConfig();
}
