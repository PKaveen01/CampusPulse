package com.smartcampus.modules.booking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Stub placeholder — Member 2 (Booking Management & Conflict Resolution) implements full controller */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @GetMapping
    public ResponseEntity<?> getBookings() {
        return ResponseEntity.ok("Member 2: Implement BookingController here");
    }
}
