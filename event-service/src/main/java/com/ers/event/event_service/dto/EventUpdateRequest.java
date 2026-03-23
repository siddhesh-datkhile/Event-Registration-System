package com.ers.event.event_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventUpdateRequest {
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Double entryFee;
    private Integer capacity;
    private Long venueId;
}
