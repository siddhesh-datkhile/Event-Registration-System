package com.ers.auth.dtos;

import com.ers.auth.entity.Role;
import com.ers.auth.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // not using Data for concern of immutability
public class OrganizerResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
}
