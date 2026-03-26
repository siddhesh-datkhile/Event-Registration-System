package com.ers.registration.registration_service.dto;

import lombok.Data;

@Data
public class EventDto {
    private Long id;
    private String title;
    private Integer capacity;
    private Double entryFee;
    private Integer availableSeats;
    private String status;
}
