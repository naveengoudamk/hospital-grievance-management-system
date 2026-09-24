package com.hospital.grievance.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Year;

@Component
public class ReferenceNumberGenerator {

    private final SecureRandom random = new SecureRandom();

    public String generateComplaintReference() {
        int year = Year.now().getValue();
        int randomNumber = 100000 + random.nextInt(900000);
        return String.format("HGS-%d-%06d", year, randomNumber);
    }
}
