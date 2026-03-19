# Walkthrough: API Endpoints Implementation

## Goal
The goal of these tasks were to implement the `POST /admin/registrants` API logic for administrators and the `GET /user/profile` API endpoint for authenticated users, completing the necessary DTOs, controllers, and service implementations.

## 1. POST /admin/registrants Endpoint Implementation
Administrators can now add users with the `REGISTRANT` role to the Event Registration System.

1.  **Created Data Transfer Objects (DTOs)**:
    *   [RegistrantRequest](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/RegistrantRequest.java#5-10): Defines the expected incoming JSON payload (name, email) for registration.
    *   [RegistrantResponse](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/RegistrantResponse.java#8-17): Defines the outgoing response payload (id, name, email, role, status).
2.  **Updated [UserService](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/service/UserService.java#9-17) and [UserServiceImpl](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/service/UserServiceImpl.java#18-91)**:
    *   Added the [createRegistrant](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/service/UserService.java#15-16) method to the [UserService](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/service/UserService.java#9-17) interface and implemented the business logic in [UserServiceImpl](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/service/UserServiceImpl.java#18-91).
    *   The implementation creates a new [User](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/Entity/User.java#15-92) entity, assigning the `REGISTRANT` role and setting an initial dummy password (`registrant@123`), which is encoded via `PasswordEncoder`.
3.  **Updated [AdminController](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/controller/AdminController.java#15-38)**:
    *   Implemented `POST /admin/registrants` to accept a [RegistrantRequest](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/RegistrantRequest.java#5-10), call the new `UserService.createRegistrant` method, and return the saved [RegistrantResponse](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/RegistrantResponse.java#8-17) with a `201 Created` HTTP status.

## 2. GET /user/profile Endpoint Implementation
Authenticated users can now retrieve their own profiles using their JWT tokens.

1.  **Created [UserProfileResponse](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/UserProfileResponse.java#8-17) DTO**: Returned by the API, containing `id`, [name](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/Entity/User.java#61-65), `email`, `role`, and `status`.
2.  **Created `UserProfileController`**:
    *   Mapped to `/user/profile` with `@GetMapping`.
    *   Extracts the user's `Authentication` object from `SecurityContextHolder.getContext().getAuthentication()`.
    *   Leverages the existing `UserService.getUserByEmail` to fetch the complete user entity using the email extracted directly from the authenticated principal details (populated by the [JwtFilter](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/JwtFilter.java#19-72)).
    *   Constructs and returns a mapped [UserProfileResponse](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/dtos/UserProfileResponse.java#8-17) ensuring security and separation of concerns.
3.  **Fixed Authorization Context Issue in [SecurityConfig](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/SecurityConfig.java#15-50)**:
    *   Discovered [JwtFilter](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/JwtFilter.java#19-72) was not registered explicitly in the Spring Security filter chain, causing tokens to be authenticated but then overwritten as `anonymousUser`.
    *   Added `.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)` to [SecurityConfig](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/SecurityConfig.java#15-50) to fix this 500 server error and securely propagate the principal to the controller.

## Verification
*   Compiled the project successfully using `mvn clean compile` ensuring all implementations are robust and syntactically correct.
*   Verified the logic perfectly adheres to the existing Security filter configurations ([JwtFilter](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/JwtFilter.java#19-72), [CustomUserDetailsService](file:///home/josh/IdeaProjects/event-Registration-System/auth_service/src/main/java/com/ers/auth/security/CustomUserDetailsService.java#16-43)).
