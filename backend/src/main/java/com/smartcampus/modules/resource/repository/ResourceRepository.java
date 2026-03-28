package com.smartcampus.modules.resource.repository;

import com.smartcampus.modules.resource.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    Optional<Resource> findByName(String name);

    boolean existsByName(String name);

    List<Resource> findByStatus(String status);

    List<Resource> findByResourceType(String resourceType);

    Page<Resource> findByStatusAndResourceType(String status, String resourceType, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.capacity >= :minCapacity AND r.status = :status")
    List<Resource> findAvailableResources(@Param("minCapacity") Integer minCapacity, @Param("status") String status);

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.status = 'ACTIVE'")
    long countActiveResources();
}