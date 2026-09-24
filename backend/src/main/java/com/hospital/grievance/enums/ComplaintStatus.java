package com.hospital.grievance.enums;

import java.util.EnumSet;
import java.util.Set;

public enum ComplaintStatus {
    SUBMITTED,
    UNDER_REVIEW,
    ASSIGNED,
    INVESTIGATION,
    ACTION_TAKEN,
    RESOLVED,
    REJECTED,
    CLOSED;

    public boolean canTransitionTo(ComplaintStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }
        return switch (this) {
            case SUBMITTED -> Set.of(UNDER_REVIEW, REJECTED, ASSIGNED).contains(nextStatus);
            case UNDER_REVIEW -> Set.of(ASSIGNED, REJECTED, INVESTIGATION).contains(nextStatus);
            case ASSIGNED -> Set.of(INVESTIGATION, UNDER_REVIEW, ACTION_TAKEN, REJECTED).contains(nextStatus);
            case INVESTIGATION -> Set.of(ACTION_TAKEN, ASSIGNED, RESOLVED, REJECTED).contains(nextStatus);
            case ACTION_TAKEN -> Set.of(RESOLVED, INVESTIGATION, CLOSED).contains(nextStatus);
            case RESOLVED -> Set.of(CLOSED, ACTION_TAKEN, UNDER_REVIEW).contains(nextStatus);
            case REJECTED -> Set.of(UNDER_REVIEW).contains(nextStatus);
            case CLOSED -> Set.of(UNDER_REVIEW).contains(nextStatus);
        };
    }

    public String getPublicDisplayMessage() {
        return switch (this) {
            case SUBMITTED -> "Your complaint has been successfully recorded in the hospital registry and is queued for verification.";
            case UNDER_REVIEW -> "Your reported issue is currently being reviewed by the grievance administration desk.";
            case ASSIGNED -> "A dedicated committee member / grievance officer has been assigned to assess your case.";
            case INVESTIGATION -> "Official investigation and on-ground fact-finding is currently underway.";
            case ACTION_TAKEN -> "Investigation findings have been submitted and corrective / administrative action has been initiated.";
            case RESOLVED -> "Corrective action has been completed and the matter has been resolved by the hospital administration.";
            case REJECTED -> "After preliminary review, the submission could not be processed under the grievance policy.";
            case CLOSED -> "The grievance case is officially closed.";
        };
    }
}
