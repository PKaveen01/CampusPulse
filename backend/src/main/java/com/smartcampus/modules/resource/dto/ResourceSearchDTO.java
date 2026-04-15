package com.smartcampus.modules.resource.dto;

import lombok.Data;

@Data
public class ResourceSearchDTO {
    private String type;
    private Integer minCapacity;
    private Integer maxCapacity;
    private String location;
    private String building;
    private String status;
    private String searchTerm;

    // Amenities filters
    private Boolean airConditioned;
    private Boolean hasProjector;
    private Boolean hasSmartBoard;
    private Boolean hasWifi;
    private Boolean hasPowerOutlets;
}