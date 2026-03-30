package com.smartcampus.modules.resource.controller;

import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.dto.ResourceSearchDTO;
import com.smartcampus.modules.resource.dto.AvailabilityWindowDTO;
import com.smartcampus.modules.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    // ==================== CRUD Operations ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO created = resourceService.createResource(resourceDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceDTO resourceDTO) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ResourceDTO>> getAllResources(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(resourceService.getAllResourcesPaginated(pageable));
    }

    // ==================== Search Operations ====================

    @PostMapping("/search")
    public ResponseEntity<Page<ResourceDTO>> searchResources(
            @RequestBody ResourceSearchDTO searchDTO,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(searchDTO, pageable));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByType(@PathVariable String type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(resourceService.getResourcesByStatus(status));
    }

    // ==================== Status Management ====================

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceDTO> updateResourceStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    @PostMapping("/{id}/out-of-service")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceDTO> markAsOutOfService(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(resourceService.markAsOutOfService(id, reason));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceDTO> markAsActive(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.markAsActive(id));
    }

    // ==================== Availability Management ====================

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilityWindowDTO>> getAvailabilityWindows(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getAvailabilityWindows(id));
    }

    @PostMapping("/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AvailabilityWindowDTO> addAvailabilityWindow(@Valid @RequestBody AvailabilityWindowDTO windowDTO) {
        return new ResponseEntity<>(resourceService.addAvailabilityWindow(windowDTO), HttpStatus.CREATED);
    }

    @DeleteMapping("/availability/{windowId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> removeAvailabilityWindow(@PathVariable Long windowId) {
        resourceService.removeAvailabilityWindow(windowId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @PathVariable Long id,
            @RequestParam Integer dayOfWeek,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        boolean isAvailable = resourceService.isResourceAvailable(
                id, dayOfWeek, LocalTime.parse(startTime), LocalTime.parse(endTime));

        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    // ==================== Statistics ====================

    @GetMapping("/statistics/count")
    public ResponseEntity<Map<String, Long>> getActiveResourcesCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("activeResources", resourceService.getActiveResourcesCount());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics/types")
    public ResponseEntity<Map<String, Long>> getResourceTypeStatistics() {
        return ResponseEntity.ok(resourceService.getResourceTypeStatistics());
    }

    // ==================== Reference Data ====================

    @GetMapping("/types")
    public ResponseEntity<List<String>> getResourceTypes() {
        List<String> types = List.of("Lecture Hall", "Meeting Room", "Laboratory", "Equipment", "Study Room", "Auditorium", "Seminar Room");
        return ResponseEntity.ok(types);
    }

    @GetMapping("/available/now")
    public ResponseEntity<List<ResourceDTO>> getAvailableResourcesNow() {
        // This would need additional logic to check current availability
        return ResponseEntity.ok(resourceService.getResourcesByStatus("ACTIVE"));
    }
}