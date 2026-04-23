package com.smartcampus.modules.booking.repository;

import com.smartcampus.modules.booking.entity.BlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {
    boolean existsByResourceIdAndDate(Long resourceId, LocalDate date);
    boolean existsByResourceIdIsNullAndDate(LocalDate date);
}
