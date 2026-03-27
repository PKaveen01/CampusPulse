package com.smartcampus.modules.auth.service;

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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void createNotification(Long userId, String type, String title,
                                   String message, String entityType, Long entityId) {
        UserPreferences prefs = preferencesRepository.findByUserId(userId)
            .orElse(new UserPreferences());

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
                log.error("Failed to send WebSocket notification", e);
            }
        }
    }

    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }
}
