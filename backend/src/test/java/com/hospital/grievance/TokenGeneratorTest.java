package com.hospital.grievance;

import com.hospital.grievance.util.TokenGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenGeneratorTest {

    private TokenGenerator tokenGenerator;

    @BeforeEach
    void setUp() {
        tokenGenerator = new TokenGenerator();
    }

    @Test
    @DisplayName("Generated token should have the specified length and contain valid alphanumeric characters")
    void testGenerateTrackingToken() {
        String token = tokenGenerator.generateTrackingToken(16);
        assertNotNull(token);
        assertEquals(16, token.length());
        assertTrue(token.matches("^[A-Z0-9]+$"));
    }

    @Test
    @DisplayName("Token hashing with SHA-256 and verification matches correctly")
    void testHashAndMatchToken() {
        String rawToken = "ABCDEF1234567890";
        String hash = tokenGenerator.hashToken(rawToken);

        assertNotNull(hash);
        assertNotEquals(rawToken, hash);
        assertEquals(64, hash.length()); // SHA-256 hex length

        assertTrue(tokenGenerator.matches(rawToken, hash));
        assertFalse(tokenGenerator.matches("WRONGTOKEN123456", hash));
        assertFalse(tokenGenerator.matches(null, hash));
    }
}
