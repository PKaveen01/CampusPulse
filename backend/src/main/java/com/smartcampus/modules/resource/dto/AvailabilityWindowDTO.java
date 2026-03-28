package com.smartcampus.modules.resource.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;

@Data
public class AvailabilityWindowDTO {

    private Long id;

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "Day of week is required")
    @Min(value = 0, message = "Day must be between 0 and 6")
    @Max(value = 6, message = "Day must be between 0 and 6")
    private Integer dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}