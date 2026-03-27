package com.smartcampus.modules.ticket.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** Stub placeholder — Member 3 (Maintenance & Incident Ticketing) implements full entity */
@Entity
@Table(name = "tickets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private String ticketNumber;
    private Long userId;
    private Long resourceId;
    private String category;
    private String priority;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(length = 20) private String status;
    private Long assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
