package com.smartcampus.modules.booking.repository;

import com.smartcampus.modules.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByResourceNameAndDate(
            String resourceName,
            LocalDate date
    );
}