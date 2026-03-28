package com.smartcampus.modules.resource.service;

import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.dto.ResourceSearchDTO;
import com.smartcampus.modules.resource.dto.AvailabilityWindowDTO;
import com.smartcampus.modules.resource.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ResourceService {

    // CRUD Operations
    ResourceDTO createResource(ResourceDTO resourceDTO);
    ResourceDTO updateResource(Long id, ResourceDTO resourceDTO);
    void deleteResource(Long id);
    ResourceDTO getResourceById(Long id);
    List<ResourceDTO> getAllResources();
    Page<ResourceDTO> getAllResourcesPaginated(Pageable pageable);

    // Search Operations
    Page<ResourceDTO> searchResources(ResourceSearchDTO searchDTO, Pageable pageable);
    List<ResourceDTO> getResourcesByType(String type);
    List<ResourceDTO> getResourcesByStatus(String status);

    // Status Management
    ResourceDTO updateResourceStatus(Long id, String status);
    ResourceDTO markAsOutOfService(Long id, String reason);
    ResourceDTO markAsActive(Long id);

    // Availability Management
    List<AvailabilityWindowDTO> getAvailabilityWindows(Long resourceId);
    AvailabilityWindowDTO addAvailabilityWindow(AvailabilityWindowDTO windowDTO);
    void removeAvailabilityWindow(Long windowId);
    boolean isResourceAvailable(Long resourceId, Integer dayOfWeek,
                                java.time.LocalTime startTime, java.time.LocalTime endTime);

    // Validation
    boolean validateResource(ResourceDTO resourceDTO);
    String generateResourceDescription(ResourceDTO resourceDTO);

    // Statistics
    long getActiveResourcesCount();
    java.util.Map<String, Long> getResourceTypeStatistics();
}