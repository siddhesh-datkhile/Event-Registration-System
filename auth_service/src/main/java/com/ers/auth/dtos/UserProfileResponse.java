package com.ers.auth.dtos;

import com.ers.auth.Entity.Role;
import com.ers.auth.Entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private String phone;
    private String address;
    private LocalDate dob;
}
