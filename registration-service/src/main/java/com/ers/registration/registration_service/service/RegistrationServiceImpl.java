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
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventClient eventClient;

    @Override
    public RegistrationResponse register(RegistrationRequest request, Long userId) {
        // 1. Check for duplicate registration
        if (registrationRepository.existsByUserIdAndEventId(userId, request.getEventId())) {
            throw new DuplicateRegistrationException("User is already registered for this event.");
        }

        // 2. Fetch event context to ensure it exists
        EventDto event;
        try {
            event = eventClient.getEventById(request.getEventId());
        } catch (FeignException.NotFound ex) {
            throw new EventNotFoundException("Event not found with id: " + request.getEventId());
        } catch (FeignException ex) {
            throw new RuntimeException("Error communicating with event service", ex);
        }
        
        if (event == null) {
            throw new EventNotFoundException("Event not found with id: " + request.getEventId());
        }

        // 3. Reserve seat in Event Service
        try {
            eventClient.reserveSeat(request.getEventId());
        } catch (FeignException.BadRequest | FeignException.Conflict ex) {
            throw new EventFullException("Event is fully booked.");
        } catch (FeignException ex) {
            // Depending on how event-service returns the error when seats = 0 (could be 400 or 500)
            if (ex.status() == 400 || ex.status() == 409 || ex.status() == 500) {
                 throw new EventFullException("Event is fully booked or unavailable.");
            }
            throw new RuntimeException("Error reserving seat", ex);
        }

        // 4. Save registration
        Registration registration = Registration.builder()
                .userId(userId)
                .eventId(request.getEventId())
                .status(RegistrationStatus.PENDING)
                .build();
                
        Registration savedRegistration = registrationRepository.save(registration);

        // 5. Build and return response
        RegistrationResponse response = new RegistrationResponse();
        response.setId(savedRegistration.getId());
        response.setUserId(savedRegistration.getUserId());
        response.setEventId(savedRegistration.getEventId());
        response.setRegistrationDate(savedRegistration.getCreatedAt()); // Assuming mapped properly or created automatically
        response.setStatus(savedRegistration.getStatus());

        return response;
    }

    @Override
    public RegistrationResponse cancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with id: " + registrationId));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new RuntimeException("Registration is already cancelled.");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        Registration savedRegistration = registrationRepository.save(registration);

        try {
            eventClient.releaseSeat(registration.getEventId());
        } catch (Exception ex) {
            // Ideally should handle this with fallback/retry or log deeply if it fails
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
