package com.smartcampus.modules.auth.dto;

import com.smartcampus.modules.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

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

        public static UserDTO fromEntity(User user) {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setRole(user.getRole().name());
            dto.setIsActive(user.getIsActive());
            return dto;
        }
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
