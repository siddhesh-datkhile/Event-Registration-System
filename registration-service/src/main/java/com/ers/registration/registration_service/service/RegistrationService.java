package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.dto.RegistrationRequest;
import com.ers.registration.registration_service.dto.RegistrationResponse;

public interface RegistrationService {
    RegistrationResponse register(RegistrationRequest request, Long userId);
    RegistrationResponse cancelRegistration(Long registrationId);
}
