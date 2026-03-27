package com.smartcampus.modules.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Stub placeholder — Member 2 (Booking Management) implements full entity */
@Entity
@Table(name = "bookings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private String bookingNumber;
    private Long userId;
    private Long resourceId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    @Column(columnDefinition = "TEXT") private String purpose;
    private Integer expectedAttendees;
    @Column(length = 20) private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
