package com.smartcampus.modules.ticket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Stub placeholder — Member 3 (Maintenance & Incident Ticketing) implements full controller */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    @GetMapping
    public ResponseEntity<?> getTickets() {
        return ResponseEntity.ok("Member 3: Implement TicketController here");
    }
}
