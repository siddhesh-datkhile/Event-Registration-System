package com.ers.auth.security;

import java.security.Key;
import java.util.Date;
import java.util.List;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationMillis;

    private Key signingKey;

    @PostConstruct
    public void init() {
        signingKey = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // CREATE TOKEN
    public String createToken(Authentication authentication) {

        String username = authentication.getName(); // email / username

        String roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

//    // VALIDATE TOKEN
//    public Authentication validateToken(String token) {
//
//        try {
//            Claims claims = Jwts.parserBuilder()
//                    .setSigningKey(signingKey)
//                    .build()
//                    .parseClaimsJws(token)
//                    .getBody();
//
//            String username = claims.getSubject();
//            String roles = claims.get("roles", String.class);
//
//            List<GrantedAuthority> authorities =
//                    AuthorityUtils.commaSeparatedStringToAuthorityList(roles);
//
//            return new UsernamePasswordAuthenticationToken(
//                    username, null, authorities);
//
//        } catch (JwtException e) {
//            return null;
//        }
//    }

    public String extractUsername(String token) {

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();

        } catch (JwtException e) {
            return null;
        }
    }

}