package com.smartcampus.modules.auth.controller;

import com.smartcampus.modules.auth.dto.NotificationDTOs.PreferencesDTO;
import com.smartcampus.modules.auth.entity.Notification;
import com.smartcampus.modules.auth.entity.UserPreferences;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.auth.service.NotificationService;
import com.smartcampus.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Notification> notifications = notificationService.getUserNotifications(
            currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("count", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    // ── NEW: Delete a single notification ──────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.deleteNotification(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    // ── NEW: Delete all read notifications ─────────────────────────────────
    @DeleteMapping("/read")
    public ResponseEntity<ApiResponse<Void>> deleteAllRead(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.deleteAllRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Read notifications deleted", null));
    }

    // ── NEW: Get user preferences ───────────────────────────────────────────
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> getPreferences(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        UserPreferences prefs = notificationService.getPreferences(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Preferences fetched", prefs));
    }

    // ── NEW: Update user preferences ────────────────────────────────────────
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> updatePreferences(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody PreferencesDTO dto) {
        UserPreferences prefs = notificationService.updatePreferences(currentUser.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", prefs));
    }
}
