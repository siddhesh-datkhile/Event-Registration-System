package com.ers.auth.dtos;

import com.ers.auth.Entity.Role;
import com.ers.auth.Entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegistrantResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
}
