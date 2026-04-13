package com.smartcampus.modules.resource.controller;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<ResourceDTO>>> getAllResources() {
        java.util.List<ResourceDTO> resources = resourceService.getResourcesForTicketSelection();
        return ResponseEntity.ok(ApiResponse.success("Resources fetched", resources));
    }
}
