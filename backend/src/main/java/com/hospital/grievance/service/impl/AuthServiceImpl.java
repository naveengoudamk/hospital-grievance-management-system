package com.hospital.grievance.service.impl;

import com.hospital.grievance.dto.request.LoginRequest;
import com.hospital.grievance.dto.response.AuthResponse;
import com.hospital.grievance.dto.response.UserResponse;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.exception.UnauthorizedException;
import com.hospital.grievance.mapper.UserMapper;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.security.JwtService;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final AuditService auditService;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            String token = jwtService.generateToken(
                    userDetails,
                    userDetails.getId(),
                    userDetails.getRole().name(),
                    userDetails.getFullName()
            );

            auditService.recordActionWithUser(
                    userDetails.getId(),
                    userDetails.getUsername(),
                    AuditAction.LOGIN_SUCCESS,
                    "USER",
                    userDetails.getId().toString(),
                    null,
                    "Successful login"
            );

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .fullName(userDetails.getFullName())
                    .email(userDetails.getEmail())
                    .role(userDetails.getRole())
                    .expiresInMs(jwtService.getExpirationMs())
                    .build();

        } catch (DisabledException ex) {
            auditService.recordActionWithUser(null, identifier, AuditAction.LOGIN_FAILED, "USER", identifier, null, "Account disabled");
            throw new UnauthorizedException("Your account has been deactivated. Please contact the administrator.");
        } catch (BadCredentialsException ex) {
            auditService.recordActionWithUser(null, identifier, AuditAction.LOGIN_FAILED, "USER", identifier, null, "Bad credentials");
            throw new UnauthorizedException("Invalid username/email or password.");
        } catch (Exception ex) {
            auditService.recordActionWithUser(null, identifier, AuditAction.LOGIN_FAILED, "USER", identifier, null, "Login failure: " + ex.getMessage());
            throw new UnauthorizedException("Authentication failed: " + ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("User is not authenticated");
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userMapper.toResponse(user);
    }
}
