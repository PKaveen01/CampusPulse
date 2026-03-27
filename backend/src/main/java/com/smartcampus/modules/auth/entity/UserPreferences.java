package com.smartcampus.modules.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "in_app_notifications")
    private Boolean inAppNotifications = true;

    @Column(name = "booking_updates")
    private Boolean bookingUpdates = true;

    @Column(name = "ticket_updates")
    private Boolean ticketUpdates = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isInAppNotifications() {
        return inAppNotifications != null && inAppNotifications;
    }

    public boolean isEmailNotifications() {
        return emailNotifications != null && emailNotifications;
    }
}
