package com.hospital.grievance.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Year;

@Component
public class ReferenceNumberGenerator {

    private final SecureRandom random = new SecureRandom();

    public String generateComplaintReference() {
        return generateComplaintReference("HGS");
    }

    public String generateComplaintReference(String prefix) {
        String cleanPrefix = (prefix != null && !prefix.trim().isEmpty()) ? prefix.trim().toUpperCase() : "HGS";
        int year = Year.now().getValue();
        int randomNumber = 100000 + random.nextInt(900000);
        return String.format("%s-%d-%06d", cleanPrefix, year, randomNumber);
    }

    public boolean isValidReferenceNumber(String referenceNumber) {
        if (referenceNumber == null || referenceNumber.trim().isEmpty()) {
            return false;
        }
        return referenceNumber.trim().matches("^[A-Z]{2,6}-\\d{4}-\\d{6}$");
    }
}
