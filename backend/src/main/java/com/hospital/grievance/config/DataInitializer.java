package com.hospital.grievance.config;

import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.service.QrCodeGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QrCodeGeneratorService qrCodeGeneratorService;

    @Value("${app.initial-admin.username:admin}")
    private String adminUsername;

    @Value("${app.initial-admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.initial-admin.email:admin@hospital.org}")
    private String adminEmail;

    @Value("${app.initial-admin.full-name:Chief Grievance Administrator}")
    private String adminFullName;

    @Value("${app.seed-demo-users:true}")
    private boolean seedDemoUsers;

    @Override
    public void run(String... args) {
        // 1. Seed Initial Admin
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            User admin = User.builder()
                    .fullName(adminFullName)
                    .username(adminUsername)
                    .email(adminEmail)
                    .phone("+1 (555) 019-2000")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ROLE_ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
            log.info("Initialized Admin User: username={}", adminUsername);
        }

        // 2. Seed Demo Committee Members for development & demonstration
        if (seedDemoUsers) {
            seedCommitteeMemberIfNotExists(
                    "committee1",
                    "Committee@123",
                    "committee1@hospital.org",
                    "Dr. Arthur Vance (Chief Medical Officer)",
                    "+1 (555) 019-2001"
            );
            seedCommitteeMemberIfNotExists(
                    "committee2",
                    "Committee@123",
                    "committee2@hospital.org",
                    "Nurse Supv. Elena Rostova",
                    "+1 (555) 019-2002"
            );
            seedCommitteeMemberIfNotExists(
                    "committee3",
                    "Committee@123",
                    "committee3@hospital.org",
                    "Marcus Brody (Operations & Billing In-Charge)",
                    "+1 (555) 019-2003"
            );
        }

        // 3. Ensure ONE Universal QR Code exists
        try {
            qrCodeGeneratorService.getActiveQrConfig();
            log.info("Universal QR Code verified.");
        } catch (Exception e) {
            log.warn("QR initialization notice: {}", e.getMessage());
        }
    }

    private void seedCommitteeMemberIfNotExists(String username, String password, String email, String fullName, String phone) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User member = User.builder()
                    .fullName(fullName)
                    .username(username)
                    .email(email)
                    .phone(phone)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(Role.ROLE_COMMITTEE_MEMBER)
                    .active(true)
                    .build();

            userRepository.save(member);
            log.info("Initialized Demo Committee Member: username={}", username);
        }
    }
}
