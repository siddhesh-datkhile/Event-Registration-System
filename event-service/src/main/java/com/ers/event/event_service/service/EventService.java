package com.ers.event.event_service.service;

import com.ers.event.event_service.dto.EventCreateRequest;
import com.ers.event.event_service.dto.EventResponse;
import com.ers.event.event_service.dto.EventUpdateRequest;
import com.ers.event.event_service.enities.EventStatus;

import java.util.List;

public interface EventService {
    EventResponse createEvent(EventCreateRequest request);
    EventResponse updateEvent(Long id, EventUpdateRequest request);
    void deleteEvent(Long id);
    List<EventResponse> getAllEvents();
    EventResponse getEventById(Long id);
    EventResponse changeEventStatus(Long id, EventStatus status);
}
