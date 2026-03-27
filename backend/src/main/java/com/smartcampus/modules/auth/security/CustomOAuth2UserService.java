package com.smartcampus.modules.auth.security;

import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase();

        // Handle different OAuth2 providers
        String providerId;
        String email;
        String name;
        String avatarUrl;

        if ("GOOGLE".equals(provider)) {
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatarUrl = oAuth2User.getAttribute("picture");
        } else if ("GITHUB".equals(provider)) {
            providerId = oAuth2User.getAttribute("id").toString();
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatarUrl = oAuth2User.getAttribute("avatar_url");
        } else {
            // Default handling for other providers
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatarUrl = oAuth2User.getAttribute("picture");
        }

        User user = processOAuthUser(provider, providerId, email, name, avatarUrl);

        // Create CustomUserDetails with OAuth2 attributes
        return CustomUserDetails.create(user, oAuth2User.getAttributes());
    }

    private User processOAuthUser(String provider, String providerId, String email,
                                  String name, String avatarUrl) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            user.setAvatarUrl(avatarUrl);
            user.setLastLogin(LocalDateTime.now());
            return userRepository.save(user);
        }

        User newUser = User.builder()
                .email(email)
                .name(name)
                .avatarUrl(avatarUrl)
                .provider(provider)
                .providerId(providerId)
                .role(User.Role.USER)
                .isActive(true)
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }
}