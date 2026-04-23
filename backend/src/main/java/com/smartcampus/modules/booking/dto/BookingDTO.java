package com.smartcampus.modules.booking.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingDTO {

    @Data
    public static class CreateRequest {
        private Long resourceId;
        private LocalDate bookingDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String purpose;
        private Integer expectedAttendees;
    }

    @Data
    public static class Response {
        private Long id;
        private String bookingNumber;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long resourceId;
        private String resourceName;
        private String resourceLocation;
        private LocalDate bookingDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String purpose;
        private Integer expectedAttendees;
        private String status;
        private String rejectionReason;
        private Long approvedBy;
        private String approvedByName;
        private LocalDateTime approvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class ApproveRequest {
        private String remarks;
    }

    @Data
    public static class RejectRequest {
        private String reason;
    }

    @Data
    public static class TimeSlot {
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean available;

        public TimeSlot(LocalTime start, LocalTime end, boolean available) {
            this.startTime = start;
            this.endTime = end;
            this.available = available;
        }
    }
}
