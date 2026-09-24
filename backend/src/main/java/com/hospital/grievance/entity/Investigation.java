package com.hospital.grievance.entity;

import com.hospital.grievance.enums.InvestigationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "investigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigator_id", nullable = false)
    private User investigator;

    @Column(name = "investigation_summary", columnDefinition = "TEXT")
    private String investigationSummary;

    @Column(name = "findings", columnDefinition = "TEXT")
    private String findings;

    @Column(name = "action_taken", columnDefinition = "TEXT")
    private String actionTaken;

    @Enumerated(EnumType.STRING)
    @Column(name = "investigation_status", nullable = false, length = 50)
    @Builder.Default
    private InvestigationStatus investigationStatus = InvestigationStatus.NOT_STARTED;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
