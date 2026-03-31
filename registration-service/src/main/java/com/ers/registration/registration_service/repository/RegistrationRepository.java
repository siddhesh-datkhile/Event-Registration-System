package com.ers.registration.registration_service.repository;

import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    boolean existsByUserIdAndEventIdAndStatusNot(Long userId, Long eventId, RegistrationStatus status);

    java.util.Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);

    long countByEventId(Long eventId);

    List<Registration> findByUserId(Long userId);

    List<Registration> findByUserIdAndStatus(Long userId, RegistrationStatus status);

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByStatusAndCreatedAtBefore(RegistrationStatus status, java.time.LocalDateTime dateTime);
}
