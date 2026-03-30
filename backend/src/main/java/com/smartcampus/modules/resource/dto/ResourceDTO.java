package com.smartcampus.modules.resource.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {

    private Long id;

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Resource type is required")
    private String resourceType;  // Direct string, not ID

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String building;
    private String floor;
    private String status;
    private String description;
    private String imageUrl;

    // Amenities
    private Boolean isAirConditioned;
    private Boolean hasProjector;
    private Boolean hasSmartBoard;
    private Boolean hasWifi;
    private Boolean hasPowerOutlets;

    // Timestamps
    private String createdAt;
    private String updatedAt;
    private Long createdBy;
    private Long updatedBy;
}