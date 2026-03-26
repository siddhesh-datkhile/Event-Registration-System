package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.dto.RegistrationRequest;
import com.ers.registration.registration_service.dto.RegistrationResponse;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;
import com.ers.registration.registration_service.exception.DuplicateRegistrationException;
import com.ers.registration.registration_service.exception.EventFullException;
import com.ers.registration.registration_service.exception.EventNotFoundException;
import com.ers.registration.registration_service.repository.RegistrationRepository;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventClient eventClient;

    @Override
    public RegistrationResponse register(RegistrationRequest request, Long userId) {
        log.info("Processing registration for user ID: {} to event ID: {}", userId, request.getEventId());

        // 1. Check for duplicate registration
        if (registrationRepository.existsByUserIdAndEventId(userId, request.getEventId())) {
            log.warn("Duplicate registration attempt: user ID {} is already registered for event ID {}", userId,
                    request.getEventId());
            throw new DuplicateRegistrationException("User is already registered for this event.");
        }

        // 2. Fetch event context to ensure it exists
        EventDto event;
        try {
            log.debug("Fetching event details from event-service for event ID: {}", request.getEventId());
            event = eventClient.getEventById(request.getEventId());
        } catch (FeignException.NotFound ex) {
            log.error("Event not found in event-service for ID: {}", request.getEventId());
            throw new EventNotFoundException("Event not found with id: " + request.getEventId());
        } catch (feign.RetryableException ex) {
            log.error("Timeout or connection error communicating with event-service: {}", ex.getMessage());
            throw new RuntimeException("Event service is currently unavailable. Please try again later.", ex);
        } catch (FeignException.ServiceUnavailable | FeignException.GatewayTimeout ex) {
            log.error("Event service is unavailable or timed out: {}", ex.getMessage());
            throw new RuntimeException("Event service is currently unavailable. Please try again later.", ex);
        } catch (FeignException ex) {
            log.error("Failed to communicate with event-service for event ID: {}. Status: {}", request.getEventId(),
                    ex.status());
            throw new RuntimeException("Error communicating with event service", ex);
        }

        if (event == null) {
            log.error("event-service returned null for event ID: {}", request.getEventId());
            throw new EventNotFoundException("Event not found with id: " + request.getEventId());
        }

        // Validate event is not closed
        if ("CLOSED".equalsIgnoreCase(event.getStatus())) {
            log.warn("Registration attempt failed: Event ID {} is CLOSED", request.getEventId());
            throw new RuntimeException("Registration failed: Event is closed.");
        }

        // 3. Reserve seat in Event Service
        try {
            log.debug("Reserving seat in event-service for event ID: {}", request.getEventId());
            eventClient.reserveSeat(request.getEventId());
        } catch (FeignException.BadRequest | FeignException.Conflict ex) {
            log.warn("Seat reservation failed for event ID: {} - event is fully booked", request.getEventId());
            throw new EventFullException("Event is fully booked.");
        } catch (feign.RetryableException ex) {
            log.error("Timeout or connection error while reserving seat for event ID: {}", request.getEventId(), ex);
            throw new RuntimeException("Event service is currently unavailable. Please try again later.", ex);
        } catch (FeignException.ServiceUnavailable | FeignException.GatewayTimeout ex) {
            log.error("Event service is unavailable or timed out while reserving seat for event ID: {}",
                    request.getEventId(), ex);
            throw new RuntimeException("Event service is currently unavailable. Please try again later.", ex);
        } catch (FeignException.InternalServerError ex) {
            log.error("Event service experienced an internal error while reserving seat for event ID: {}",
                    request.getEventId(), ex);
            throw new RuntimeException("Event service experienced an internal error. Please try again later.", ex);
        } catch (FeignException ex) {
            if (ex.status() == 400 || ex.status() == 409) {
                log.warn("Seat reservation failed for event ID: {} with status: {}", request.getEventId(), ex.status());
                throw new EventFullException("Event is fully booked or unavailable.");
            }
            log.error("Unexpected error reserving seat for event ID: {}", request.getEventId(), ex);
            throw new RuntimeException("Error reserving seat", ex);
        }

        // 4. Save registration
        Registration registration = Registration.builder()
                .userId(userId)
                .eventId(request.getEventId())
                .status(RegistrationStatus.PENDING)
                .build();

        Registration savedRegistration = registrationRepository.save(registration);
        log.info("Registration created successfully with ID: {} for user ID: {}, event ID: {}",
                savedRegistration.getId(), userId, request.getEventId());

        // 5. Build and return response
        RegistrationResponse response = new RegistrationResponse();
        response.setId(savedRegistration.getId());
        response.setUserId(savedRegistration.getUserId());
        response.setEventId(savedRegistration.getEventId());
        response.setRegistrationDate(savedRegistration.getCreatedAt());
        response.setStatus(savedRegistration.getStatus());

        return response;
    }

    @Override
    public RegistrationResponse cancelRegistration(Long registrationId) {
        log.info("Cancelling registration with ID: {}", registrationId);
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> {
                    log.error("Cannot cancel: Registration not found with ID: {}", registrationId);
                    return new RuntimeException("Registration not found with id: " + registrationId);
                });

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            log.warn("Registration ID: {} is already cancelled", registrationId);
            throw new RuntimeException("Registration is already cancelled.");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        Registration savedRegistration = registrationRepository.save(registration);
        log.info("Registration ID: {} marked as CANCELLED", registrationId);

        try {
            log.debug("Releasing seat in event-service for event ID: {}", registration.getEventId());
            eventClient.releaseSeat(registration.getEventId());
            log.info("Seat released in event-service for event ID: {}", registration.getEventId());
        } catch (feign.RetryableException ex) {
            log.error("Timeout or connection error while releasing seat for event ID: {}", registration.getEventId(),
                    ex);
            throw new RuntimeException("Event service is currently unavailable. Please try again later.", ex);
        } catch (FeignException.ServiceUnavailable | FeignException.GatewayTimeout
                | FeignException.InternalServerError ex) {
            log.error("Event service is unavailable or timed out while releasing seat for event ID: {}",
                    registration.getEventId(), ex);
            throw new RuntimeException(
                    "Event service is currently unavailable or experienced an error. Please try again later.", ex);
        } catch (FeignException ex) {
            log.error("Failed to release seat in event-service for event ID: {}", registration.getEventId(), ex);
            throw new RuntimeException("Failed to release seat on event-service.", ex);
        } catch (Exception ex) {
            log.error("Unexpected error while releasing seat in event-service for event ID: {}",
                    registration.getEventId(), ex);
            throw new RuntimeException("Failed to release seat on event-service.", ex);
        }

        RegistrationResponse response = new RegistrationResponse();
        response.setId(savedRegistration.getId());
        response.setUserId(savedRegistration.getUserId());
        response.setEventId(savedRegistration.getEventId());
        response.setRegistrationDate(savedRegistration.getCreatedAt());
        response.setStatus(savedRegistration.getStatus());

        return response;
    }
}
