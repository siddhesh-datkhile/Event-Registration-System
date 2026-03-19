package com.ers.auth.service;

import com.ers.auth.Entity.User;
import com.ers.auth.dtos.OrganizerRequest;
import com.ers.auth.dtos.OrganizerResponse;
import com.ers.auth.dtos.RegistrantRequest;
import com.ers.auth.dtos.RegistrantResponse;

public interface UserService {

    User getUserByEmail(String email);

    OrganizerResponse createOrganizer(OrganizerRequest request);

    RegistrantResponse createRegistrant(RegistrantRequest request);
}
