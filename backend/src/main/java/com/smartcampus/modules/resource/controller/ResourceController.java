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
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO createdResource = resourceService.createResource(resourceDTO);
        return new ResponseEntity<>(createdResource, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO updatedResource = resourceService.updateResource(id, resourceDTO);
        return ResponseEntity.ok(updatedResource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ResourceDTO>> getAllResources(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceDTO> resources = resourceService.getAllResourcesPaginated(pageable);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ResourceDTO>> getAllResourcesList() {
        List<ResourceDTO> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    // ==================== Search Operations ====================

    @PostMapping("/search")
    public ResponseEntity<Page<ResourceDTO>> searchResources(
            @RequestBody ResourceSearchDTO searchDTO,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ResourceDTO> results = resourceService.searchResources(searchDTO, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByType(@PathVariable String type) {
        List<ResourceDTO> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByStatus(@PathVariable String status) {
        List<ResourceDTO> resources = resourceService.getResourcesByStatus(status);
        return ResponseEntity.ok(resources);
    }

    // ==================== Status Management ====================

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceDTO> updateResourceStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        ResourceDTO updatedResource = resourceService.updateResourceStatus(id, status);
        return ResponseEntity.ok(updatedResource);
    }

    @PostMapping("/{id}/out-of-service")
    public ResponseEntity<ResourceDTO> markAsOutOfService(
            @PathVariable Long id,
            @RequestParam String reason) {
        ResourceDTO updatedResource = resourceService.markAsOutOfService(id, reason);
        return ResponseEntity.ok(updatedResource);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ResourceDTO> markAsActive(@PathVariable Long id) {
        ResourceDTO updatedResource = resourceService.markAsActive(id);
        return ResponseEntity.ok(updatedResource);
    }

    // ==================== Availability Management ====================

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilityWindowDTO>> getAvailabilityWindows(@PathVariable Long id) {
        List<AvailabilityWindowDTO> windows = resourceService.getAvailabilityWindows(id);
        return ResponseEntity.ok(windows);
    }

    @PostMapping("/availability")
    public ResponseEntity<AvailabilityWindowDTO> addAvailabilityWindow(
            @Valid @RequestBody AvailabilityWindowDTO windowDTO) {
        AvailabilityWindowDTO savedWindow = resourceService.addAvailabilityWindow(windowDTO);
        return new ResponseEntity<>(savedWindow, HttpStatus.CREATED);
    }

    @DeleteMapping("/availability/{windowId}")
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
                id,
                dayOfWeek,
                java.time.LocalTime.parse(startTime),
                java.time.LocalTime.parse(endTime)
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);

        return ResponseEntity.ok(response);
    }

    // ==================== Statistics ====================

    @GetMapping("/statistics/count")
    public ResponseEntity<Map<String, Long>> getActiveResourcesCount() {
        long count = resourceService.getActiveResourcesCount();
        Map<String, Long> response = new HashMap<>();
        response.put("activeResources", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics/types")
    public ResponseEntity<Map<String, Long>> getResourceTypeStatistics() {
        Map<String, Long> statistics = resourceService.getResourceTypeStatistics();
        return ResponseEntity.ok(statistics);
    }
}