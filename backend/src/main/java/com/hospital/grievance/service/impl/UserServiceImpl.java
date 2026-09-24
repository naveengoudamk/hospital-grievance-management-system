package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.UserCreateRequest;
import com.hospital.grievance.dto.request.UserUpdateRequest;
import com.hospital.grievance.dto.response.PagedResponse;
import com.hospital.grievance.dto.response.UserResponse;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.exception.DuplicateResourceException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.UserMapper;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(Role role, Boolean active, String search, Pageable pageable) {
        Page<User> page = userRepository.findByFilters(role, active, search, pageable);
        return PagedResponse.fromPage(page.map(userMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveCommitteeMembers() {
        return userRepository.findByRoleAndActiveTrue(Role.ROLE_COMMITTEE_MEMBER).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered.");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .username(request.getUsername().trim().toLowerCase())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        User saved = userRepository.save(user);

        auditService.recordAction(
                AuditAction.USER_CREATED,
                "USER",
                saved.getId().toString(),
                null,
                "Created user " + saved.getUsername() + " with role " + saved.getRole()
        );

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        userRepository.findByEmail(request.getEmail().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already in use.");
                });

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getActive() != null) user.setActive(request.getActive());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        User updated = userRepository.save(user);

        auditService.recordAction(
                AuditAction.USER_UPDATED,
                "USER",
                updated.getId().toString(),
                null,
                "Updated details for user " + updated.getUsername()
        );

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(active);
        User saved = userRepository.save(user);

        auditService.recordAction(
                active ? AuditAction.USER_ENABLED : AuditAction.USER_DISABLED,
                "USER",
                saved.getId().toString(),
                null,
                "User " + (active ? "enabled" : "disabled") + ": " + saved.getUsername()
        );

        return userMapper.toResponse(saved);
    }
}
