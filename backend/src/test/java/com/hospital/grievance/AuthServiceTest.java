package com.hospital.grievance;

import com.hospital.grievance.dto.request.LoginRequest;
import com.hospital.grievance.dto.response.AuthResponse;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.exception.UnauthorizedException;
import com.hospital.grievance.mapper.UserMapper;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.security.CustomUserDetails;
import com.hospital.grievance.security.JwtService;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Spy
    private UserMapper userMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockAdmin;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        mockAdmin = User.builder()
                .id(1L)
                .username("admin")
                .email("admin@hospital.org")
                .fullName("System Admin")
                .passwordHash("hashedpassword")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();

        userDetails = new CustomUserDetails(mockAdmin);
    }

    @Test
    @DisplayName("Successful login returns JWT token and user info")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("admin", "Admin@12345");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("mock-jwt-token-xyz");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token-xyz", response.getToken());
        assertEquals("admin", response.getUsername());
        assertEquals(Role.ROLE_ADMIN, response.getRole());
        verify(auditService, times(1)).recordActionWithUser(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Login with invalid password throws UnauthorizedException")
    void testLoginBadCredentials() {
        LoginRequest request = new LoginRequest("admin", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Login with deactivated user throws UnauthorizedException")
    void testLoginDisabledAccount() {
        LoginRequest request = new LoginRequest("disabled_user", "password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("User is disabled"));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
