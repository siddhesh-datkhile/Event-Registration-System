package com.ers.event.event_service.service;

import com.ers.event.event_service.dto.EventCreateRequest;
import com.ers.event.event_service.dto.EventResponse;
import com.ers.event.event_service.dto.EventUpdateRequest;
import com.ers.event.event_service.enities.Event;
import com.ers.event.event_service.enities.EventStatus;
import com.ers.event.event_service.enities.Venue;
import com.ers.event.event_service.exception.ResourceNotFoundException;
import com.ers.event.event_service.repository.EventRepository;
import com.ers.event.event_service.repository.VenueRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    @Override
    public EventResponse createEvent(EventCreateRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setEntryFee(request.getEntryFee());
        event.setCapacity(request.getCapacity());
        event.setAvailableSeats(request.getCapacity());
        event.setStatus(request.getStatus() != null ? request.getStatus() : EventStatus.OPEN);
        event.setOrganizerId(request.getOrganizerId());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
            event.setVenue(venue);
        }

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Override
    public EventResponse updateEvent(Long id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (request.getTitle() != null)
            event.setTitle(request.getTitle());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (request.getEventDate() != null)
            event.setEventDate(request.getEventDate());
        if (request.getEntryFee() != null)
            event.setEntryFee(request.getEntryFee());
        if (request.getCapacity() != null)
            event.setCapacity(request.getCapacity());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
            event.setVenue(venue);
        }

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        eventRepository.delete(event);
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return mapToResponse(event);
    }

    @Override
    public EventResponse changeEventStatus(Long id, EventStatus status) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        event.setStatus(status);
        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    public void reserveSeat(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        if (event.getStatus() != EventStatus.OPEN) {
            throw new IllegalArgumentException("Event is not open for booking.");
        }
        
        if (event.getAvailableSeats() == null) {
            event.setAvailableSeats(event.getCapacity());
        }
        if (event.getAvailableSeats() <= 0) {
            throw new IllegalArgumentException("No available seats for this event.");
        }
        event.setAvailableSeats(event.getAvailableSeats() - 1);
        eventRepository.save(event);
    }

    @Override
    public void releaseSeat(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.getAvailableSeats() == null) {
            event.setAvailableSeats(event.getCapacity());
        }
        if (event.getCapacity() != null && event.getAvailableSeats() < event.getCapacity()) {
            event.setAvailableSeats(event.getAvailableSeats() + 1);
            eventRepository.save(event);
        }
    }

    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setEventDate(event.getEventDate());
        response.setEntryFee(event.getEntryFee());
        response.setCapacity(event.getCapacity());
        response.setAvailableSeats(event.getAvailableSeats());
        response.setStatus(event.getStatus());
        response.setOrganizerId(event.getOrganizerId());
        if (event.getVenue() != null) {
            response.setVenueId(event.getVenue().getId());
        }
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        return response;
    }

}
