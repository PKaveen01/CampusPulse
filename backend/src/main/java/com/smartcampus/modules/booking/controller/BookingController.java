package com.smartcampus.modules.booking.controller;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.booking.dto.BookingDTO;
import com.smartcampus.modules.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── Create booking ──────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<BookingDTO.Response>> createBooking(
            @RequestBody BookingDTO.CreateRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        BookingDTO.Response result = bookingService.createBooking(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Booking submitted successfully", result));
    }

    // ── My bookings (current user) ──────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<BookingDTO.Response>>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails principal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingDTO.Response> result = bookingService.getMyBookings(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("My bookings retrieved", result));
    }

    // ── Admin: all bookings ─────────────────────────────────────────────────
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<BookingDTO.Response>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingDTO.Response> result = bookingService.getAllBookings(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("All bookings retrieved", result));
    }

    // ── Get single booking ──────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        BookingDTO.Response result = bookingService.getBookingById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved", result));
    }

    // ── Approve booking ─────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingDTO.ApproveRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        String remarks = request != null ? request.getRemarks() : null;
        BookingDTO.Response result = bookingService.approveBooking(id, principal.getId(), remarks);
        return ResponseEntity.ok(ApiResponse.success("Booking approved", result));
    }

    // ── Reject booking ──────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> rejectBooking(
            @PathVariable Long id,
            @RequestBody BookingDTO.RejectRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        BookingDTO.Response result = bookingService.rejectBooking(id, principal.getId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", result));
    }

    // ── Cancel booking ──────────────────────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        BookingDTO.Response result = bookingService.cancelBooking(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", result));
    }

    // ── Delete booking (only while PENDING) ─────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        try {
            bookingService.deleteBooking(id, principal.getId());
            return ResponseEntity.ok(ApiResponse.success("Booking deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── Available time slots ────────────────────────────────────────────────
    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<BookingDTO.TimeSlot>>> getAvailableSlots(
            @RequestParam Long resourceId,
            @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<BookingDTO.TimeSlot> slots = bookingService.getAvailableTimeSlots(resourceId, localDate);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved", slots));
    }

    // ── Conflict check ──────────────────────────────────────────────────────
    @GetMapping("/check-conflict")
    public ResponseEntity<ApiResponse<Boolean>> checkConflict(
            @RequestParam Long resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        boolean hasConflict = bookingService.checkConflict(
            resourceId,
            LocalDate.parse(date),
            LocalTime.parse(startTime),
            LocalTime.parse(endTime)
        );
        return ResponseEntity.ok(ApiResponse.success("Conflict check completed", hasConflict));
    }
}
