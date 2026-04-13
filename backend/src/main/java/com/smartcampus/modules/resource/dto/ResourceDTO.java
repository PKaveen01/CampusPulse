package com.smartcampus.modules.resource.dto;

import com.smartcampus.modules.resource.entity.Resource;
import lombok.Data;

@Data
public class ResourceDTO {
    private Long id;
    private String name;
    private Long resourceTypeId;
    private Integer capacity;
    private String location;
    private String status;
    private String description;

    public static ResourceDTO fromEntity(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setResourceTypeId(resource.getResourceTypeId());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setDescription(resource.getDescription());
        return dto;
    }
}
