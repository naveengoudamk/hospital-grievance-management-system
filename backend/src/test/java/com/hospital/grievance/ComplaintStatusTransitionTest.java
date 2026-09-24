package com.hospital.grievance;

import com.hospital.grievance.enums.ComplaintStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintStatusTransitionTest {

    @Test
    @DisplayName("Verify allowed status progression flow")
    void testValidTransitions() {
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.UNDER_REVIEW));
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.REJECTED));

        assertTrue(ComplaintStatus.UNDER_REVIEW.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertTrue(ComplaintStatus.UNDER_REVIEW.canTransitionTo(ComplaintStatus.INVESTIGATION));
        assertTrue(ComplaintStatus.UNDER_REVIEW.canTransitionTo(ComplaintStatus.REJECTED));

        assertTrue(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.INVESTIGATION));
        assertTrue(ComplaintStatus.INVESTIGATION.canTransitionTo(ComplaintStatus.ACTION_TAKEN));
        assertTrue(ComplaintStatus.ACTION_TAKEN.canTransitionTo(ComplaintStatus.RESOLVED));
        assertTrue(ComplaintStatus.RESOLVED.canTransitionTo(ComplaintStatus.CLOSED));
    }

    @Test
    @DisplayName("Verify prohibited arbitrary jumps")
    void testInvalidTransitions() {
        // Direct jump from SUBMITTED to RESOLVED without investigation/review
        assertFalse(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.RESOLVED));
        assertFalse(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.CLOSED));
        assertFalse(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.ACTION_TAKEN));
    }

    @Test
    @DisplayName("Verify public messages are informative and non-prejudicial")
    void testPublicMessages() {
        for (ComplaintStatus status : ComplaintStatus.values()) {
            String message = status.getPublicDisplayMessage();
            assertNotNull(message);
            assertFalse(message.isBlank());
        }
    }
}
