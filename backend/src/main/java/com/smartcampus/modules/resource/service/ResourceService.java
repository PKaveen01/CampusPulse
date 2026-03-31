package com.smartcampus.modules.resource.service;

import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.dto.ResourceSearchDTO;
import com.smartcampus.modules.resource.dto.AvailabilityWindowDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

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
                                LocalTime startTime, LocalTime endTime);

    // Validation
    boolean validateResource(ResourceDTO resourceDTO);

    // Statistics
    long getActiveResourcesCount();
    Map<String, Long> getResourceTypeStatistics();

    // ========== NEW ANALYTICS METHODS ==========

    /**
     * Get complete analytics dashboard data
     * @return Map containing all analytics data (total, active, by type, etc.)
     */
    Map<String, Object> getResourceAnalytics();

    /**
     * Get resources needing maintenance based on usage
     * @return List of resources that need maintenance
     */
    List<ResourceDTO> getResourcesNeedingMaintenance();

    /**
     * Get utilization statistics for each resource type
     * @return Map of resource type to utilization percentage
     */
    Map<String, Double> getUtilizationByType();
}