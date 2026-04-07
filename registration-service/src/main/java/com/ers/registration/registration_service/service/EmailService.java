package com.ers.registration.registration_service.service;

public interface EmailService {
    void sendRegistrationConfirmationEmail(Long registrationId);
}