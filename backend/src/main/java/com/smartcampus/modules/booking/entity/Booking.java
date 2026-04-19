package com.smartcampus.modules.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resourceName;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;

    private String status;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getResourceName() { return resourceName; }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public LocalDate getDate() { return date; }

    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() { return endTime; }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() { return purpose; }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() { return status; }

    public void setStatus(String status) {
        this.status = status;
    }
}