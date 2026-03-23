package com.ers.event.event_service.service;

import com.ers.event.event_service.dto.VenueCreateRequest;
import com.ers.event.event_service.dto.VenueResponse;

import java.util.List;

public interface VenueService {
    VenueResponse createVenue(VenueCreateRequest request);
    List<VenueResponse> getAllVenues();
}
