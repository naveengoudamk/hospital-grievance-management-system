package com.hospital.grievance.service.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.hospital.grievance.dto.request.QrGenerateRequest;
import com.hospital.grievance.dto.response.QrConfigResponse;
import com.hospital.grievance.entity.QrConfig;
import com.hospital.grievance.enums.AuditAction;
import com.hospital.grievance.exception.ResourceNotFoundException;
import com.hospital.grievance.mapper.ComplaintMapper;
import com.hospital.grievance.repository.QrConfigRepository;
import com.hospital.grievance.service.AuditService;
import com.hospital.grievance.service.QrCodeGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeGeneratorServiceImpl implements QrCodeGeneratorService {

    private final QrConfigRepository qrConfigRepository;
    private final ComplaintMapper mapper;
    private final AuditService auditService;

    @Value("${app.frontend.public-url:http://localhost:5173/public}")
    private String defaultPublicUrl;

    @Override
    @Transactional(readOnly = true)
    public QrConfigResponse getActiveQrConfig() {
        QrConfig qrConfig = qrConfigRepository.findFirstByActiveTrueOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultQrConfig);
        return mapper.toQrConfigResponse(qrConfig);
    }

    @Override
    @Transactional
    public QrConfigResponse generateQrCode(QrGenerateRequest request) {
        String targetUrl = (request.getPublicUrl() != null && !request.getPublicUrl().isBlank())
                ? request.getPublicUrl().trim()
                : defaultPublicUrl;

        byte[] pngBytes = generateQrPngBytesForUrl(targetUrl, 400, 400);
        String base64Image = "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);

        // Deactivate older configurations
        qrConfigRepository.findAll().forEach(c -> c.setActive(false));

        QrConfig newConfig = QrConfig.builder()
                .name(request.getName() != null ? request.getName() : "Universal Hospital Grievance QR")
                .publicUrl(targetUrl)
                .qrCodeBase64(base64Image)
                .active(true)
                .build();

        QrConfig saved = qrConfigRepository.save(newConfig);

        auditService.recordAction(
                AuditAction.QR_GENERATED,
                "QR_CONFIG",
                saved.getId().toString(),
                null,
                "Generated QR pointing to " + targetUrl
        );

        return mapper.toQrConfigResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getQrCodePngBytes(int width, int height) {
        QrConfig qrConfig = qrConfigRepository.findFirstByActiveTrueOrderByCreatedAtDesc()
                .orElseGet(this::createDefaultQrConfig);
        return generateQrPngBytesForUrl(qrConfig.getPublicUrl(), width, height);
    }

    @Override
    public byte[] generateQrPngBytesForUrl(String url, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate QR code for URL {}: {}", url, e.getMessage());
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    @Transactional
    public QrConfig createDefaultQrConfig() {
        byte[] pngBytes = generateQrPngBytesForUrl(defaultPublicUrl, 400, 400);
        String base64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);

        QrConfig qrConfig = QrConfig.builder()
                .name("Universal Hospital Grievance QR")
                .publicUrl(defaultPublicUrl)
                .qrCodeBase64(base64)
                .active(true)
                .build();

        return qrConfigRepository.save(qrConfig);
    }
}
