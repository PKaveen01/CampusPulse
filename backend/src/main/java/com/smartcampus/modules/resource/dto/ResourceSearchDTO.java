package com.smartcampus.modules.resource.dto;

import lombok.Data;

@Data
public class ResourceSearchDTO {
    private String type;
    private Integer minCapacity;
    private Integer maxCapacity;
    private String location;
    private String status;
    private String searchTerm; // For searching by name or description
}