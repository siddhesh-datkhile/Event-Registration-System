package com.ers.gateway.api_gateway.filter;

import com.ers.gateway.api_gateway.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter, Ordered {

    private final JwtUtil jwtUtil;

    // Routes that do NOT require a JWT token
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip JWT validation for public routes
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Require Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);

        Claims claims;

        try {
            claims = jwtUtil.getClaims(token);
            System.out.println("VALID TOKEN ✅");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("INVALID TOKEN ❌");
            return unauthorized(exchange);
        }

        if (claims == null) {
            return unauthorized(exchange);
        }

        // Extract user info from JWT claims
        String email = claims.getSubject();
        List<String> roles = claims.get("roles", List.class);
        Object userIdObj = claims.get("userId");
        String userIdStr = userIdObj != null ? userIdObj.toString() : "";

        // Build authentication object (so Spring Security can enforce hasRole() rules)
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                email,
                null,
                roles.stream()
                        .map(role -> new SimpleGrantedAuthority(role))
                        .toList());

        // Forward user info as headers to downstream services
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Email", email)
                .header("X-User-Role", String.join(",", roles))
                .header("X-User-Id", userIdStr)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Run before all other filters (highest priority)
    }
}
