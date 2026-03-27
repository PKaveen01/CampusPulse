package com.smartcampus.modules.auth.service;

import com.smartcampus.modules.auth.entity.RefreshToken;
import com.smartcampus.modules.auth.repository.RefreshTokenRepository;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private int refreshExpiration;

    private final RefreshTokenRepository refreshTokenRepository;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        return buildToken(userPrincipal.getId(), userPrincipal.getEmail(),
                userPrincipal.getName(), userPrincipal.getRole().name());
    }

    public String generateTokenFromUserId(Long userId, String email, String name, String role) {
        return buildToken(userId, email, name, role);
    }

    private String buildToken(Long userId, String email, String name, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(Long.toString(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("name", name)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    @Transactional
    public RefreshToken generateRefreshToken(Long userId) {
        try {
            // Remove old token - this needs a transaction
            refreshTokenRepository.deleteByUserId(userId);
            log.info("Deleted old refresh token for user: {}", userId);
        } catch (Exception e) {
            log.warn("No existing refresh token to delete for user: {}", userId);
        }

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("email", String.class);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}