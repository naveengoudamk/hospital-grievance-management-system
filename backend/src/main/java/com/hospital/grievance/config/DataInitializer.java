package com.hospital.grievance.config;

import com.hospital.grievance.entity.ComplaintCategory;
import com.hospital.grievance.entity.Hospital;
import com.hospital.grievance.entity.Location;
import com.hospital.grievance.entity.QrConfig;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.repository.ComplaintCategoryRepository;
import com.hospital.grievance.repository.HospitalRepository;
import com.hospital.grievance.repository.LocationRepository;
import com.hospital.grievance.repository.QrConfigRepository;
import com.hospital.grievance.repository.UserRepository;
import com.hospital.grievance.service.QrCodeGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ComplaintCategoryRepository complaintCategoryRepository;
    private final LocationRepository locationRepository;
    private final QrConfigRepository qrConfigRepository;
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

    @Value("${app.frontend.public-url:http://localhost:5173/public}")
    private String publicFrontendUrl;

    @Override
    public void run(String... args) {
        // 1. Seed Hospital Master Profile if empty
        Hospital hospital = null;
        if (hospitalRepository.count() == 0) {
            hospital = Hospital.builder()
                    .name("St. Jude Memorial Hospital & Medical Center")
                    .address("104 Medical Enclave, Health Avenue, Metro District")
                    .phone("+1 (555) 019-2000")
                    .email("support@stjudememorial.org")
                    .emergencyNumber("+1 (555) 911-0000")
                    .active(true)
                    .build();
            hospital = hospitalRepository.save(hospital);
            log.info("Initialized Master Hospital Profile");
        } else {
            hospital = hospitalRepository.findAll().get(0);
        }

        // 2. Seed Categories if empty
        if (complaintCategoryRepository.count() == 0) {
            List<ComplaintCategory> categories = List.of(
                    ComplaintCategory.builder().name("Medical Care & Negligence").description("Concerns regarding diagnosis, doctor rounds, medication errors, or clinical delays").severityDefault("HIGH").active(true).build(),
                    ComplaintCategory.builder().name("Nursing & Patient Care").description("Issues with bedside assistance, nurse responsiveness, or ward care").severityDefault("MEDIUM").active(true).build(),
                    ComplaintCategory.builder().name("Billing & Insurance Transparency").description("Overcharging, hidden costs, unitemized bills, or insurance claim delays").severityDefault("HIGH").active(true).build(),
                    ComplaintCategory.builder().name("Hygiene, Sanitation & Housekeeping").description("Unsanitary washrooms, dirty linens, pests, or delayed ward cleaning").severityDefault("MEDIUM").active(true).build(),
                    ComplaintCategory.builder().name("Pharmacy & Medication Availability").description("Stock shortages, long queues, or dispensing errors").severityDefault("MEDIUM").active(true).build(),
                    ComplaintCategory.builder().name("Staff Conduct & Misbehavior").description("Rude behavior, unprofessional attitude, or lack of empathy from hospital staff").severityDefault("HIGH").active(true).build(),
                    ComplaintCategory.builder().name("Infrastructure, Lift & Facilities").description("Faulty elevators, AC failure, water supply issues, or parking trouble").severityDefault("LOW").active(true).build(),
                    ComplaintCategory.builder().name("Emergency & Trauma Delays").description("Critical delays at casualty reception, ambulance triage, or stretcher availability").severityDefault("CRITICAL").active(true).build(),
                    ComplaintCategory.builder().name("Security & Safety Concerns").description("Theft, visitor harassment, inadequate security, or unauthorized personnel in wards").severityDefault("CRITICAL").active(true).build()
            );
            complaintCategoryRepository.saveAll(categories);
            log.info("Initialized {} Complaint Categories", categories.size());
        }

        // 3. Seed Locations if empty
        if (locationRepository.count() == 0 && hospital != null) {
            List<Location> locations = List.of(
                    Location.builder().hospital(hospital).name("Emergency & Trauma Block").description("Casualty, Triage, and Resuscitation bays").floorNumber("Ground Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Intensive Care Unit (ICU / ICCU)").description("Critical care units and step-down beds").floorNumber("2nd Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Outpatient Department (OPD)").description("Specialist consultation clinics, token registration").floorNumber("1st Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Inpatient General Ward (Block A)").description("Male and female inpatient recovery wards").floorNumber("3rd Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Inpatient Deluxe / Private Rooms").description("Private and semi-private patient suites").floorNumber("4th Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Central Pharmacy & Dispensing").description("24x7 in-house medicine dispensary").floorNumber("Ground Floor").active(true).build(),
                    Location.builder().hospital(hospital).name("Diagnostic Radiology & Imaging").description("MRI, CT Scan, X-Ray, and Ultrasound labs").floorNumber("Basement 1").active(true).build(),
                    Location.builder().hospital(hospital).name("Central Billing & Cash Counters").description("Discharge billing, advance desk, and insurance TPA desk").floorNumber("Ground Floor").active(true).build()
            );
            locationRepository.saveAll(locations);
            log.info("Initialized {} Hospital Locations", locations.size());
        }

        // 4. Seed Initial Admin
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

        // 5. Seed Demo Committee Members for development & demonstration
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

        // 6. Ensure ONE Universal QR Code exists
        try {
            if (qrConfigRepository.count() == 0) {
                QrConfig defaultQr = QrConfig.builder()
                        .name("Hospital Main Universal QR Code")
                        .publicUrl(publicFrontendUrl)
                        .active(true)
                        .build();
                qrConfigRepository.save(defaultQr);
            }
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
