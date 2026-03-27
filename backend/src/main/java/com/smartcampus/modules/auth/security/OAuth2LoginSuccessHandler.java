package com.smartcampus.modules.auth.security;

import com.smartcampus.modules.auth.entity.RefreshToken;
import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import com.smartcampus.modules.auth.service.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = tokenProvider.generateTokenFromUserId(
            user.getId(), user.getEmail(), user.getName(), user.getRole().name()
        );
        RefreshToken refreshToken = tokenProvider.generateRefreshToken(user.getId());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
            .queryParam("token", accessToken)
            .queryParam("refreshToken", refreshToken.getToken())
            .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
