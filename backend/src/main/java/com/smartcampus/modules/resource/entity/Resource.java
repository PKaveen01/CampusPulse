package com.smartcampus.modules.resource.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** Stub placeholder — Member 1 (Facilities & Assets Catalogue) implements full entity */
@Entity
@Table(name = "resources")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 100) private String name;
    private String resourceType;
    private Integer capacity;
    private String location;
    @Column(length = 20) private String status;
    @Column(columnDefinition = "TEXT") private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
