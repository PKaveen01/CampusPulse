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

    // FIXED: Changed from findByResourceTypeId to findByResourceType
    List<Resource> findByResourceType(String resourceType);

    @Query("SELECT r FROM Resource r WHERE r.resourceType = :type")
    List<Resource> findResourcesByType(@Param("type") String type);

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.status = 'ACTIVE'")
    long countActiveResources();

    // Search by name containing text
    List<Resource> findByNameContainingIgnoreCase(String name);

    // Search by location containing text
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // Find by capacity range
    List<Resource> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);
}