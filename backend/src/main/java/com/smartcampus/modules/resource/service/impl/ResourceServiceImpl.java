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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
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

        if (!validateResource(resourceDTO)) {
            throw new IllegalArgumentException("Invalid resource data");
        }

        Resource resource = Resource.builder()
                .name(resourceDTO.getName())
                .resourceType(resourceDTO.getResourceType())
                .capacity(resourceDTO.getCapacity())
                .location(resourceDTO.getLocation())
                .building(resourceDTO.getBuilding())
                .floor(resourceDTO.getFloor())
                .status(resourceDTO.getStatus() != null ? resourceDTO.getStatus() : "ACTIVE")
                .description(resourceDTO.getDescription())
                .imageUrl(resourceDTO.getImageUrl())
                .isAirConditioned(resourceDTO.getIsAirConditioned() != null ? resourceDTO.getIsAirConditioned() : false)
                .hasProjector(resourceDTO.getHasProjector() != null ? resourceDTO.getHasProjector() : false)
                .hasSmartBoard(resourceDTO.getHasSmartBoard() != null ? resourceDTO.getHasSmartBoard() : false)
                .hasWifi(resourceDTO.getHasWifi() != null ? resourceDTO.getHasWifi() : false)
                .hasPowerOutlets(resourceDTO.getHasPowerOutlets() != null ? resourceDTO.getHasPowerOutlets() : false)
                .build();

        Resource savedResource = resourceRepository.save(resource);
        log.info("Resource created successfully with ID: {}", savedResource.getId());

        return convertToDTO(savedResource);
    }

    @Override
    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        log.info("Updating resource with ID: {}", id);

        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        existingResource.setName(resourceDTO.getName());
        existingResource.setResourceType(resourceDTO.getResourceType());
        existingResource.setCapacity(resourceDTO.getCapacity());
        existingResource.setLocation(resourceDTO.getLocation());
        existingResource.setBuilding(resourceDTO.getBuilding());
        existingResource.setFloor(resourceDTO.getFloor());
        existingResource.setDescription(resourceDTO.getDescription());
        existingResource.setImageUrl(resourceDTO.getImageUrl());
        existingResource.setIsAirConditioned(resourceDTO.getIsAirConditioned());
        existingResource.setHasProjector(resourceDTO.getHasProjector());
        existingResource.setHasSmartBoard(resourceDTO.getHasSmartBoard());
        existingResource.setHasWifi(resourceDTO.getHasWifi());
        existingResource.setHasPowerOutlets(resourceDTO.getHasPowerOutlets());

        if (resourceDTO.getStatus() != null) {
            existingResource.setStatus(resourceDTO.getStatus());
        }

        Resource updatedResource = resourceRepository.save(existingResource);
        log.info("Resource updated successfully: {}", updatedResource.getId());

        return convertToDTO(updatedResource);
    }

    @Override
    public void deleteResource(Long id) {
        log.info("Deleting resource with ID: {}", id);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

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
        return resourceRepository.findAll().stream()
                .filter(resource -> type.equals(resource.getResourceType()))
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

        if (!Arrays.asList("ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        resource.setStatus(status);
        Resource updatedResource = resourceRepository.save(resource);

        return convertToDTO(updatedResource);
    }

    @Override
    public ResourceDTO markAsOutOfService(Long id, String reason) {
        log.info("Marking resource {} as OUT_OF_SERVICE. Reason: {}", id, reason);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        resource.setStatus("OUT_OF_SERVICE");
        String outOfServiceNote = "[OUT OF SERVICE] " + reason;
        if (resource.getDescription() != null && !resource.getDescription().isEmpty()) {
            resource.setDescription(outOfServiceNote + " | " + resource.getDescription());
        } else {
            resource.setDescription(outOfServiceNote);
        }

        Resource updatedResource = resourceRepository.save(resource);
        return convertToDTO(updatedResource);
    }

    @Override
    public ResourceDTO markAsActive(Long id) {
        log.info("Marking resource {} as ACTIVE", id);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + id));

        resource.setStatus("ACTIVE");
        if (resource.getDescription() != null && resource.getDescription().startsWith("[OUT OF SERVICE]")) {
            resource.setDescription(resource.getDescription().replaceFirst("\\[OUT OF SERVICE\\] [^|]*\\| ?", ""));
        }

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

        if (!resourceRepository.existsById(windowDTO.getResourceId())) {
            throw new IllegalArgumentException("Resource not found with ID: " + windowDTO.getResourceId());
        }

        if (windowDTO.getStartTime().isAfter(windowDTO.getEndTime()) ||
                windowDTO.getStartTime().equals(windowDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

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

    // ==================== NEW: AVAILABLE TIME SLOTS METHOD ====================

    @Override
    public Map<String, Object> getAvailableTimeSlots(Long resourceId, LocalDate date) {
        log.info("Getting available time slots for resource: {} on date: {}", resourceId, date);

        Map<String, Object> response = new HashMap<>();
        List<Map<String, String>> availableSlots = new ArrayList<>();

        try {
            int dayOfWeek = date.getDayOfWeek().getValue() - 1;

            List<AvailabilityWindow> windows = availabilityWindowRepository
                    .findByResourceIdAndDayOfWeek(resourceId, dayOfWeek);

            if (windows.isEmpty()) {
                response.put("date", date.toString());
                response.put("availableSlots", availableSlots);
                response.put("hasAvailability", false);
                return response;
            }

            for (AvailabilityWindow window : windows) {
                LocalTime current = window.getStartTime();
                LocalTime windowEnd = window.getEndTime();

                while (current.isBefore(windowEnd)) {
                    LocalTime slotEnd = current.plusMinutes(30);

                    if (!slotEnd.isAfter(windowEnd)) {
                        Map<String, String> slot = new HashMap<>();
                        slot.put("start", current.toString());
                        slot.put("end", slotEnd.toString());
                        availableSlots.add(slot);
                    }

                    current = slotEnd;
                }
            }

        } catch (Exception e) {
            log.error("Error getting available time slots: ", e);
        }

        response.put("date", date.toString());
        response.put("availableSlots", availableSlots);
        response.put("hasAvailability", !availableSlots.isEmpty());

        return response;
    }

    // ==================== VALIDATION ====================

    @Override
    public boolean validateResource(ResourceDTO resourceDTO) {
        if (resourceDTO.getName() == null || resourceDTO.getName().trim().isEmpty()) {
            log.warn("Validation failed: Resource name is empty");
            return false;
        }
        if (resourceDTO.getCapacity() == null || resourceDTO.getCapacity() < 1 || resourceDTO.getCapacity() > 500) {
            log.warn("Validation failed: Capacity must be between 1 and 500");
            return false;
        }
        if (resourceDTO.getLocation() == null || resourceDTO.getLocation().trim().isEmpty()) {
            log.warn("Validation failed: Location is empty");
            return false;
        }
        if (resourceDTO.getResourceType() == null || resourceDTO.getResourceType().trim().isEmpty()) {
            log.warn("Validation failed: Resource type is empty");
            return false;
        }
        return true;
    }

    // ==================== STATISTICS ====================

    @Override
    public long getActiveResourcesCount() {
        return resourceRepository.countActiveResources();
    }

    @Override
    public Map<String, Long> getResourceTypeStatistics() {
        Map<String, Long> statistics = new HashMap<>();
        List<Resource> allResources = resourceRepository.findAll();

        for (Resource resource : allResources) {
            String type = resource.getResourceType();
            if (type != null) {
                statistics.put(type, statistics.getOrDefault(type, 0L) + 1);
            }
        }

        return statistics;
    }

    // ==================== ANALYTICS METHODS ====================

    @Override
    public Map<String, Object> getResourceAnalytics() {
        log.info("Fetching resource analytics");

        Map<String, Object> analytics = new LinkedHashMap<>();
        List<Resource> allResources = resourceRepository.findAll();

        long totalResources = allResources.size();
        analytics.put("totalResources", totalResources);

        long activeResources = allResources.stream()
                .filter(r -> "ACTIVE".equals(r.getStatus()))
                .count();
        long outOfService = allResources.stream()
                .filter(r -> "OUT_OF_SERVICE".equals(r.getStatus()))
                .count();
        long maintenance = allResources.stream()
                .filter(r -> "MAINTENANCE".equals(r.getStatus()))
                .count();

        analytics.put("activeResources", activeResources);
        analytics.put("outOfServiceResources", outOfService);
        analytics.put("maintenanceResources", maintenance);

        double utilizationRate = totalResources > 0 ? (double) activeResources / totalResources * 100 : 0;
        analytics.put("utilizationRate", Math.round(utilizationRate * 10) / 10.0);

        Map<String, Long> resourcesByType = allResources.stream()
                .filter(r -> r.getResourceType() != null)
                .collect(Collectors.groupingBy(
                        Resource::getResourceType,
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        analytics.put("resourcesByType", resourcesByType);

        Map<String, Long> resourcesByBuilding = allResources.stream()
                .filter(r -> r.getBuilding() != null && !r.getBuilding().isEmpty())
                .collect(Collectors.groupingBy(
                        Resource::getBuilding,
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        analytics.put("resourcesByBuilding", resourcesByBuilding);

        Map<String, Long> resourcesByCapacity = new LinkedHashMap<>();
        resourcesByCapacity.put("Small (1-10)", allResources.stream().filter(r -> r.getCapacity() <= 10).count());
        resourcesByCapacity.put("Medium (11-50)", allResources.stream().filter(r -> r.getCapacity() > 10 && r.getCapacity() <= 50).count());
        resourcesByCapacity.put("Large (51+)", allResources.stream().filter(r -> r.getCapacity() > 50).count());
        analytics.put("resourcesByCapacity", resourcesByCapacity);

        long withAC = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getIsAirConditioned())).count();
        long withProjector = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getHasProjector())).count();
        long withSmartBoard = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getHasSmartBoard())).count();
        long withWifi = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getHasWifi())).count();
        long withPower = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getHasPowerOutlets())).count();

        Map<String, Long> amenities = new LinkedHashMap<>();
        amenities.put("Air Conditioned", withAC);
        amenities.put("Projector", withProjector);
        amenities.put("Smart Board", withSmartBoard);
        amenities.put("WiFi", withWifi);
        amenities.put("Power Outlets", withPower);
        analytics.put("amenities", amenities);

        return analytics;
    }

    @Override
    public List<ResourceDTO> getResourcesNeedingMaintenance() {
        log.info("Fetching resources needing maintenance");
        return resourceRepository.findAll().stream()
                .filter(r -> "MAINTENANCE".equals(r.getStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Double> getUtilizationByType() {
        log.info("Calculating utilization by resource type");

        List<Resource> allResources = resourceRepository.findAll();
        Map<String, Long> totalByType = allResources.stream()
                .filter(r -> r.getResourceType() != null)
                .collect(Collectors.groupingBy(Resource::getResourceType, Collectors.counting()));

        Map<String, Long> activeByType = allResources.stream()
                .filter(r -> "ACTIVE".equals(r.getStatus()))
                .filter(r -> r.getResourceType() != null)
                .collect(Collectors.groupingBy(Resource::getResourceType, Collectors.counting()));

        Map<String, Double> utilizationByType = new LinkedHashMap<>();

        for (Map.Entry<String, Long> entry : totalByType.entrySet()) {
            String type = entry.getKey();
            long total = entry.getValue();
            long active = activeByType.getOrDefault(type, 0L);
            double utilization = total > 0 ? (double) active / total * 100 : 0;
            utilizationByType.put(type, Math.round(utilization * 10) / 10.0);
        }

        return utilizationByType;
    }

    @Override
    public List<Map<String, Object>> getResourceTrend(String range) {
        log.info("Fetching resource trend for range: {}", range);

        List<Map<String, Object>> trendData = new ArrayList<>();

        try {
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate;
            int daysToSubtract;

            switch (range.toLowerCase()) {
                case "month":
                    daysToSubtract = 30;
                    break;
                case "year":
                    daysToSubtract = 365;
                    break;
                default:
                    daysToSubtract = 7;
            }

            startDate = endDate.minusDays(daysToSubtract);

            List<Resource> resources = resourceRepository.findByCreatedAtBetween(startDate, endDate);

            Map<String, Long> grouped = resources.stream()
                    .collect(Collectors.groupingBy(
                            r -> r.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            LocalDate current = startDate.toLocalDate();
            LocalDate end = endDate.toLocalDate();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");

            while (!current.isAfter(end)) {
                Map<String, Object> dayData = new LinkedHashMap<>();
                dayData.put("label", current.format(formatter));
                dayData.put("date", current.toString());
                dayData.put("count", grouped.getOrDefault(current.toString(), 0L));
                trendData.add(dayData);
                current = current.plusDays(1);
            }

        } catch (Exception e) {
            log.error("Error fetching trend data: ", e);
        }

        return trendData;
    }

    @Override
    public String exportAnalyticsToCsv(String range) {
        log.info("Exporting analytics to CSV for range: {}", range);

        StringBuilder csv = new StringBuilder();

        try {
            csv.append("Date,Resource Name,Type,Status,Capacity,Location,Building,Floor,Created At\n");

            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate;
            int daysToSubtract;

            switch (range.toLowerCase()) {
                case "month":
                    daysToSubtract = 30;
                    break;
                case "year":
                    daysToSubtract = 365;
                    break;
                default:
                    daysToSubtract = 7;
            }

            startDate = endDate.minusDays(daysToSubtract);

            List<Resource> resources = resourceRepository.findByCreatedAtBetween(startDate, endDate);

            for (Resource r : resources) {
                csv.append(String.format("%s,%s,%s,%s,%d,%s,%s,%s,%s\n",
                        r.getCreatedAt().toLocalDate(),
                        escapeCsv(r.getName()),
                        r.getResourceType() != null ? r.getResourceType() : "",
                        r.getStatus(),
                        r.getCapacity(),
                        escapeCsv(r.getLocation()),
                        r.getBuilding() != null ? r.getBuilding() : "",
                        r.getFloor() != null ? r.getFloor() : "",
                        r.getCreatedAt() != null ? r.getCreatedAt().toString() : ""
                ));
            }

        } catch (Exception e) {
            log.error("Error exporting analytics: ", e);
            csv.append("Error generating report");
        }

        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    // ==================== PRIVATE HELPER METHODS ====================

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

            if (searchDTO.getBuilding() != null && !searchDTO.getBuilding().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("building")),
                        "%" + searchDTO.getBuilding().toLowerCase() + "%"
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

            if (searchDTO.getAirConditioned() != null && searchDTO.getAirConditioned()) {
                predicates.add(criteriaBuilder.isTrue(root.get("isAirConditioned")));
            }
            if (searchDTO.getHasProjector() != null && searchDTO.getHasProjector()) {
                predicates.add(criteriaBuilder.isTrue(root.get("hasProjector")));
            }
            if (searchDTO.getHasSmartBoard() != null && searchDTO.getHasSmartBoard()) {
                predicates.add(criteriaBuilder.isTrue(root.get("hasSmartBoard")));
            }
            if (searchDTO.getHasWifi() != null && searchDTO.getHasWifi()) {
                predicates.add(criteriaBuilder.isTrue(root.get("hasWifi")));
            }
            if (searchDTO.getHasPowerOutlets() != null && searchDTO.getHasPowerOutlets()) {
                predicates.add(criteriaBuilder.isTrue(root.get("hasPowerOutlets")));
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
                .building(resource.getBuilding())
                .floor(resource.getFloor())
                .status(resource.getStatus())
                .description(resource.getDescription())
                .imageUrl(resource.getImageUrl())
                .isAirConditioned(resource.getIsAirConditioned())
                .hasProjector(resource.getHasProjector())
                .hasSmartBoard(resource.getHasSmartBoard())
                .hasWifi(resource.getHasWifi())
                .hasPowerOutlets(resource.getHasPowerOutlets())
                .createdAt(resource.getCreatedAt() != null ? resource.getCreatedAt().toString() : null)
                .updatedAt(resource.getUpdatedAt() != null ? resource.getUpdatedAt().toString() : null)
                .createdBy(resource.getCreatedBy())
                .updatedBy(resource.getUpdatedBy())
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