package com.hospital.grievance.config;

import com.hospital.grievance.entity.*;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.InvestigationStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.service.QrCodeGeneratorService;
import com.hospital.grievance.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ComplaintCategoryRepository complaintCategoryRepository;
    private final LocationRepository locationRepository;
    private final QrConfigRepository qrConfigRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final InvestigationRepository investigationRepository;
    private final AuditLogRepository auditLogRepository;
    private final TokenGenerator tokenGenerator;
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

        // 7. Seed Realistic Grievance Demonstrations if empty
        if (complaintRepository.count() == 0 && hospital != null) {
            seedRealisticComplaints(hospital);
        }
    }

    private void seedRealisticComplaints(Hospital hospital) {
        log.info("Seeding realistic hospital grievance records for demonstration & triage...");

        List<ComplaintCategory> categories = complaintCategoryRepository.findAll();
        List<Location> locations = locationRepository.findAll();

        ComplaintCategory emergencyCat = findCategoryByName(categories, "Emergency & Trauma Delays");
        ComplaintCategory billingCat = findCategoryByName(categories, "Billing & Insurance Transparency");
        ComplaintCategory sanitationCat = findCategoryByName(categories, "Hygiene, Sanitation & Housekeeping");
        ComplaintCategory securityCat = findCategoryByName(categories, "Security & Safety Concerns");
        ComplaintCategory nursingCat = findCategoryByName(categories, "Nursing & Patient Care");
        ComplaintCategory pharmacyCat = findCategoryByName(categories, "Pharmacy & Medication Availability");

        Location erLocation = findLocationByName(locations, "Emergency & Trauma Block");
        Location billingLocation = findLocationByName(locations, "Central Billing & Cash Counters");
        Location wardLocation = findLocationByName(locations, "Inpatient General Ward (Block A)");
        Location icuLocation = findLocationByName(locations, "Intensive Care Unit (ICU / ICCU)");
        Location privateRoomsLocation = findLocationByName(locations, "Inpatient Deluxe / Private Rooms");
        Location pharmacyLocation = findLocationByName(locations, "Central Pharmacy & Dispensing");

        User cmo = userRepository.findByUsername("committee1").orElse(null);
        User nurseSupv = userRepository.findByUsername("committee2").orElse(null);
        User opsLead = userRepository.findByUsername("committee3").orElse(null);
        User adminUser = userRepository.findByUsername("admin").orElse(null);

        // Case 1: Emergency Triage Delay (Assigned)
        Complaint c1 = Complaint.builder()
                .complaintReference("HGS-2026-001042")
                .hospital(hospital)
                .category(emergencyCat != null ? emergencyCat : categories.get(0))
                .location(erLocation)
                .description("Elderly patient arrived at casualty with severe acute chest distress. Triage nurse delayed initial vitals check by 42 minutes citing shift handover. Stretcher was unavailable for 20 minutes.")
                .isAnonymous(false)
                .complainantName("David Reynolds")
                .complainantPhone("+1 (555) 019-3321")
                .complainantEmail("david.reynolds@example.com")
                .preferredContactMethod("PHONE")
                .incidentDate(LocalDateTime.now().minusDays(2))
                .priority(Priority.HIGH)
                .status(ComplaintStatus.ASSIGNED)
                .trackingTokenHash(tokenGenerator.hashToken("CARE-TRACK-2026"))
                .build();
        c1 = complaintRepository.save(c1);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c1)
                .oldStatus(null)
                .newStatus(ComplaintStatus.SUBMITTED)
                .changedBy("System (Universal QR)")
                .remarks("Grievance registered via Universal QR Code.")
                .build());

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c1)
                .oldStatus(ComplaintStatus.SUBMITTED)
                .newStatus(ComplaintStatus.UNDER_REVIEW)
                .changedBy(adminUser != null ? adminUser.getUsername() : "admin")
                .remarks("Grievance reviewed by Chief Administrator. Prioritized for clinical casualty audit.")
                .build());

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c1)
                .oldStatus(ComplaintStatus.UNDER_REVIEW)
                .newStatus(ComplaintStatus.ASSIGNED)
                .changedBy(adminUser != null ? adminUser.getUsername() : "admin")
                .remarks("Assigned to Chief Medical Officer Dr. Vance for immediate casualty triage review.")
                .build());

        if (cmo != null) {
            assignmentRepository.save(ComplaintAssignment.builder()
                    .complaint(c1)
                    .committeeMember(cmo)
                    .assignedBy(adminUser)
                    .remarks("Please audit triage register and ER duty logbook between 18:00 - 20:00.")
                    .active(true)
                    .build());
        }

        // Case 2: Billing Transparency Dispute (Investigation In Progress)
        Complaint c2 = Complaint.builder()
                .complaintReference("HGS-2026-001088")
                .hospital(hospital)
                .category(billingCat != null ? billingCat : categories.get(0))
                .location(billingLocation)
                .description("Inpatient discharge bill #INV-8821 contains duplicate line items for specialized surgical drape kits ($420) and undocumented pharmacy infusion charges that were cancelled on Day 2.")
                .isAnonymous(false)
                .complainantName("Sarah Jenkins")
                .complainantPhone("+1 (555) 019-4452")
                .complainantEmail("sarah.jenkins@example.com")
                .preferredContactMethod("EMAIL")
                .incidentDate(LocalDateTime.now().minusDays(3))
                .priority(Priority.HIGH)
                .status(ComplaintStatus.INVESTIGATION)
                .trackingTokenHash(tokenGenerator.hashToken("BILL-AUDIT-9921"))
                .build();
        c2 = complaintRepository.save(c2);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c2)
                .oldStatus(null)
                .newStatus(ComplaintStatus.SUBMITTED)
                .changedBy("System (Universal QR)")
                .remarks("Grievance registered via Universal QR Code.")
                .build());

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c2)
                .oldStatus(ComplaintStatus.SUBMITTED)
                .newStatus(ComplaintStatus.INVESTIGATION)
                .changedBy(opsLead != null ? opsLead.getUsername() : "committee3")
                .remarks("Detailed reconciliation with central pharmacy POS and OT charge sheets initiated.")
                .build());

        if (opsLead != null) {
            assignmentRepository.save(ComplaintAssignment.builder()
                    .complaint(c2)
                    .committeeMember(opsLead)
                    .assignedBy(adminUser)
                    .remarks("Audit billing line items against pharmacy physical requisition vouchers.")
                    .active(true)
                    .build());

            investigationRepository.save(Investigation.builder()
                    .complaint(c2)
                    .investigator(opsLead)
                    .investigationSummary("Auditing inpatient pharmacy vouchers against ERP billing items.")
                    .findings("Preliminary finding indicates cancelled IV drip on Day 2 was not rolled back by evening cashier.")
                    .actionTaken("Credit note processing under approval by Financial Controller.")
                    .investigationStatus(InvestigationStatus.IN_PROGRESS)
                    .startedAt(LocalDateTime.now().minusDays(1))
                    .build());
        }

        // Case 3: Ward Cleanliness (Resolved)
        Complaint c3 = Complaint.builder()
                .complaintReference("HGS-2026-001105")
                .hospital(hospital)
                .category(sanitationCat != null ? sanitationCat : categories.get(0))
                .location(wardLocation)
                .description("Ward 3B shared patient washrooms remained uncleaned for over 14 hours. Liquid hand disinfectant dispensers in corridors 3 and 4 were empty throughout the weekend.")
                .isAnonymous(true)
                .incidentDate(LocalDateTime.now().minusDays(4))
                .priority(Priority.MEDIUM)
                .status(ComplaintStatus.RESOLVED)
                .resolvedAt(LocalDateTime.now().minusHours(6))
                .trackingTokenHash(tokenGenerator.hashToken("CLEAN-WARD-4412"))
                .build();
        c3 = complaintRepository.save(c3);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c3)
                .oldStatus(ComplaintStatus.INVESTIGATION)
                .newStatus(ComplaintStatus.RESOLVED)
                .changedBy(nurseSupv != null ? nurseSupv.getUsername() : "committee2")
                .remarks("Resolution verified: Deep sanitization executed. Dispensers refilled. 4-hour supervisory check deployed.")
                .build());

        if (nurseSupv != null) {
            assignmentRepository.save(ComplaintAssignment.builder()
                    .complaint(c3)
                    .committeeMember(nurseSupv)
                    .assignedBy(adminUser)
                    .remarks("Immediate inspection of Ward 3B sanitization facilities.")
                    .active(true)
                    .build());

            investigationRepository.save(Investigation.builder()
                    .complaint(c3)
                    .investigator(nurseSupv)
                    .investigationSummary("Investigated custodial staffing rosters and Ward 3B washroom logsheets.")
                    .findings("Substantiated: Weekend janitorial contractor missed scheduled 14:00 rotation.")
                    .actionTaken("Immediate sanitization completed. Penalty issued to contractor; installed automated qr-based housekeeping log tag.")
                    .investigationStatus(InvestigationStatus.COMPLETED)
                    .startedAt(LocalDateTime.now().minusDays(2))
                    .completedAt(LocalDateTime.now().minusHours(6))
                    .build());
        }

        // Case 4: ICU Security Breach (Under Review)
        Complaint c4 = Complaint.builder()
                .complaintReference("HGS-2026-001150")
                .hospital(hospital)
                .category(securityCat != null ? securityCat : categories.get(0))
                .location(icuLocation)
                .description("Two aggressive individuals breached the sterile corridor of the ICU after visiting hours, verbally intimidating nursing staff and attempting to enter restricted isolation chambers.")
                .isAnonymous(false)
                .complainantName("Michael Chang")
                .complainantPhone("+1 (555) 019-5561")
                .complainantEmail("michael.chang@example.com")
                .preferredContactMethod("PHONE")
                .incidentDate(LocalDateTime.now().minusHours(8))
                .priority(Priority.CRITICAL)
                .status(ComplaintStatus.UNDER_REVIEW)
                .trackingTokenHash(tokenGenerator.hashToken("SAFE-ICU-8833"))
                .build();
        complaintRepository.save(c4);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c4)
                .oldStatus(ComplaintStatus.SUBMITTED)
                .newStatus(ComplaintStatus.UNDER_REVIEW)
                .changedBy(adminUser != null ? adminUser.getUsername() : "admin")
                .remarks("Critical security incident flagged for immediate Head of Security briefing.")
                .build());

        // Case 5: Nursing Response Time (Submitted / New)
        Complaint c5 = Complaint.builder()
                .complaintReference("HGS-2026-001192")
                .hospital(hospital)
                .category(nursingCat != null ? nursingCat : categories.get(0))
                .location(privateRoomsLocation)
                .description("Bedside emergency nurse call buzzer rang for 28 minutes in Room 412 before any nurse responded to assist an elderly postoperative patient trying to reach the bathroom.")
                .isAnonymous(false)
                .complainantName("Eleanor Vance")
                .complainantPhone("+1 (555) 019-6670")
                .preferredContactMethod("PHONE")
                .incidentDate(LocalDateTime.now().minusHours(14))
                .priority(Priority.MEDIUM)
                .status(ComplaintStatus.SUBMITTED)
                .trackingTokenHash(tokenGenerator.hashToken("NURSE-CARE-3310"))
                .build();
        complaintRepository.save(c5);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c5)
                .oldStatus(null)
                .newStatus(ComplaintStatus.SUBMITTED)
                .changedBy("System (Universal QR)")
                .remarks("New grievance lodged. Awaiting initial triage.")
                .build());

        // Case 6: Pharmacy Non-Prescription Request (Rejected)
        Complaint c6 = Complaint.builder()
                .complaintReference("HGS-2026-001210")
                .hospital(hospital)
                .category(pharmacyCat != null ? pharmacyCat : categories.get(0))
                .location(pharmacyLocation)
                .description("Pharmacy staff refused to issue emergency cardiac medication refills without an authorized physician prescription.")
                .isAnonymous(true)
                .incidentDate(LocalDateTime.now().minusDays(5))
                .priority(Priority.LOW)
                .status(ComplaintStatus.REJECTED)
                .trackingTokenHash(tokenGenerator.hashToken("PHARM-EXP-5520"))
                .build();
        complaintRepository.save(c6);

        statusHistoryRepository.save(ComplaintStatusHistory.builder()
                .complaint(c6)
                .oldStatus(ComplaintStatus.SUBMITTED)
                .newStatus(ComplaintStatus.REJECTED)
                .changedBy(adminUser != null ? adminUser.getUsername() : "admin")
                .remarks("Rejected: Statutory healthcare drug regulations prohibit dispensing Schedule H medicines without physician prescription. Staff followed safety protocol.")
                .build());

        log.info("Successfully seeded 6 realistic hospital grievances with tracked tokens.");
    }

    private ComplaintCategory findCategoryByName(List<ComplaintCategory> list, String name) {
        return list.stream().filter(c -> c.getName().equalsIgnoreCase(name)).findFirst().orElse(null);
    }

    private Location findLocationByName(List<Location> list, String name) {
        return list.stream().filter(l -> l.getName().equalsIgnoreCase(name)).findFirst().orElse(null);
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

