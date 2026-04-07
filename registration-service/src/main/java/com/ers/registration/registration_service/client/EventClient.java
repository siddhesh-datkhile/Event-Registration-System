package com.ers.registration.registration_service.client;

import com.ers.registration.registration_service.dto.EventDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "event-service", fallbackFactory = EventClientFallbackFactory.class)
public interface EventClient {

    @GetMapping("/api/events/{id}")
    EventDto getEventById(@PathVariable("id") Long id);

    @PostMapping("/api/events/{id}/reserve-seat")
    void reserveSeat(@PathVariable("id") Long id);

    @PostMapping("/api/events/{id}/release-seat")
    void releaseSeat(@PathVariable("id") Long id);
}
