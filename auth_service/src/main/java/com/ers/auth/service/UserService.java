package com.ers.auth.service;

import com.ers.auth.Entity.User;

public interface UserService {

    User getUserByEmail(String email);
}
