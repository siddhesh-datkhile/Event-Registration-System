package com.ers.event.event_service.dto;

import com.ers.event.event_service.enities.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Double entryFee;
    private Integer capacity;
    private EventStatus status;
    private Long organizerId;
    private Long venueId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
