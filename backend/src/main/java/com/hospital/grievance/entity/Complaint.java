package com.hospital.grievance.entity;

import com.hospital.grievance.enums.ComplaintStatus;
import com.hospital.grievance.enums.Priority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_reference", nullable = false, unique = true, length = 50)
    private String complaintReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ComplaintCategory category;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private boolean isAnonymous = false;

    @Column(name = "complainant_name", length = 150)
    private String complainantName;

    @Column(name = "complainant_phone", length = 30)
    private String complainantPhone;

    @Column(name = "complainant_email", length = 150)
    private String complainantEmail;

    @Column(name = "preferred_contact_method", length = 30)
    private String preferredContactMethod;

    @Column(name = "incident_date")
    private LocalDateTime incidentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 30)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(name = "tracking_token_hash", nullable = false, length = 255)
    private String trackingTokenHash;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAssignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Investigation> investigations = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    @Builder.Default
    private List<ComplaintStatusHistory> statusHistories = new ArrayList<>();
}
