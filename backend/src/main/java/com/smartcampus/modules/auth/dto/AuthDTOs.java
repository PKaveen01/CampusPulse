package com.smartcampus.modules.auth.dto;

import com.smartcampus.modules.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

public class AuthDTOs {

    @Data
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private UserDTO user;

        public AuthResponse(String accessToken, String refreshToken, UserDTO user) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.user = user;
        }
    }

    @Data
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
        private String avatarUrl;
        private String role;
        private Boolean isActive;
        // Auth provider ("LOCAL" for email/password, "GOOGLE" for OAuth2)
        private String provider;
        // Extended profile fields
        private String phone;
        private String department;
        private String bio;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;

        public static UserDTO fromEntity(User user) {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setRole(user.getRole().name());
            dto.setIsActive(user.getIsActive());
            dto.setProvider(user.getProvider());   // ← fix: was missing
            dto.setPhone(user.getPhone());
            dto.setDepartment(user.getDepartment());
            dto.setBio(user.getBio());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setLastLogin(user.getLastLogin());
            return dto;
        }
    }

    @Data
    public static class ProfileUpdateRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @Size(max = 20)
        private String phone;

        @Size(max = 100)
        private String department;

        @Size(max = 500)
        private String bio;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }

    @Data
    public static class TokenResponse {
        private String accessToken;
        private String tokenType = "Bearer";

        public TokenResponse(String accessToken) {
            this.accessToken = accessToken;
        }
    }
}