package com.hospital.grievance;

import com.hospital.grievance.dto.request.AssignComplaintRequest;
import com.hospital.grievance.dto.request.UpdatePriorityRequest;
import com.hospital.grievance.dto.request.UpdateStatusRequest;
import com.hospital.grievance.dto.response.ComplaintDetailResponse;
import com.hospital.grievance.entity.Complaint;
import com.hospital.grievance.entity.ComplaintCategory;
import com.hospital.grievance.entity.User;
import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import com.hospital.grievance.enums.Role;
import com.hospital.grievance.exception.InvalidStatusTransitionException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.*;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.impl.AdminComplaintServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ComplaintAssignmentRepository assignmentRepository;

    @Mock
    private ComplaintStatusHistoryRepository statusHistoryRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Spy
    private ComplaintMapper mapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminComplaintServiceImpl adminComplaintService;

    private Complaint sampleComplaint;
    private User sampleCommitteeMember;

    @BeforeEach
    void setUp() {
        sampleComplaint = Complaint.builder()
                .id(10L)
                .complaintReference("HGS-2026-999999")
                .category(ComplaintCategory.builder().id(1L).name("Nursing").build())
                .description("Long delay in medication distribution")
                .status(ComplaintStatus.SUBMITTED)
                .priority(Priority.MEDIUM)
                .attachments(new ArrayList<>())
                .assignments(new ArrayList<>())
                .investigations(new ArrayList<>())
                .statusHistories(new ArrayList<>())
                .build();

        sampleCommitteeMember = User.builder()
                .id(5L)
                .username("committee_member")
                .fullName("Dr. Committee Lead")
                .role(Role.ROLE_COMMITTEE_MEMBER)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Admin assigning complaint updates status to ASSIGNED and records assignment")
    void testAssignComplaint() {
        when(complaintRepository.findById(10L)).thenReturn(Optional.of(sampleComplaint));
        when(userRepository.findById(5L)).thenReturn(Optional.of(sampleCommitteeMember));
        when(assignmentRepository.findByComplaintId(10L)).thenReturn(new ArrayList<>());

        AssignComplaintRequest request = new AssignComplaintRequest(5L, "Please review nursing logs");
        ComplaintDetailResponse response = adminComplaintService.assignComplaint(10L, request);

        assertNotNull(response);
        assertEquals(ComplaintStatus.ASSIGNED, sampleComplaint.getStatus());
        verify(assignmentRepository, times(1)).save(any());
        verify(statusHistoryRepository, times(1)).save(any());
        verify(auditService, times(1)).recordAction(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Admin updating status with valid transition succeeds")
    void testUpdateStatusValid() {
        sampleComplaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        when(complaintRepository.findById(10L)).thenReturn(Optional.of(sampleComplaint));

        UpdateStatusRequest request = new UpdateStatusRequest(ComplaintStatus.ASSIGNED, "Moving to assigned stage");
        ComplaintDetailResponse response = adminComplaintService.updateStatus(10L, request);

        assertNotNull(response);
        assertEquals(ComplaintStatus.ASSIGNED, sampleComplaint.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Admin updating status with illegal jump throws InvalidStatusTransitionException")
    void testUpdateStatusIllegalJump() {
        sampleComplaint.setStatus(ComplaintStatus.SUBMITTED);
        when(complaintRepository.findById(10L)).thenReturn(Optional.of(sampleComplaint));

        UpdateStatusRequest request = new UpdateStatusRequest(ComplaintStatus.CLOSED, "Direct close");

        assertThrows(InvalidStatusTransitionException.class, () -> adminComplaintService.updateStatus(10L, request));
    }

    @Test
    @DisplayName("Admin updating priority updates priority field and logs change")
    void testUpdatePriority() {
        when(complaintRepository.findById(10L)).thenReturn(Optional.of(sampleComplaint));

        UpdatePriorityRequest request = new UpdatePriorityRequest(Priority.CRITICAL, "Escalated by Medical Director");
        ComplaintDetailResponse response = adminComplaintService.updatePriority(10L, request);

        assertNotNull(response);
        assertEquals(Priority.CRITICAL, sampleComplaint.getPriority());
        verify(auditService, times(1)).recordAction(any(), any(), any(), any(), any());
    }
}
