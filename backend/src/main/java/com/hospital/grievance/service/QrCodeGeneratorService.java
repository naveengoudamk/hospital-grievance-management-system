package com.hospital.grievance.service;

import com.hospital.grievance.dto.request.QrGenerateRequest;
import com.hospital.grievance.dto.response.QrConfigResponse;

public interface QrCodeGeneratorService {

    QrConfigResponse getActiveQrConfig();

    QrConfigResponse generateQrCode(QrGenerateRequest request);

    byte[] getQrCodePngBytes(int width, int height);

    byte[] generateQrPngBytesForUrl(String url, int width, int height);
}
