package com.smartcampus.modules.booking.service;

import com.smartcampus.modules.booking.entity.Booking;
import com.smartcampus.modules.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repo;

    public BookingService(BookingRepository repo) {
        this.repo = repo;
    }

    public Booking createBooking(Booking booking) {

        List<Booking> existing = repo.findByResourceNameAndDate(
                booking.getResourceName(),
                booking.getDate()
        );

        for (Booking b : existing) {
            if (booking.getStartTime().isBefore(b.getEndTime()) &&
                    booking.getEndTime().isAfter(b.getStartTime())) {

                throw new RuntimeException("Time slot already booked!");
            }
        }

        booking.setStatus("PENDING");
        return repo.save(booking);
    }

    public List<Booking> getAll() {
        return repo.findAll();
    }

    public Booking updateStatus(Long id, String status) {
        Booking b = repo.findById(id).orElseThrow();
        b.setStatus(status);
        return repo.save(b);
    }
}