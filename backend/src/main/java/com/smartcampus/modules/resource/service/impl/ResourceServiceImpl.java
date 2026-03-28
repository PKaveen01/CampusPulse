package com.smartcampus.modules.resource.service.impl;

import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.dto.ResourceSearchDTO;
import com.smartcampus.modules.resource.dto.AvailabilityWindowDTO;
import com.smartcampus.modules.resource.entity.Resource;
import com.smartcampus.modules.resource.entity.AvailabilityWindow;
import com.smartcampus.modules.resource.repository.ResourceRepository;
import com.smartcampus.modules.resource.repository.AvailabilityWindowRepository;
import com.smartcampus.modules.resource.service.ResourceService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;

    @Override
    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        log.info("Creating new resource: {}", resourceDTO.getName());

        // Validate resource
        if (!validateResource(resourceDTO)) {
            throw new IllegalArgumentException("Invalid resource data");
        }

        // Check for duplicate name
        if (resourceRepository.existsByName(resourceDTO.getName())) {
            throw new IllegalArgumentException("Resource with name '" + resourceDTO.getName() + "' already exists");
        }

        // Convert DTO to Entity
        Resource resource = Resource.builder()
                .name(resourceDTO.getName())
                .resourceType(resourceDTO.getResourceType())
                .capacity(resourceDTO.getCapacity())
                .location(resourceDTO.getLocation())
                .status(resourceDTO.getStatus() != null ? resourceDTO.getStatus() : "ACTIVE")
                .description(resourceDTO.getDescription())
                .imageUrl(resourceDTO.getImageUrl())
                .build();

        // Save to database
        Resource savedResource = resourceRepository.save(resource);
        log.info("Resource created successfully with ID: {}", savedResource.getId());

        return convertToDTO(savedResource);
    }

    @Override
    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        log.info("Updating resource with ID: {}", id);

        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        // Check for duplicate name if name is being changed
        if (!existingResource.getName().equals(resourceDTO.getName()) &&
                resourceRepository.existsByName(resourceDTO.getName())) {
            throw new IllegalArgumentException("Resource with name '" + resourceDTO.getName() + "' already exists");
        }

        // Update fields
        existingResource.setName(resourceDTO.getName());
        existingResource.setResourceType(resourceDTO.getResourceType());
        existingResource.setCapacity(resourceDTO.getCapacity());
        existingResource.setLocation(resourceDTO.getLocation());
        existingResource.setDescription(resourceDTO.getDescription());
        existingResource.setImageUrl(resourceDTO.getImageUrl());

        // Don't update status through this method - use specific status update method

        Resource updatedResource = resourceRepository.save(existingResource);
        log.info("Resource updated successfully: {}", updatedResource.getId());

        return convertToDTO(updatedResource);
    }

    @Override
    public void deleteResource(Long id) {
        log.info("Deleting resource with ID: {}", id);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        // Check if resource has any active bookings (if integrated with booking module)
        // This would be implemented when integrating with Member 2

        resourceRepository.delete(resource);
        log.info("Resource deleted successfully: {}", id);
    }

    @Override
    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));
        return convertToDTO(resource);
    }

    @Override
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ResourceDTO> getAllResourcesPaginated(Pageable pageable) {
        return resourceRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Override
    public Page<ResourceDTO> searchResources(ResourceSearchDTO searchDTO, Pageable pageable) {
        Specification<Resource> spec = buildSearchSpecification(searchDTO);
        return resourceRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Override
    public List<ResourceDTO> getResourcesByType(String type) {
        return resourceRepository.findByResourceType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceDTO> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDTO updateResourceStatus(Long id, String status) {
        log.info("Updating resource {} status to: {}", id, status);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        // Validate status
        if (!Arrays.asList("ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        resource.setStatus(status);
        Resource updatedResource = resourceRepository.save(resource);

        log.info("Resource status updated successfully");
        return convertToDTO(updatedResource);
    }

    @Override
    public ResourceDTO markAsOutOfService(Long id, String reason) {
        log.info("Marking resource {} as OUT_OF_SERVICE. Reason: {}", id, reason);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        resource.setStatus("OUT_OF_SERVICE");
        // Store reason in description or separate field if needed
        if (resource.getDescription() != null) {
            resource.setDescription("[OUT OF SERVICE] " + reason + " | " + resource.getDescription());
        } else {
            resource.setDescription("[OUT OF SERVICE] " + reason);
        }

        Resource updatedResource = resourceRepository.save(resource);

        // TODO: Create notification for users with pending bookings
        // TODO: Create maintenance ticket (integration with Member 3)

        return convertToDTO(updatedResource);
    }

    @Override
    public ResourceDTO markAsActive(Long id) {
        log.info("Marking resource {} as ACTIVE", id);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        resource.setStatus("ACTIVE");
        Resource updatedResource = resourceRepository.save(resource);

        return convertToDTO(updatedResource);
    }

    @Override
    public List<AvailabilityWindowDTO> getAvailabilityWindows(Long resourceId) {
        return availabilityWindowRepository.findByResourceId(resourceId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AvailabilityWindowDTO addAvailabilityWindow(AvailabilityWindowDTO windowDTO) {
        log.info("Adding availability window for resource: {}", windowDTO.getResourceId());

        // Validate resource exists
        if (!resourceRepository.existsById(windowDTO.getResourceId())) {
            throw new IllegalArgumentException("Resource not found with ID: " + windowDTO.getResourceId());
        }

        // Validate time range
        if (windowDTO.getStartTime().isAfter(windowDTO.getEndTime()) ||
                windowDTO.getStartTime().equals(windowDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for overlapping windows (optional)
        // This could be implemented to prevent overlapping availability windows

        AvailabilityWindow window = AvailabilityWindow.builder()
                .resourceId(windowDTO.getResourceId())
                .dayOfWeek(windowDTO.getDayOfWeek())
                .startTime(windowDTO.getStartTime())
                .endTime(windowDTO.getEndTime())
                .build();

        AvailabilityWindow savedWindow = availabilityWindowRepository.save(window);
        log.info("Availability window added successfully with ID: {}", savedWindow.getId());

        return convertToDTO(savedWindow);
    }

    @Override
    public void removeAvailabilityWindow(Long windowId) {
        log.info("Removing availability window with ID: {}", windowId);

        if (!availabilityWindowRepository.existsById(windowId)) {
            throw new IllegalArgumentException("Availability window not found with ID: " + windowId);
        }

        availabilityWindowRepository.deleteById(windowId);
        log.info("Availability window removed successfully");
    }

    @Override
    public boolean isResourceAvailable(Long resourceId, Integer dayOfWeek,
                                       LocalTime startTime, LocalTime endTime) {
        return availabilityWindowRepository.isWithinAvailability(
                resourceId, dayOfWeek, startTime, endTime);
    }

    @Override
    public boolean validateResource(ResourceDTO resourceDTO) {
        if (resourceDTO.getName() == null || resourceDTO.getName().trim().isEmpty()) {
            return false;
        }

        if (resourceDTO.getCapacity() == null || resourceDTO.getCapacity() < 1 || resourceDTO.getCapacity() > 500) {
            return false;
        }

        if (resourceDTO.getLocation() == null || resourceDTO.getLocation().trim().isEmpty()) {
            return false;
        }

        return true;
    }

    @Override
    public String generateResourceDescription(ResourceDTO resourceDTO) {
        StringBuilder description = new StringBuilder();
        description.append("Resource: ").append(resourceDTO.getName()).append("\n");
        description.append("Type: ").append(resourceDTO.getResourceType()).append("\n");
        description.append("Capacity: ").append(resourceDTO.getCapacity()).append(" people\n");
        description.append("Location: ").append(resourceDTO.getLocation()).append("\n");

        if (resourceDTO.getDescription() != null && !resourceDTO.getDescription().isEmpty()) {
            description.append("\n").append(resourceDTO.getDescription());
        }

        return description.toString();
    }

    @Override
    public long getActiveResourcesCount() {
        return resourceRepository.countActiveResources();
    }

    @Override
    public Map<String, Long> getResourceTypeStatistics() {
        // This would need a custom query to group by resource type
        // For now, return a placeholder
        Map<String, Long> statistics = new HashMap<>();
        // Implementation would be added here
        return statistics;
    }

    // Private Helper Methods

    private Specification<Resource> buildSearchSpecification(ResourceSearchDTO searchDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchDTO.getType() != null && !searchDTO.getType().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("resourceType"), searchDTO.getType()));
            }

            if (searchDTO.getMinCapacity() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), searchDTO.getMinCapacity()));
            }

            if (searchDTO.getMaxCapacity() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("capacity"), searchDTO.getMaxCapacity()));
            }

            if (searchDTO.getLocation() != null && !searchDTO.getLocation().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")),
                        "%" + searchDTO.getLocation().toLowerCase() + "%"
                ));
            }

            if (searchDTO.getStatus() != null && !searchDTO.getStatus().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), searchDTO.getStatus()));
            }

            if (searchDTO.getSearchTerm() != null && !searchDTO.getSearchTerm().isEmpty()) {
                String searchPattern = "%" + searchDTO.getSearchTerm().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchPattern);
                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), searchPattern);
                predicates.add(criteriaBuilder.or(namePredicate, descriptionPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ResourceDTO convertToDTO(Resource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .resourceType(resource.getResourceType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .description(resource.getDescription())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt() != null ? resource.getCreatedAt().toString() : null)
                .updatedAt(resource.getUpdatedAt() != null ? resource.getUpdatedAt().toString() : null)
                .build();
    }

    private AvailabilityWindowDTO convertToDTO(AvailabilityWindow window) {
        AvailabilityWindowDTO dto = new AvailabilityWindowDTO();
        dto.setId(window.getId());
        dto.setResourceId(window.getResourceId());
        dto.setDayOfWeek(window.getDayOfWeek());
        dto.setStartTime(window.getStartTime());
        dto.setEndTime(window.getEndTime());
        return dto;
    }
}