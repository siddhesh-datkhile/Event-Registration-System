package com.ers.auth.dtos;

import com.ers.auth.entity.Role;
import com.ers.auth.entity.UserStatus;
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
