package com.ers.event.event_service.dto;

import lombok.Data;

@Data
public class VenueCreateRequest {
    private String name;
    private String address;
    private String city;
}
