package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.UserCreateRequest;
import com.hospital.grievance.dto.request.UserUpdateRequest;
import com.hospital.grievance.dto.response.PagedResponse;
import com.hospital.grievance.dto.response.UserResponse;
import com.hospital.grievance.enums.Role;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    PagedResponse<UserResponse> getUsers(Role role, Boolean active, String search, Pageable pageable);

    List<UserResponse> getActiveCommitteeMembers();

    UserResponse getUserById(Long id);

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    UserResponse toggleUserStatus(Long id, boolean active);
}
