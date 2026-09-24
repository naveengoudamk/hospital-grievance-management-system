package com.hospital.grievance;

import com.hospital.grievance.dto.request.QrGenerateRequest;
import com.hospital.grievance.dto.response.QrConfigResponse;
import com.hospital.grievance.entity.QrConfig;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.QrConfigRepository;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.impl.QrCodeGeneratorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QrCodeGeneratorServiceTest {

    @Mock
    private QrConfigRepository qrConfigRepository;

    @Spy
    private ComplaintMapper mapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private QrCodeGeneratorServiceImpl qrService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(qrService, "defaultPublicUrl", "http://localhost:5173/public");
    }

    @Test
    @DisplayName("Generate QR code generates valid PNG image byte array")
    void testGenerateQrPngBytes() {
        byte[] bytes = qrService.generateQrPngBytesForUrl("http://localhost:5173/public", 300, 300);
        assertNotNull(bytes);
        assertTrue(bytes.length > 100);

        // Verify PNG magic numbers: 0x89 0x50 0x4E 0x47
        assertEquals((byte) 0x89, bytes[0]);
        assertEquals((byte) 'P', bytes[1]);
        assertEquals((byte) 'N', bytes[2]);
        assertEquals((byte) 'G', bytes[3]);
    }

    @Test
    @DisplayName("Generate new QR code configuration saves base64 image")
    void testGenerateQrConfig() {
        when(qrConfigRepository.findAll()).thenReturn(Collections.emptyList());
        when(qrConfigRepository.save(any(QrConfig.class))).thenAnswer(i -> {
            QrConfig c = i.getArgument(0);
            c.setId(1L);
            return c;
        });

        QrGenerateRequest request = new QrGenerateRequest("Hospital QR", "http://hospital.example.com/public");
        QrConfigResponse response = qrService.generateQrCode(request);

        assertNotNull(response);
        assertEquals("Hospital QR", response.getName());
        assertEquals("http://hospital.example.com/public", response.getPublicUrl());
        assertNotNull(response.getQrCodeBase64());
        assertTrue(response.getQrCodeBase64().startsWith("data:image/png;base64,"));
        verify(auditService, times(1)).recordAction(any(), any(), any(), any(), any());
    }
}
