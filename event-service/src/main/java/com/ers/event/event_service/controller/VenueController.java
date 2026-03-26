package com.ers.event.event_service.controller;

import com.ers.event.event_service.dto.VenueCreateRequest;
import com.ers.event.event_service.dto.VenueResponse;
import com.ers.event.event_service.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@RequestBody VenueCreateRequest request) {
        VenueResponse response = venueService.createVenue(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllVenues() {
        List<VenueResponse> venues = venueService.getAllVenues();
        return ResponseEntity.ok(venues);
    }
}
