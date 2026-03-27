package com.smartcampus.modules.auth.security;

import com.smartcampus.modules.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails, OAuth2User {

    private Long id;
    private String email;
    private String name;
    private String password;
    private String avatarUrl;
    private User.Role role;
    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;  // Add this for OAuth2 attributes

    public static CustomUserDetails create(User user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "",
                user.getAvatarUrl(),
                user.getRole(),
                authorities,
                new HashMap<>()  // Empty attributes for non-OAuth2 users
        );
    }

    // Overload for OAuth2 users with attributes
    public static CustomUserDetails create(User user, Map<String, Object> attributes) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "",
                user.getAvatarUrl(),
                user.getRole(),
                authorities,
                attributes
        );
    }

    // OAuth2User interface methods
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return name;
    }

    // UserDetails interface methods
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}