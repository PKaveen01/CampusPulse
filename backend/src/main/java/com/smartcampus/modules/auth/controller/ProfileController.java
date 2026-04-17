package com.smartcampus.modules.auth.controller;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.modules.auth.dto.AuthDTOs;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.auth.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/profile
     * Returns the full profile of the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> getProfile(
            @AuthenticationPrincipal CustomUserDetails principal) {
        AuthDTOs.UserDTO profile = profileService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    /**
     * PUT /api/profile
     * Updates name, phone, department, bio.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody AuthDTOs.ProfileUpdateRequest request) {
        AuthDTOs.UserDTO updated = profileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /**
     * POST /api/profile/avatar
     * Uploads a new profile picture (multipart/form-data, field name: "file").
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam("file") MultipartFile file) {
        try {
            AuthDTOs.UserDTO updated = profileService.uploadAvatar(principal.getId(), file);
            return ResponseEntity.ok(ApiResponse.success("Avatar updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Avatar upload failed for user {}: {}", principal.getId(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Avatar upload failed. Please try again."));
        }
    }

    /**
     * DELETE /api/profile/avatar
     * Removes the user's avatar (reverts to null / initials fallback).
     */
    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> removeAvatar(
            @AuthenticationPrincipal CustomUserDetails principal) {
        // Re-use uploadAvatar with null signals: just clear the URL in service
        AuthDTOs.UserDTO updated = profileService.removeAvatar(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Avatar removed", updated));
    }

    /**
     * PUT /api/profile/password
     * Changes the local-auth password.
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody AuthDTOs.ChangePasswordRequest request) {
        try {
            profileService.changePassword(principal.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
