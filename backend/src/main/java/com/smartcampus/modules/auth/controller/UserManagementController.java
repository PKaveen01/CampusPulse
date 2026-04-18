package com.smartcampus.modules.auth.controller;

import com.smartcampus.modules.auth.dto.AuthDTOs;
import com.smartcampus.modules.auth.service.UserService;
import com.smartcampus.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuthDTOs.UserDTO>>> getAllUsers() {
        List<AuthDTOs.UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AuthDTOs.UserDTO>>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        List<AuthDTOs.UserDTO> users = userService.searchUsers(query, role, isActive);
        return ResponseEntity.ok(ApiResponse.success("Search results", users));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStats() {
        Map<String, Long> stats = userService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success("User stats", stats));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        AuthDTOs.UserDTO user = userService.updateUserRole(id, body.get("role"));
        return ResponseEntity.ok(ApiResponse.success("Role updated", user));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> toggleStatus(@PathVariable Long id) {
        AuthDTOs.UserDTO user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Status updated", user));
    }
}