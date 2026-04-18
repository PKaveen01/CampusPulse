package com.smartcampus.modules.ticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 30)
    private String ticketNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(length = 255)
    private String location;

    @Column(nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(name = "preferred_contact_details", length = 255)
    private String preferredContactDetails;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "rejected_reason", columnDefinition = "TEXT")
    private String rejectedReason;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
