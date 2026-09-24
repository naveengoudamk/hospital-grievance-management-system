package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.LoginRequest;
import com.hospital.grievance.dto.response.AuthResponse;
import com.hospital.grievance.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser();
}
