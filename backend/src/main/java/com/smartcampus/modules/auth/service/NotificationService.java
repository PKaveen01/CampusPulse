package com.smartcampus.modules.auth.service;

import com.smartcampus.modules.auth.dto.NotificationDTOs.PreferencesDTO;
import com.smartcampus.modules.auth.entity.Notification;
import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.entity.UserPreferences;
import com.smartcampus.modules.auth.repository.NotificationRepository;
import com.smartcampus.modules.auth.repository.UserPreferencesRepository;
import com.smartcampus.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Core delivery ──────────────────────────────────────────────────────

    /**
     * Save a notification for one user and push it over WebSocket.
     * Respects per-user in-app toggle and category (booking/ticket) toggles.
     */
    public void createNotification(Long userId, String type, String title,
                                   String message, String entityType, Long entityId) {
        UserPreferences prefs = preferencesRepository.findByUserId(userId)
                .orElse(new UserPreferences());

        // Respect per-category opt-out
        if (type != null && type.startsWith("BOOKING") && !prefs.isBookingUpdates()) return;
        if (type != null && (type.startsWith("TICKET") || type.equals("SLA_BREACH"))
                && !prefs.isTicketUpdates()) return;

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        if (prefs.isInAppNotifications()) {
            try {
                messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        "/queue/notifications",
                        notification
                );
            } catch (Exception e) {
                log.error("WS push failed for user {}: {}", userId, e.getMessage());
            }
        }
    }

    /**
     * Fan-out to every user with the given role.
     */
    public void notifyByRole(User.Role role, String type, String title,
                             String message, String entityType, Long entityId) {
        userRepository.findByRole(role).forEach(u ->
                createNotification(u.getId(), type, title, message, entityType, entityId));
    }

    /**
     * Fan-out to every user with any of the given roles.
     */
    public void notifyByRoles(List<User.Role> roles, String type, String title,
                              String message, String entityType, Long entityId) {
        userRepository.findByRoleIn(roles).forEach(u ->
                createNotification(u.getId(), type, title, message, entityType, entityId));
    }

    // ── Query ──────────────────────────────────────────────────────────────

    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ── Mark read ──────────────────────────────────────────────────────────

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    // ── Delete ─────────────────────────────────────────────────────────────

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");
        notificationRepository.delete(n);
    }

    @Transactional
    public void deleteAllRead(Long userId) {
        notificationRepository.deleteAllReadByUserId(userId);
    }

    // ── Preferences ────────────────────────────────────────────────────────

    public UserPreferences getPreferences(Long userId) {
        return preferencesRepository.findByUserId(userId).orElseGet(() -> {
            UserPreferences p = UserPreferences.builder()
                    .userId(userId).inAppNotifications(true)
                    .emailNotifications(true).bookingUpdates(true).ticketUpdates(true)
                    .build();
            return preferencesRepository.save(p);
        });
    }

    @Transactional
    public UserPreferences updatePreferences(Long userId, PreferencesDTO dto) {
        UserPreferences p = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> UserPreferences.builder().userId(userId).build());
        if (dto.getInAppNotifications() != null) p.setInAppNotifications(dto.getInAppNotifications());
        if (dto.getEmailNotifications()  != null) p.setEmailNotifications(dto.getEmailNotifications());
        if (dto.getBookingUpdates()       != null) p.setBookingUpdates(dto.getBookingUpdates());
        if (dto.getTicketUpdates()        != null) p.setTicketUpdates(dto.getTicketUpdates());
        return preferencesRepository.save(p);
    }
}
