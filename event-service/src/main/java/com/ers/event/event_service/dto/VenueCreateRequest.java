package com.ers.event.event_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VenueCreateRequest {

    @NotBlank(message = "Venue name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;
}
