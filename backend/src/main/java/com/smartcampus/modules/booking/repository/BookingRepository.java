package com.smartcampus.modules.booking.repository;

import com.smartcampus.modules.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Conflict detection: overlapping bookings for same resource/date with active statuses
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("statuses") List<String> statuses
    );

    // User's own bookings
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    // All bookings for admin
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // By status
    Page<Booking> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    // Bookings for a resource on a specific date (for calendar)
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date AND b.status IN ('PENDING','APPROVED')")
    List<Booking> findActiveBookingsForResourceOnDate(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date
    );

    // Count by user and status
    long countByUserIdAndStatus(Long userId, String status);

    // Upcoming bookings for a user
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId " +
           "AND b.bookingDate >= :today AND b.status = 'APPROVED' " +
           "ORDER BY b.bookingDate ASC, b.startTime ASC")
    List<Booking> findUpcomingApprovedByUser(
        @Param("userId") Long userId,
        @Param("today") LocalDate today
    );
}
