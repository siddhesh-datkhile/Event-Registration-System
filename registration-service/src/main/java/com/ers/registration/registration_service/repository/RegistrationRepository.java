package com.ers.registration.registration_service.repository;

import com.ers.registration.registration_service.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    long countByEventId(Long eventId);
    
    List<Registration> findByUserId(Long userId);
    
    List<Registration> findByEventId(Long eventId);
    
    List<Registration> findByStatusAndCreatedAtBefore(com.ers.registration.registration_service.entity.RegistrationStatus status, java.time.LocalDateTime dateTime);
}
