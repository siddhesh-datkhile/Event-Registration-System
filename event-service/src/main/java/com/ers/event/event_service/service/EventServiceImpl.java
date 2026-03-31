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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    @Override
    public EventResponse createEvent(EventCreateRequest request) {
        log.info("Creating event '{}' for organizer ID: {}", request.getTitle(), request.getOrganizerId());
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
                    .orElseThrow(() -> {
                        log.error("Venue not found with ID: {}", request.getVenueId());
                        return new ResourceNotFoundException("Venue not found");
                    });
            event.setVenue(venue);
        }

        Event savedEvent = eventRepository.save(event);
        log.info("Event created successfully with ID: {} and title: '{}'", savedEvent.getId(), savedEvent.getTitle());
        return mapToResponse(savedEvent);
    }

    @Override
    public EventResponse updateEvent(Long id, EventUpdateRequest request) {
        log.info("Updating event with ID: {}", id);
        Event event = eventRepository.findById(id).orElseThrow(() -> {
            log.error("Event not found with ID: {}", id);
            return new ResourceNotFoundException("Event not found");
        });

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
        log.info("Event updated successfully for ID: {}", updatedEvent.getId());
        return mapToResponse(updatedEvent);
    }

    @Override
    public void deleteEvent(Long id) {
        log.info("Deleting event with ID: {}", id);
        Event event = eventRepository.findById(id).orElseThrow(() -> {
            log.error("Cannot delete: Event not found with ID: {}", id);
            return new ResourceNotFoundException("Event not found");
        });
        eventRepository.delete(event);
        log.info("Event deleted successfully with ID: {}", id);
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
        log.info("Changing status of event ID: {} to {}", id, status);
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        event.setStatus(status);
        Event updatedEvent = eventRepository.save(event);
        log.info("Event ID: {} status changed to {}", id, status);
        return mapToResponse(updatedEvent);
    }

    @Override
    public void reserveSeat(Long id) {
        log.info("Reserving seat for event ID: {}", id);
        Event event = eventRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getStatus() != EventStatus.OPEN) {
            log.warn("Seat reservation failed for event ID: {} - Event is not OPEN (status: {})", id,
                    event.getStatus());
            throw new IllegalArgumentException("Event is not open for booking.");
        }

        if (event.getAvailableSeats() == null) {
            event.setAvailableSeats(event.getCapacity());
        }
        if (event.getAvailableSeats() == 0) {
            log.warn("Seat reservation failed for event ID: {} - No available seats", id);
            throw new IllegalArgumentException("No available seats for this event.");
        }
        event.setAvailableSeats(event.getAvailableSeats() - 1);

        if (event.getAvailableSeats() == 0) {
            log.info("Event ID: {} is now sold out. Changing status to CLOSED.", id);
            event.setStatus(EventStatus.CLOSED);
        }

        eventRepository.save(event);
        log.info("Seat reserved for event ID: {}. Remaining seats: {}", id, event.getAvailableSeats());
    }

    @Override
    public void releaseSeat(Long id) {
        log.info("Releasing seat for event ID: {}", id);
        Event event = eventRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.getAvailableSeats() == null) {
            event.setAvailableSeats(event.getCapacity());
        }
        if (event.getCapacity() != null && event.getAvailableSeats() < event.getCapacity()) {
            event.setAvailableSeats(event.getAvailableSeats() + 1);

            if (event.getAvailableSeats() > 0 && event.getStatus() == EventStatus.CLOSED) {
                log.info("Event ID: {} has available seats again. Changing status to OPEN.", id);
                event.setStatus(EventStatus.OPEN);
            }

            eventRepository.save(event);
            log.info("Seat released for event ID: {}. Available seats: {}", id, event.getAvailableSeats());
        } else {
            log.warn("Release skipped for event ID: {} - seats already at full capacity", id);
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
