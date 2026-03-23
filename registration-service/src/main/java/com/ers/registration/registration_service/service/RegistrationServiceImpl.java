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
    public RegistrationResponse register(RegistrationRequest request) {
        // 1. Check for duplicate registration
        if (registrationRepository.existsByUserIdAndEventId(request.getUserId(), request.getEventId())) {
            throw new DuplicateRegistrationException("User is already registered for this event.");
        }

        // 2. Fetch event context to check capacity
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

        // 3. Check capacity against current registrations
        long currentRegistrations = registrationRepository.countByEventId(request.getEventId());
        if (event.getCapacity() != null && currentRegistrations >= event.getCapacity()) {
            throw new EventFullException("Event is fully booked. Capacity: " + event.getCapacity());
        }

        // 4. Save registration
        Registration registration = Registration.builder()
                .userId(request.getUserId())
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
}
