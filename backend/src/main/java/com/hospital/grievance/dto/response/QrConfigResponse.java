package com.hospital.grievance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrConfigResponse {
    private Long id;
    private String name;
    private String publicUrl;
    private String qrCodeBase64;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
