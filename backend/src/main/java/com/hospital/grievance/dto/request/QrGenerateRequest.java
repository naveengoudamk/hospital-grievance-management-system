package com.hospital.grievance.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerateRequest {

    @NotBlank(message = "QR Configuration name is required")
    private String name;

    @NotBlank(message = "Target public URL is required")
    private String publicUrl;
}
