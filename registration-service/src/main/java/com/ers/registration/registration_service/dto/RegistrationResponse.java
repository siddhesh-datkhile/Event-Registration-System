package com.ers.registration.registration_service.dto;

import com.ers.registration.registration_service.entity.RegistrationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistrationResponse {
    private Long id;
    private Long userId;
    private Long eventId;
    private LocalDateTime registrationDate;
    private RegistrationStatus status;
}
