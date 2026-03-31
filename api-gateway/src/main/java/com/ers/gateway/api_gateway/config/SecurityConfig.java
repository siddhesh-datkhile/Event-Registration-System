package com.ers.gateway.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

        @org.springframework.beans.factory.annotation.Autowired
        private com.ers.gateway.api_gateway.filter.JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
                return http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .addFilterAt(jwtAuthenticationFilter,
                                                org.springframework.security.config.web.server.SecurityWebFiltersOrder.AUTHENTICATION)
                                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                                .httpBasic(httpBasic -> httpBasic.disable())
                                .formLogin(form -> form.disable())
                                .authorizeExchange(exchanges -> exchanges
                                                .pathMatchers(
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // ── Public: No token required ─────────────────────────────
                                                .pathMatchers("/api/auth/**").permitAll()
                                                .pathMatchers("/api/payments/webhook").permitAll()
                                                // ── Admin: Full access to user management ─────────────────
                                                // Admin creates/manages organizers and registrants
                                                .pathMatchers("/api/admin/**").hasRole("ADMIN")

                                                // ── Events: Organizer CRUD, Admin full access ─────────────
                                                // Organizers and Admin can create/update/delete events
                                                .pathMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/events/**")
                                                .hasAnyRole("ORGANIZER", "ADMIN")
                                                .pathMatchers(org.springframework.http.HttpMethod.PUT, "/api/events/**")
                                                .hasAnyRole("ORGANIZER", "ADMIN")
                                                .pathMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/events/**")
                                                .hasAnyRole("ORGANIZER", "ADMIN")
                                                .pathMatchers(org.springframework.http.HttpMethod.PATCH,
                                                                "/api/events/**")
                                                .hasAnyRole("ORGANIZER", "ADMIN")

                                                // Anyone authenticated can search/filter/view events
                                                .pathMatchers(org.springframework.http.HttpMethod.GET, "/api/events/**")
                                                .permitAll()

                                                // ── Registration: Registrant can register, Organizer can view event registrants ───────
                                                .pathMatchers(org.springframework.http.HttpMethod.GET, "/api/registrations/event/**").hasAnyRole("ORGANIZER", "ADMIN")
                                                .pathMatchers("/api/registrations/**").hasAnyRole("REGISTRANT", "ADMIN")

                                                // ── Payments: Registrant pays and prints receipts ──────────
                                                .pathMatchers("/api/payments/**").hasAnyRole("REGISTRANT", "ADMIN")
                                                .pathMatchers("/api/receipts/**").hasAnyRole("REGISTRANT", "ADMIN")

                                                // ── Profile: Any authenticated user ───────────────────────
                                                .pathMatchers("/user/**").hasAnyRole("ORGANIZER", "REGISTRANT", "ADMIN")

                                                // ── All other requests require authentication ──────────────
                                                .anyExchange().authenticated())
                                // JWT GlobalFilter manages the SecurityContext — no sessions needed
                                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                                .build();
        }
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                                "http://localhost:5173",   // Vite dev server
                                "http://localhost:3000"    // CRA / other dev servers
                ));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
