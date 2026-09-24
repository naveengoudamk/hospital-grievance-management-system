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
public class LocationResponse {
    private Long id;
    private Long hospitalId;
    private String name;
    private String description;
    private String floorNumber;
    private boolean active;
    private LocalDateTime createdAt;
}
