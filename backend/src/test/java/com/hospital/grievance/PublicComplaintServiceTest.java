package com.hospital.grievance;

import com.hospital.grievance.dto.request.PublicComplaintRequest;
import com.hospital.grievance.dto.request.TrackComplaintRequest;
import com.hospital.grievance.dto.response.PublicComplaintResponse;
import com.hospital.grievance.dto.response.TrackComplaintResponse;
import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.entity.ComplaintCategory;
import com.hospital.grievance.entity.Hospital;
import com.hospital.grievance.entity.Location;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.exception.InvalidComplaintException;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.FileStorageService;
import com.hospital.grievance.service.impl.PublicComplaintServiceImpl;
import com.hospital.grievance.util.ReferenceNumberGenerator;
import com.hospital.grievance.util.TokenGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private ComplaintCategoryRepository categoryRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private ComplaintStatusHistoryRepository statusHistoryRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Spy
    private ReferenceNumberGenerator referenceNumberGenerator;

    @Spy
    private TokenGenerator tokenGenerator;

    @Spy
    private ComplaintMapper complaintMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PublicComplaintServiceImpl publicComplaintService;

    private Hospital mockHospital;
    private ComplaintCategory mockCategory;
    private Location mockLocation;

    @BeforeEach
    void setUp() {
        mockHospital = Hospital.builder().id(1L).name("City Hospital").address("123 Main St").build();
        mockCategory = ComplaintCategory.builder().id(1L).name("Billing / Extra Charges").severityDefault("HIGH").active(true).build();
        mockLocation = Location.builder().id(1L).hospital(mockHospital).name("Billing Counter").active(true).build();
    }

    @Test
    @DisplayName("Submit identified complaint successfully with valid data")
    void testSubmitIdentifiedComplaint() {
        PublicComplaintRequest request = PublicComplaintRequest.builder()
                .categoryId(1L)
                .locationId(1L)
                .description("Overcharged for standard lab consultation fees.")
                .isAnonymous(false)
                .complainantName("Jane Doe")
                .complainantPhone("+15551234567")
                .complainantEmail("jane@example.com")
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(mockLocation));
        when(hospitalRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(mockHospital));
        when(complaintRepository.findByComplaintReference(anyString())).thenReturn(Optional.empty());
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(101L);
            return c;
        });

        PublicComplaintResponse response = publicComplaintService.submitComplaint(request, null);

        assertNotNull(response);
        assertNotNull(response.getComplaintReference());
        assertNotNull(response.getTrackingToken());
        assertEquals("SUBMITTED", response.getStatus());
        assertEquals("Billing / Extra Charges", response.getCategoryName());
        assertEquals("Billing Counter", response.getLocationName());

        verify(complaintRepository, times(1)).save(any(Complaint.class));
        verify(statusHistoryRepository, times(1)).save(any());
        verify(auditService, times(1)).recordAction(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Submit anonymous complaint successfully without contact details")
    void testSubmitAnonymousComplaint() {
        PublicComplaintRequest request = PublicComplaintRequest.builder()
                .categoryId(1L)
                .locationId(1L)
                .description("Unclean waiting room seats and trash overflowing.")
                .isAnonymous(true)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(mockLocation));
        when(hospitalRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(mockHospital));
        when(complaintRepository.findByComplaintReference(anyString())).thenReturn(Optional.empty());
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(102L);
            return c;
        });

        PublicComplaintResponse response = publicComplaintService.submitComplaint(request, null);

        assertNotNull(response);
        assertNotNull(response.getComplaintReference());
        assertNotNull(response.getTrackingToken());
        assertEquals("SUBMITTED", response.getStatus());
    }

    @Test
    @DisplayName("Submit non-anonymous complaint without name should fail validation")
    void testSubmitNonAnonymousWithoutName() {
        PublicComplaintRequest request = PublicComplaintRequest.builder()
                .categoryId(1L)
                .description("Issue occurred")
                .isAnonymous(false)
                .complainantName("")
                .complainantPhone("+15551234567")
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(hospitalRepository.findFirstByActiveTrueOrderByIdAsc()).thenReturn(Optional.of(mockHospital));

        assertThrows(InvalidComplaintException.class, () -> publicComplaintService.submitComplaint(request, null));
    }

    @Test
    @DisplayName("Track complaint with matching valid reference and token")
    void testTrackComplaintSuccess() {
        String rawToken = "ABCDEF1234567890";
        String tokenHash = tokenGenerator.hashToken(rawToken);

        Complaint complaint = Complaint.builder()
                .id(200L)
                .complaintReference("HGS-2026-123456")
                .category(mockCategory)
                .location(mockLocation)
                .description("Sample grievance")
                .status(ComplaintStatus.UNDER_REVIEW)
                .priority(Priority.HIGH)
                .trackingTokenHash(tokenHash)
                .build();

        when(complaintRepository.findByComplaintReference("HGS-2026-123456")).thenReturn(Optional.of(complaint));

        TrackComplaintRequest trackRequest = TrackComplaintRequest.builder()
                .complaintReference("HGS-2026-123456")
                .trackingToken(rawToken)
                .build();

        TrackComplaintResponse response = publicComplaintService.trackComplaint(trackRequest);

        assertNotNull(response);
        assertEquals("HGS-2026-123456", response.getComplaintReference());
        assertEquals(ComplaintStatus.UNDER_REVIEW, response.getCurrentStatus());
        assertNotNull(response.getTimeline());
        assertTrue(response.getTimeline().size() >= 5);
    }

    @Test
    @DisplayName("Track complaint with wrong token throws ResourceNotFoundException safely")
    void testTrackComplaintWrongToken() {
        String tokenHash = tokenGenerator.hashToken("CORRECTTOKEN1234");

        Complaint complaint = Complaint.builder()
                .id(200L)
                .complaintReference("HGS-2026-123456")
                .category(mockCategory)
                .trackingTokenHash(tokenHash)
                .build();

        when(complaintRepository.findByComplaintReference("HGS-2026-123456")).thenReturn(Optional.of(complaint));

        TrackComplaintRequest trackRequest = TrackComplaintRequest.builder()
                .complaintReference("HGS-2026-123456")
                .trackingToken("WRONGTOKEN123456")
                .build();

        assertThrows(ResourceNotFoundException.class, () -> publicComplaintService.trackComplaint(trackRequest));
    }
}
