package com.ers.registration.registration_service.client;

import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.exception.ServiceUnavailableException;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class EventClientFallbackFactory implements FallbackFactory<EventClient> {
    
    @Override
    public EventClient create(Throwable cause) {
        return new EventClient() {
            @Override
            public EventDto getEventById(Long id) {
                throw new ServiceUnavailableException("Event Service is currently unavailable. " + cause.getMessage(), cause);
            }

            @Override
            public void reserveSeat(Long id) {
                throw new ServiceUnavailableException("Event Service is currently unavailable. Could not reserve seat. " + cause.getMessage(), cause);
            }

            @Override
            public void releaseSeat(Long id) {
                throw new ServiceUnavailableException("Event Service is currently unavailable. Could not release seat. " + cause.getMessage(), cause);
            }
        };
    }
}
