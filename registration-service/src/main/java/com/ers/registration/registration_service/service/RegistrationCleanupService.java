package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;
import com.ers.registration.registration_service.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationCleanupService {

    private final RegistrationRepository registrationRepository;
    private final EventClient eventClient;

    // Run every minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredRegistrations() {
        // Find registrations that have been PENDING for more than 15 minutes
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        
        List<Registration> expiredRegistrations = registrationRepository
                .findByStatusAndCreatedAtBefore(RegistrationStatus.PENDING, cutoffTime);
                
        if (!expiredRegistrations.isEmpty()) {
            log.info("Found {} expired PENDING registrations. Processing cleanup...", expiredRegistrations.size());
            
            for (Registration registration : expiredRegistrations) {
                try {
                    // 1. Mark as cancelled
                    registration.setStatus(RegistrationStatus.CANCELLED);
                    registrationRepository.save(registration);
                    
                    // 2. Release seat in event-service
                    eventClient.releaseSeat(registration.getEventId());
                    log.info("Successfully cancelled registration ID: {} and released seat for event ID: {}", 
                            registration.getId(), registration.getEventId());
                } catch (Exception e) {
                    log.error("Failed to cleanup registration ID: {}", registration.getId(), e);
                    // It will be retried next time if save failed, 
                    // or if releaseSeat failed we might need a dead-letter queue in a real production system.
                }
            }
        }
    }
}
