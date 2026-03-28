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
    private String resourceType;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String status;

    private String description;

    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid image URL format")
    private String imageUrl;

    // For response only
    private String createdAt;
    private String updatedAt;
}