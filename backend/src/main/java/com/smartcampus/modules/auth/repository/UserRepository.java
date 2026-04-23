package com.smartcampus.modules.auth.repository;

import com.smartcampus.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);
    long countByRole(User.Role role);

    // Used by NotificationService to fan-out to all admins / managers
    List<User> findByRole(User.Role role);
    List<User> findByRoleIn(List<User.Role> roles);
}
