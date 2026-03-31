package com.ers.auth.controller;


import com.ers.auth.dtos.OrganizerRequest;
import com.ers.auth.dtos.OrganizerResponse;
import com.ers.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.ers.auth.dtos.UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/organizer")
    public ResponseEntity<?> addOrganizer(@Valid @RequestBody OrganizerRequest request) {

        OrganizerResponse organizerResponse = userService.createOrganizer(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(organizerResponse);
    }

    @PostMapping("/registrants")
    public ResponseEntity<?> addRegistrant(@Valid @RequestBody com.ers.auth.dtos.RegistrantRequest request) {

        com.ers.auth.dtos.RegistrantResponse registrantResponse = userService.createRegistrant(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(registrantResponse);
    }
}
