package com.smartcampus.modules.resource.repository;

import com.smartcampus.modules.resource.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceTypeRepository extends JpaRepository<ResourceType, Long> {

    Optional<ResourceType> findByName(String name);

    List<ResourceType> findByIsActiveTrue();

    boolean existsByName(String name);
}