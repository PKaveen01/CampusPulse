package com.smartcampus.modules.resource.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "resource_type", length = 255)
    private String resourceType;  // Direct string, not ID

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(length = 100)
    private String building;

    @Column(length = 50)
    private String floor;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Amenities fields - matching your database
    @Column(name = "is_air_conditioned")
    private Boolean isAirConditioned;

    @Column(name = "has_projector")
    private Boolean hasProjector;

    @Column(name = "has_smart_board")
    private Boolean hasSmartBoard;

    @Column(name = "has_wifi")
    private Boolean hasWifi;

    @Column(name = "has_power_outlets")
    private Boolean hasPowerOutlets;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (isAirConditioned == null) isAirConditioned = false;
        if (hasProjector == null) hasProjector = false;
        if (hasSmartBoard == null) hasSmartBoard = false;
        if (hasWifi == null) hasWifi = false;
        if (hasPowerOutlets == null) hasPowerOutlets = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}