package com.smartcampus.modules.auth.service;

import com.smartcampus.modules.auth.dto.AuthDTOs;
import com.smartcampus.modules.auth.entity.RefreshToken;
import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.entity.UserPreferences;
import com.smartcampus.modules.auth.repository.RefreshTokenRepository;
import com.smartcampus.modules.auth.repository.UserPreferencesRepository;
import com.smartcampus.modules.auth.repository.UserRepository;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthDTOs.AuthResponse signup(AuthDTOs.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .provider("LOCAL")
            .role(User.Role.USER)
            .isActive(true)
            .build();

        user = userRepository.save(user);

        // Create default preferences
        UserPreferences prefs = UserPreferences.builder()
            .userId(user.getId())
            .emailNotifications(true)
            .inAppNotifications(true)
            .bookingUpdates(true)
            .ticketUpdates(true)
            .build();
        preferencesRepository.save(prefs);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthDTOs.AuthResponse(
            accessToken,
            refreshToken.getToken(),
            AuthDTOs.UserDTO.fromEntity(user)
        );
    }

    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthDTOs.AuthResponse(
            accessToken,
            refreshToken.getToken(),
            AuthDTOs.UserDTO.fromEntity(user)
        );
    }

    @Transactional
    public AuthDTOs.TokenResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token has expired");
        }

        User user = userRepository.findById(refreshToken.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = tokenProvider.generateTokenFromUserId(
            user.getId(), user.getEmail(), user.getName(), user.getRole().name()
        );

        return new AuthDTOs.TokenResponse(newAccessToken);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    public AuthDTOs.UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthDTOs.UserDTO.fromEntity(user);
    }

    public List<AuthDTOs.UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(AuthDTOs.UserDTO::fromEntity)
            .toList();
    }

    @Transactional
    public AuthDTOs.UserDTO updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(User.Role.valueOf(role));
        return AuthDTOs.UserDTO.fromEntity(userRepository.save(user));
    }
}
