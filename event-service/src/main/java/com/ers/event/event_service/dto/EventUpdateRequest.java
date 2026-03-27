package com.ers.event.event_service.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventUpdateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDate;

    @PositiveOrZero(message = "Entry fee must be zero or positive")
    private Double entryFee;

    @Positive(message = "Capacity must be greater than zero")
    private Integer capacity;

    @NotNull(message = "Venue ID is required")
    private Long venueId;
}
