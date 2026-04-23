package com.smartcampus.modules.booking.service.impl;

import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import com.smartcampus.modules.auth.service.NotificationService;
import com.smartcampus.modules.booking.dto.BookingDTO;
import com.smartcampus.modules.booking.entity.Booking;
import com.smartcampus.modules.booking.entity.BookingHistory;
import com.smartcampus.modules.booking.repository.BlockedDateRepository;
import com.smartcampus.modules.booking.repository.BookingHistoryRepository;
import com.smartcampus.modules.booking.repository.BookingRepository;
import com.smartcampus.modules.booking.service.BookingService;
import com.smartcampus.modules.resource.entity.AvailabilityWindow;
import com.smartcampus.modules.resource.entity.Resource;
import com.smartcampus.modules.resource.repository.AvailabilityWindowRepository;
import com.smartcampus.modules.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository historyRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final ResourceRepository resourceRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── CREATE ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingDTO.Response createBooking(BookingDTO.CreateRequest request, Long userId) {

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus()))
            throw new RuntimeException("Resource is not available (status: " + resource.getStatus() + ")");

        if (request.getBookingDate().isBefore(LocalDate.now()))
            throw new RuntimeException("Cannot book a date in the past");

        if (request.getExpectedAttendees() != null
                && request.getExpectedAttendees() > resource.getCapacity())
            throw new RuntimeException("Expected attendees exceed resource capacity of " + resource.getCapacity());

        if (!request.getStartTime().isBefore(request.getEndTime()))
            throw new RuntimeException("Start time must be before end time");

        if (blockedDateRepository.existsByResourceIdAndDate(request.getResourceId(), request.getBookingDate())
                || blockedDateRepository.existsByResourceIdIsNullAndDate(request.getBookingDate()))
            throw new RuntimeException("This date is blocked for bookings");

        int dow = request.getBookingDate().getDayOfWeek().getValue() - 1;
        if (!availabilityWindowRepository.isWithinAvailability(
                request.getResourceId(), dow, request.getStartTime(), request.getEndTime()))
            throw new RuntimeException("Requested time is outside the resource's availability window");

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(), request.getBookingDate(),
                request.getStartTime(), request.getEndTime(),
                List.of("PENDING", "APPROVED"));
        if (!conflicts.isEmpty())
            throw new RuntimeException("This time slot is already booked.");

        Booking booking = Booking.builder()
                .bookingNumber(generateBookingNumber())
                .userId(userId)
                .resourceId(request.getResourceId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status("PENDING")
                .build();

        final Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), "CREATED", userId, null, "PENDING", "Booking submitted");

        // ── Notify ADMIN + MANAGER: new booking needs approval ──
        String adminMsg = String.format("Booking #%s for %s needs your approval",
                saved.getBookingNumber(), resource.getName());
        try {
            notificationService.notifyByRoles(
                    List.of(User.Role.ADMIN, User.Role.MANAGER),
                    "BOOKING_PENDING",
                    "New Booking Request",
                    adminMsg,
                    "BOOKING", saved.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to notify staff about new booking: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    // ── APPROVE ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingDTO.Response approveBooking(Long bookingId, Long adminId, String remarks) {
        Booking booking = getOrThrow(bookingId);
        if (!"PENDING".equals(booking.getStatus()))
            throw new RuntimeException("Only PENDING bookings can be approved");

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(), booking.getBookingDate(),
                booking.getStartTime(), booking.getEndTime(), List.of("APPROVED"));
        conflicts.removeIf(c -> c.getId().equals(bookingId));
        if (!conflicts.isEmpty())
            throw new RuntimeException("Cannot approve: conflicts with an already approved booking");

        String oldStatus = booking.getStatus();
        booking.setStatus("APPROVED");
        booking.setApprovedBy(adminId);
        booking.setApprovedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        recordHistory(bookingId, "APPROVED", adminId, oldStatus, "APPROVED", remarks);

        // ── Notify the booking owner ──
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        String resourceName = resource != null ? resource.getName() : "the resource";
        notifyUser(booking.getUserId(), "BOOKING_APPROVED",
                "Booking Approved ✓",
                String.format("Your booking #%s for %s on %s has been approved!",
                        booking.getBookingNumber(), resourceName, booking.getBookingDate()),
                bookingId);

        return toResponse(booking);
    }

    // ── REJECT ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingDTO.Response rejectBooking(Long bookingId, Long adminId, String reason) {
        Booking booking = getOrThrow(bookingId);
        if (!"PENDING".equals(booking.getStatus()))
            throw new RuntimeException("Only PENDING bookings can be rejected");

        String oldStatus = booking.getStatus();
        booking.setStatus("REJECTED");
        booking.setRejectionReason(reason);
        bookingRepository.save(booking);
        recordHistory(bookingId, "REJECTED", adminId, oldStatus, "REJECTED", reason);

        // ── Notify the booking owner ──
        notifyUser(booking.getUserId(), "BOOKING_REJECTED",
                "Booking Rejected",
                String.format("Your booking #%s was rejected. Reason: %s",
                        booking.getBookingNumber(), reason),
                bookingId);

        return toResponse(booking);
    }

    // ── CANCEL ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingDTO.Response cancelBooking(Long bookingId, Long userId) {
        Booking booking = getOrThrow(bookingId);

        boolean isAdminOrManager = userRepository.findById(userId)
                .map(u -> u.getRole() == User.Role.ADMIN || u.getRole() == User.Role.MANAGER)
                .orElse(false);

        if (!booking.getUserId().equals(userId) && !isAdminOrManager)
            throw new RuntimeException("Not authorized to cancel this booking");

        if (!"PENDING".equals(booking.getStatus()) && !"APPROVED".equals(booking.getStatus()))
            throw new RuntimeException("Cannot cancel a booking with status: " + booking.getStatus());

        String oldStatus = booking.getStatus();
        booking.setStatus("CANCELLED");
        booking.setCancelledBy(userId);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
        recordHistory(bookingId, "CANCELLED", userId, oldStatus, "CANCELLED", "Cancelled by user");

        // ── Notify the booking owner (if cancelled by admin/manager) ──
        boolean cancelledBySomeoneElse = !booking.getUserId().equals(userId);
        if (cancelledBySomeoneElse) {
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "the resource";
            notifyUser(booking.getUserId(), "BOOKING_CANCELLED",
                    "Booking Cancelled",
                    String.format("Your booking #%s for %s on %s has been cancelled by an administrator.",
                            booking.getBookingNumber(), resourceName, booking.getBookingDate()),
                    bookingId);
        }

        // ── Notify ADMIN + MANAGER when a user self-cancels ──
        if (!cancelledBySomeoneElse) {
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "unknown resource";
            try {
                notificationService.notifyByRoles(
                        List.of(User.Role.ADMIN, User.Role.MANAGER),
                        "BOOKING_CANCELLED",
                        "Booking Cancelled by User",
                        String.format("Booking #%s for %s on %s was cancelled by the requester.",
                                booking.getBookingNumber(), resourceName, booking.getBookingDate()),
                        "BOOKING", bookingId
                );
            } catch (Exception e) {
                log.warn("Failed to notify staff about cancellation: {}", e.getMessage());
            }
        }

        return toResponse(booking);
    }

    // ── READ ───────────────────────────────────────────────────────────────

    @Override
    public BookingDTO.Response getBookingById(Long bookingId, Long userId) {
        Booking booking = getOrThrow(bookingId);
        boolean isAdminOrManager = userRepository.findById(userId)
                .map(u -> u.getRole() == User.Role.ADMIN || u.getRole() == User.Role.MANAGER)
                .orElse(false);
        if (!booking.getUserId().equals(userId) && !isAdminOrManager)
            throw new RuntimeException("Not authorized to view this booking");
        return toResponse(booking);
    }

    @Override
    public Page<BookingDTO.Response> getMyBookings(Long userId, Pageable pageable) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Override
    public Page<BookingDTO.Response> getAllBookings(String status, Pageable pageable) {
        if (status != null && !status.isBlank())
            return bookingRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::toResponse);
        return bookingRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    // ── AVAILABILITY ───────────────────────────────────────────────────────

    @Override
    public List<BookingDTO.TimeSlot> getAvailableTimeSlots(Long resourceId, LocalDate date) {
        int dow = date.getDayOfWeek().getValue() - 1;
        List<AvailabilityWindow> windows =
                availabilityWindowRepository.findAvailabilityWindowsForDay(resourceId, dow);
        List<Booking> existingBookings =
                bookingRepository.findActiveBookingsForResourceOnDate(resourceId, date);

        List<BookingDTO.TimeSlot> slots = new ArrayList<>();
        for (AvailabilityWindow window : windows) {
            LocalTime current = window.getStartTime();
            while (!current.plusMinutes(30).isAfter(window.getEndTime())) {
                final LocalTime slotStart = current;
                final LocalTime slotEnd = current.plusMinutes(30);
                boolean booked = existingBookings.stream().anyMatch(b ->
                        b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart));
                slots.add(new BookingDTO.TimeSlot(slotStart, slotEnd, !booked));
                current = slotEnd;
            }
        }
        return slots;
    }

    @Override
    public boolean checkConflict(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return !bookingRepository.findConflictingBookings(
                resourceId, date, startTime, endTime, List.of("PENDING", "APPROVED")).isEmpty();
    }

    // ── HELPERS ────────────────────────────────────────────────────────────

    private Booking getOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    private void recordHistory(Long bookingId, String action, Long performedBy,
                               String oldStatus, String newStatus, String remarks) {
        historyRepository.save(BookingHistory.builder()
                .bookingId(bookingId).action(action).performedBy(performedBy)
                .oldStatus(oldStatus).newStatus(newStatus).remarks(remarks)
                .build());
    }

    private void notifyUser(Long userId, String type, String title, String message, Long entityId) {
        try {
            notificationService.createNotification(userId, type, title, message, "BOOKING", entityId);
        } catch (Exception e) {
            log.warn("Failed to send booking notification: {}", e.getMessage());
        }
    }

    private String generateBookingNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "BKG-" + datePart + "-" + random;
    }

    private BookingDTO.Response toResponse(Booking b) {
        BookingDTO.Response r = new BookingDTO.Response();
        r.setId(b.getId());
        r.setBookingNumber(b.getBookingNumber());
        r.setUserId(b.getUserId());
        r.setResourceId(b.getResourceId());
        r.setBookingDate(b.getBookingDate());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setPurpose(b.getPurpose());
        r.setExpectedAttendees(b.getExpectedAttendees());
        r.setStatus(b.getStatus());
        r.setRejectionReason(b.getRejectionReason());
        r.setApprovedBy(b.getApprovedBy());
        r.setApprovedAt(b.getApprovedAt());
        r.setCreatedAt(b.getCreatedAt());
        r.setUpdatedAt(b.getUpdatedAt());

        userRepository.findById(b.getUserId()).ifPresent(u -> {
            r.setUserName(u.getName());
            r.setUserEmail(u.getEmail());
        });
        resourceRepository.findById(b.getResourceId()).ifPresent(res -> {
            r.setResourceName(res.getName());
            r.setResourceLocation(res.getLocation());
        });
        if (b.getApprovedBy() != null)
            userRepository.findById(b.getApprovedBy()).ifPresent(u -> r.setApprovedByName(u.getName()));

        return r;
    }

    // ── DELETE (hard delete, admin only) ───────────────────────────────────────

    @Override
    @Transactional
    public void deleteBooking(Long bookingId, Long adminId) {
        Booking booking = getOrThrow(bookingId);

        // Only allow deleting cancelled/rejected bookings to prevent data loss
        if (!"CANCELLED".equals(booking.getStatus()) && !"REJECTED".equals(booking.getStatus())) {
            throw new RuntimeException(
                    "Only CANCELLED or REJECTED bookings can be deleted. " +
                            "Cancel the booking first before deleting.");
        }

        // Notify the booking owner before deleting
        try {
            notificationService.createNotification(
                    booking.getUserId(),
                    "BOOKING_DELETED",
                    "Booking Record Removed",
                    String.format("Your booking #%s has been permanently removed by an administrator.",
                            booking.getBookingNumber()),
                    "BOOKING", bookingId
            );
        } catch (Exception e) {
            log.warn("Failed to notify user about booking deletion: {}", e.getMessage());
        }

        historyRepository.deleteByBookingId(bookingId);
        bookingRepository.delete(booking);
    }
}
