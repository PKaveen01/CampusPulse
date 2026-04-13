package com.smartcampus.modules.resource.repository;

import com.smartcampus.modules.resource.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Stub placeholder — Member 1 adds query methods */
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
	List<Resource> findAllByOrderByNameAsc();
	List<Resource> findByStatusIgnoreCaseOrderByNameAsc(String status);
}
