package com.smartcampus.modules.resource.repository;

import com.smartcampus.modules.resource.entity.AvailabilityWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailabilityWindowRepository extends JpaRepository<AvailabilityWindow, Long> {

    List<AvailabilityWindow> findByResourceId(Long resourceId);
    List<AvailabilityWindow> findByResourceIdAndDayOfWeek(Long resourceId, Integer dayOfWeek);
    void deleteByResourceId(Long resourceId);

    @Query("SELECT COUNT(a) > 0 FROM AvailabilityWindow a WHERE a.resourceId = :resourceId " +
            "AND a.dayOfWeek = :dayOfWeek AND a.startTime <= :endTime AND a.endTime >= :startTime")
    boolean isWithinAvailability(@Param("resourceId") Long resourceId,
                                 @Param("dayOfWeek") Integer dayOfWeek,
                                 @Param("startTime") LocalTime startTime,
                                 @Param("endTime") LocalTime endTime);
}