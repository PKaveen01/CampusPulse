package com.smartcampus.config;

import com.smartcampus.modules.auth.security.*;
import com.smartcampus.modules.auth.service.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, customUserDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // ── Static file serving for avatars ──
                        .requestMatchers("/uploads/**").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/technician/**").hasAnyRole("TECHNICIAN", "ADMIN")

                        // ── Profile endpoints (authenticated users) ──
                        .requestMatchers(HttpMethod.GET,    "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.POST,   "/api/profile/avatar").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/profile/avatar").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/api/profile/password").authenticated()

                        // Resources endpoints
                        .requestMatchers(HttpMethod.GET, "/api/resources/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/resources/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")

                        // Bookings endpoints
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/my").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/slots").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/check-conflict").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/admin").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()
                        .requestMatchers(HttpMethod.PUT,  "/api/bookings/*/approve").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.PUT,  "/api/bookings/*/reject").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.PUT,  "/api/bookings/*/cancel").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/*").authenticated()

                        // Tickets endpoints
                        .requestMatchers(HttpMethod.POST, "/api/tickets/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/status").authenticated()
                        .requestMatchers("/api/tickets/*/assign").hasAnyRole("MANAGER", "ADMIN")

                        // Notification endpoints (all authenticated users)
                        .requestMatchers(HttpMethod.GET,    "/api/notifications").authenticated()
                        .requestMatchers(HttpMethod.GET,    "/api/notifications/unread-count").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/api/notifications/read-all").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/api/notifications/*/read").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/read").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/*").authenticated()
                        .requestMatchers(HttpMethod.GET,    "/api/notifications/preferences").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/api/notifications/preferences").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
