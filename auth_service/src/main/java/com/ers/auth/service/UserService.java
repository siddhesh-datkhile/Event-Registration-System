package com.ers.auth.service;

import com.ers.auth.entity.User;
import com.ers.auth.dtos.OrganizerRequest;
import com.ers.auth.dtos.OrganizerResponse;
import com.ers.auth.dtos.RegistrantRequest;
import com.ers.auth.dtos.RegistrantResponse;
import com.ers.auth.dtos.RegisterRequest;
import com.ers.auth.dtos.UpdateProfileRequest;
import com.ers.auth.dtos.UserProfileResponse;

public interface UserService {

    User getUserByEmail(String email);

    OrganizerResponse createOrganizer(OrganizerRequest request);

    RegistrantResponse createRegistrant(RegistrantRequest request);

    UserProfileResponse register(RegisterRequest request);

    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
