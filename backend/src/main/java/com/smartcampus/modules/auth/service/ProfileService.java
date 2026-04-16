package com.smartcampus.modules.auth.service;

import com.smartcampus.modules.auth.dto.AuthDTOs;
import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Get the current user's full profile (including phone, department, bio).
     */
    public AuthDTOs.UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthDTOs.UserDTO.fromEntity(user);
    }

    /**
     * Update basic profile fields: name, phone, department, bio.
     */
    @Transactional
    public AuthDTOs.UserDTO updateProfile(Long userId, AuthDTOs.ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (StringUtils.hasText(request.getName())) {
            user.setName(request.getName());
        }
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setBio(request.getBio());

        User saved = userRepository.save(user);
        log.info("Profile updated for user {}", userId);
        return AuthDTOs.UserDTO.fromEntity(saved);
    }

    /**
     * Upload and save a new avatar image for the user.
     * Returns the updated UserDTO with the new avatarUrl.
     */
    @Transactional
    public AuthDTOs.UserDTO uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Validate size (max 5 MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must not exceed 5 MB");
        }

        // Build unique filename
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar"
        );
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = originalFilename.substring(dotIdx);
        }
        String filename = "avatar_" + userId + "_" + UUID.randomUUID() + extension;

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir, "avatars");
        Files.createDirectories(uploadPath);

        // Delete old avatar file if it was a local upload
        deleteOldAvatar(user.getAvatarUrl(), uploadPath);

        // Save new file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Build publicly accessible URL
        // The backend must serve /uploads/** statically (see WebMvcConfig)
        String avatarUrl = "http://localhost:8080/uploads/avatars/" + filename;
        user.setAvatarUrl(avatarUrl);

        User saved = userRepository.save(user);
        log.info("Avatar uploaded for user {}: {}", userId, avatarUrl);
        return AuthDTOs.UserDTO.fromEntity(saved);
    }

    /**
     * Change the user's password (local auth only).
     */
    @Transactional
    public void changePassword(Long userId, AuthDTOs.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPasswordHash() == null) {
            throw new RuntimeException("Password change is not available for OAuth2 accounts");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user {}", userId);
    }

    /**
     * Remove the user's avatar (sets avatarUrl to null; deletes the local file if applicable).
     */
    @Transactional
    public AuthDTOs.UserDTO removeAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get(uploadDir, "avatars");
        deleteOldAvatar(user.getAvatarUrl(), uploadPath);

        user.setAvatarUrl(null);
        User saved = userRepository.save(user);
        log.info("Avatar removed for user {}", userId);
        return AuthDTOs.UserDTO.fromEntity(saved);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void deleteOldAvatar(String avatarUrl, Path uploadPath) {
        if (avatarUrl == null || !avatarUrl.contains("/uploads/avatars/")) return;
        try {
            String oldFilename = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            Path oldFile = uploadPath.resolve(oldFilename);
            Files.deleteIfExists(oldFile);
        } catch (IOException e) {
            log.warn("Could not delete old avatar: {}", e.getMessage());
        }
    }
}
