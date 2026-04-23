package com.smartcampus.modules.booking.service;

import com.smartcampus.modules.booking.dto.BookingDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingDTO.Response createBooking(BookingDTO.CreateRequest request, Long userId);

    BookingDTO.Response approveBooking(Long bookingId, Long adminId, String remarks);

    BookingDTO.Response rejectBooking(Long bookingId, Long adminId, String reason);

    BookingDTO.Response cancelBooking(Long bookingId, Long userId);

    void deleteBooking(Long bookingId, Long userId);

    BookingDTO.Response getBookingById(Long bookingId, Long userId);

    Page<BookingDTO.Response> getMyBookings(Long userId, Pageable pageable);

    Page<BookingDTO.Response> getAllBookings(String status, Pageable pageable);

    List<BookingDTO.TimeSlot> getAvailableTimeSlots(Long resourceId, LocalDate date);

    boolean checkConflict(Long resourceId, LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime);
}
