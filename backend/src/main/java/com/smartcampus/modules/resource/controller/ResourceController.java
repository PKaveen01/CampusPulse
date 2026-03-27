package com.smartcampus.modules.resource.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Stub placeholder — Member 1 (Facilities & Assets Catalogue) implements full controller */
@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    @GetMapping
    public ResponseEntity<?> getAllResources() {
        return ResponseEntity.ok("Member 1: Implement ResourceController here");
    }
}
