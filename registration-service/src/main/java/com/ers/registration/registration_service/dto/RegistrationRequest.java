package com.ers.registration.registration_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationRequest {

    @NotNull(message = "User ID must not be null")
    private Long userId;

    @NotNull(message = "Event ID must not be null")
    private Long eventId;
}
