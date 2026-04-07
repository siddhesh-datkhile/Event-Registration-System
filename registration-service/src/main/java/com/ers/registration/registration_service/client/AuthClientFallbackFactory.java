package com.ers.registration.registration_service.client;

import com.ers.registration.registration_service.dto.UserDto;
import com.ers.registration.registration_service.exception.ServiceUnavailableException;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class AuthClientFallbackFactory implements FallbackFactory<AuthClient> {

    @Override
    public AuthClient create(Throwable cause) {
        return new AuthClient() {
            @Override
            public UserDto getUserById(Long id) {
                throw new ServiceUnavailableException("Auth Service is currently unavailable. " + cause.getMessage(), cause);
            }
        };
    }
}
