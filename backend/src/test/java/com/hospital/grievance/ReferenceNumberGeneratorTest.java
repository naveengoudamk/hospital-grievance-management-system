package com.hospital.grievance;

import com.hospital.grievance.util.ReferenceNumberGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Year;

import static org.junit.jupiter.api.Assertions.*;

class ReferenceNumberGeneratorTest {

    private ReferenceNumberGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new ReferenceNumberGenerator();
    }

    @Test
    @DisplayName("Should generate standard HGS reference number with current year")
    void testStandardReferenceGeneration() {
        String ref = generator.generateComplaintReference();
        assertNotNull(ref);
        int currentYear = Year.now().getValue();
        assertTrue(ref.startsWith("HGS-" + currentYear + "-"));
        assertEquals(15, ref.length());
        assertTrue(generator.isValidReferenceNumber(ref));
    }

    @Test
    @DisplayName("Should support custom hospital prefix")
    void testCustomPrefixReferenceGeneration() {
        String ref = generator.generateComplaintReference("METRO");
        assertNotNull(ref);
        int currentYear = Year.now().getValue();
        assertTrue(ref.startsWith("METRO-" + currentYear + "-"));
        assertTrue(generator.isValidReferenceNumber(ref));
    }

    @Test
    @DisplayName("Should validate reference number format correctly")
    void testValidation() {
        assertTrue(generator.isValidReferenceNumber("HGS-2026-123456"));
        assertTrue(generator.isValidReferenceNumber("CARE-2026-987654"));
        assertFalse(generator.isValidReferenceNumber("INVALID-123"));
        assertFalse(generator.isValidReferenceNumber(""));
        assertFalse(generator.isValidReferenceNumber(null));
    }
}
