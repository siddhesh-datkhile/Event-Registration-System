package com.ers.registration.registration_service.client;

import com.ers.registration.registration_service.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", fallbackFactory = AuthClientFallbackFactory.class)
public interface AuthClient {

    @GetMapping("/api/auth/user/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}