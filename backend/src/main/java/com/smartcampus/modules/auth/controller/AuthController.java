package com.smartcampus.modules.auth.controller;

import com.smartcampus.modules.auth.dto.AuthDTOs;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.auth.service.UserService;
import com.smartcampus.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> signup(
            @Valid @RequestBody AuthDTOs.SignupRequest request) {
        AuthDTOs.AuthResponse response = userService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthDTOs.TokenResponse>> refreshToken(
            @RequestBody AuthDTOs.RefreshTokenRequest request) {
        AuthDTOs.TokenResponse response = userService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.logout(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTOs.UserDTO>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        AuthDTOs.UserDTO user = userService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User fetched", user));
    }
}
