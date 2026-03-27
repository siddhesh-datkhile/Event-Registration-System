package com.ers.event.event_service.dto;

import com.ers.event.event_service.enities.EventStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDate;

    @NotNull(message = "Entry fee is required")
    @PositiveOrZero(message = "Entry fee must be zero or positive")
    private Double entryFee;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than zero")
    private Integer capacity;

    @NotNull(message = "Status is required")
    private EventStatus status;

    @NotNull(message = "Organizer ID is required")
    private Long organizerId;

    @NotNull(message = "Venue ID is required")
    private Long venueId;
}
