package com.smartcampus.modules.resource.service;

import com.smartcampus.modules.resource.dto.ResourceDTO;
import com.smartcampus.modules.resource.entity.Resource;
import com.smartcampus.modules.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceService {

	private final ResourceRepository resourceRepository;

	public java.util.List<ResourceDTO> getResourcesForTicketSelection() {
		java.util.List<Resource> activeResources = resourceRepository.findByStatusIgnoreCaseOrderByNameAsc("ACTIVE");
		java.util.List<Resource> resources = activeResources.isEmpty()
				? resourceRepository.findAllByOrderByNameAsc()
				: activeResources;

		return resources.stream().map(ResourceDTO::fromEntity).toList();
	}
}
