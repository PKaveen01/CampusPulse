package com.smartcampus.modules.ticket.service;

import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.ticket.dto.TicketDTO;
import com.smartcampus.modules.ticket.entity.Ticket;
import com.smartcampus.modules.ticket.entity.TicketAttachment;
import com.smartcampus.modules.ticket.entity.TicketComment;
import com.smartcampus.modules.ticket.repository.TicketAttachmentRepository;
import com.smartcampus.modules.ticket.repository.TicketCommentRepository;
import com.smartcampus.modules.ticket.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

	private static final int MAX_ATTACHMENTS_PER_TICKET = 3;
	private static final Set<Ticket.Status> TERMINAL_STATES = Set.of(Ticket.Status.CLOSED, Ticket.Status.REJECTED);

	private final TicketRepository ticketRepository;
	private final TicketAttachmentRepository ticketAttachmentRepository;
	private final TicketCommentRepository ticketCommentRepository;
	private final UserRepository userRepository;

	@Value("${file.upload-dir:./uploads}")
	private String uploadDir;

	@Value("${file.max-size:5242880}")
	private long maxFileSize;

	@Value("${file.allowed-types:image/jpeg,image/png,image/jpg}")
	private String allowedTypes;

	@Transactional
	public TicketDTO.TicketDetails createTicket(TicketDTO.CreateTicketRequest request, CustomUserDetails currentUser) {
		List<MultipartFile> files = normalizeFiles(request.getAttachments());
		if (files.size() > MAX_ATTACHMENTS_PER_TICKET) {
			throw new RuntimeException("A ticket can include up to 3 image attachments");
		}

		Ticket ticket = Ticket.builder()
				.ticketNumber(generateTicketNumber())
				.userId(currentUser.getId())
				.resourceId(request.getResourceId())
				.location(trimToNull(request.getLocation()))
				.category(request.getCategory().trim())
				.priority(request.getPriority())
				.description(request.getDescription().trim())
				.status(Ticket.Status.OPEN)
				.preferredContactDetails(trimToNull(request.getPreferredContactDetails()))
				.build();

		Ticket savedTicket = ticketRepository.save(ticket);
		storeAttachments(savedTicket.getId(), currentUser.getId(), files);
		return getTicketById(savedTicket.getId(), currentUser);
	}

	public List<TicketDTO.TicketListItem> getTickets(Ticket.Status status, CustomUserDetails currentUser) {
		List<Ticket> tickets;
		if (isAdminOrManager(currentUser)) {
			tickets = (status == null)
					? ticketRepository.findAllByOrderByCreatedAtDesc()
					: ticketRepository.findByStatusOrderByCreatedAtDesc(status);
		} else if (isStaff(currentUser)) {
			tickets = ticketRepository.findByAssignedToOrderByCreatedAtDesc(currentUser.getId());
			if (status != null) {
				tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
			}
		} else {
			tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
			if (status != null) {
				tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
			}
		}

		return tickets.stream().map(TicketDTO.TicketListItem::fromEntity).collect(Collectors.toList());
	}

	public TicketDTO.TicketDetails getTicketById(Long ticketId, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		List<TicketAttachment> attachments = ticketAttachmentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
		List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
		comments = filterCommentsForUser(comments, currentUser);

		return TicketDTO.TicketDetails.fromEntity(ticket, attachments, comments);
	}

	@Transactional
	public TicketDTO.TicketDetails assignTicket(Long ticketId, Long assigneeUserId, CustomUserDetails currentUser) {
		if (!isAdmin(currentUser)) {
			throw new RuntimeException("Only admin can assign tickets");
		}

		Ticket ticket = getTicketEntityById(ticketId);
		if (TERMINAL_STATES.contains(ticket.getStatus())) {
			throw new RuntimeException("Cannot assign a closed or rejected ticket");
		}

		User assignee = userRepository.findById(assigneeUserId)
				.orElseThrow(() -> new RuntimeException("Assignee not found"));

		if (!isAssignableRole(assignee.getRole())) {
			throw new RuntimeException("Assignee must be TECHNICIAN, MANAGER, or ADMIN");
		}

		ticket.setAssignedTo(assigneeUserId);
		ticketRepository.save(ticket);
		return getTicketById(ticketId, currentUser);
	}

	@Transactional
	public TicketDTO.TicketDetails updateStatus(Long ticketId, TicketDTO.UpdateTicketStatusRequest request, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateStatusChangePermission(ticket, request.getStatus(), currentUser);
		validateStatusTransition(ticket.getStatus(), request.getStatus());

		ticket.setStatus(request.getStatus());

		if (request.getStatus() == Ticket.Status.REJECTED) {
			if (!StringUtils.hasText(request.getRejectedReason())) {
				throw new RuntimeException("Rejection reason is required for REJECTED status");
			}
			ticket.setRejectedReason(request.getRejectedReason().trim());
			ticket.setResolutionNotes(null);
			ticket.setResolvedAt(null);
			ticket.setClosedAt(null);
		}

		if (request.getStatus() == Ticket.Status.IN_PROGRESS) {
			ticket.setRejectedReason(null);
			ticket.setClosedAt(null);
		}

		if (request.getStatus() == Ticket.Status.RESOLVED) {
			if (StringUtils.hasText(request.getResolutionNotes())) {
				ticket.setResolutionNotes(request.getResolutionNotes().trim());
			}
			ticket.setResolvedAt(LocalDateTime.now());
			ticket.setRejectedReason(null);
			ticket.setClosedAt(null);
		}

		if (request.getStatus() == Ticket.Status.CLOSED) {
			if (ticket.getResolvedAt() == null) {
				ticket.setResolvedAt(LocalDateTime.now());
			}
			ticket.setClosedAt(LocalDateTime.now());
			ticket.setRejectedReason(null);
		}

		ticketRepository.save(ticket);
		return getTicketById(ticketId, currentUser);
	}

	@Transactional
	public TicketDTO.CommentDTO addComment(Long ticketId, TicketDTO.AddCommentRequest request, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		boolean internal = Boolean.TRUE.equals(request.getInternal());
		if (internal && !isStaffOrAdmin(currentUser)) {
			throw new RuntimeException("Only staff can add internal comments");
		}

		TicketComment comment = TicketComment.builder()
				.ticketId(ticketId)
				.userId(currentUser.getId())
				.comment(request.getComment().trim())
				.isInternal(internal)
				.build();

		TicketComment saved = ticketCommentRepository.save(comment);
		return TicketDTO.CommentDTO.fromEntity(saved);
	}

	@Transactional
	public TicketDTO.CommentDTO updateComment(Long ticketId, Long commentId, TicketDTO.UpdateCommentRequest request, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
				.orElseThrow(() -> new RuntimeException("Comment not found"));

		validateCommentOwnership(comment, currentUser);
		comment.setComment(request.getComment().trim());
		TicketComment saved = ticketCommentRepository.save(comment);
		return TicketDTO.CommentDTO.fromEntity(saved);
	}

	@Transactional
	public void deleteComment(Long ticketId, Long commentId, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
				.orElseThrow(() -> new RuntimeException("Comment not found"));

		validateCommentOwnership(comment, currentUser);
		ticketCommentRepository.delete(comment);
	}

	@Transactional
	public TicketDTO.TicketDetails addAttachments(Long ticketId, List<MultipartFile> attachments, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		List<MultipartFile> files = normalizeFiles(attachments);
		if (files.isEmpty()) {
			throw new RuntimeException("At least one attachment is required");
		}

		long existingCount = ticketAttachmentRepository.countByTicketId(ticketId);
		if (existingCount + files.size() > MAX_ATTACHMENTS_PER_TICKET) {
			throw new RuntimeException("A ticket can include up to 3 image attachments");
		}

		storeAttachments(ticketId, currentUser.getId(), files);
		return getTicketById(ticketId, currentUser);
	}

	@Transactional
	public void deleteAttachment(Long ticketId, Long attachmentId, CustomUserDetails currentUser) {
		Ticket ticket = getTicketEntityById(ticketId);
		validateTicketAccess(ticket, currentUser);

		TicketAttachment attachment = ticketAttachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
				.orElseThrow(() -> new RuntimeException("Attachment not found"));

		boolean canDelete = isAdmin(currentUser)
				|| Objects.equals(attachment.getUploadedBy(), currentUser.getId())
				|| Objects.equals(ticket.getUserId(), currentUser.getId());
		if (!canDelete) {
			throw new RuntimeException("Not allowed to delete this attachment");
		}

		deletePhysicalFileIfExists(attachment.getFilePath());
		ticketAttachmentRepository.delete(attachment);
	}

	private void storeAttachments(Long ticketId, Long uploadedBy, List<MultipartFile> files) {
		Set<String> allowedContentTypes = Arrays.stream(allowedTypes.split(","))
				.map(String::trim)
				.filter(StringUtils::hasText)
				.collect(Collectors.toSet());

		Path ticketDir = Paths.get(uploadDir, "tickets", String.valueOf(ticketId)).toAbsolutePath().normalize();

		try {
			Files.createDirectories(ticketDir);
		} catch (IOException ex) {
			throw new RuntimeException("Unable to prepare attachment directory", ex);
		}

		for (MultipartFile file : files) {
			validateAttachmentFile(file, allowedContentTypes);

			String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "attachment");
			String safeName = Paths.get(originalName).getFileName().toString();
			String storedName = UUID.randomUUID() + "_" + safeName;
			Path destination = ticketDir.resolve(storedName);

			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
			} catch (IOException ex) {
				throw new RuntimeException("Failed to store attachment file", ex);
			}

			TicketAttachment attachment = TicketAttachment.builder()
					.ticketId(ticketId)
					.fileName(safeName)
					.filePath(destination.toString())
					.fileSize(file.getSize())
					.fileType(file.getContentType())
					.uploadedBy(uploadedBy)
					.build();
			ticketAttachmentRepository.save(attachment);
		}
	}

	private void validateAttachmentFile(MultipartFile file, Set<String> allowedContentTypes) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("Attachment file cannot be empty");
		}
		if (file.getSize() > maxFileSize) {
			throw new RuntimeException("Attachment exceeds maximum file size");
		}
		String contentType = file.getContentType();
		if (!StringUtils.hasText(contentType) || !allowedContentTypes.contains(contentType)) {
			throw new RuntimeException("Only image attachments are allowed (jpg, jpeg, png)");
		}
	}

	private Ticket getTicketEntityById(Long ticketId) {
		return ticketRepository.findById(ticketId)
				.orElseThrow(() -> new RuntimeException("Ticket not found"));
	}

	private void validateTicketAccess(Ticket ticket, CustomUserDetails currentUser) {
		if (isAdminOrManager(currentUser)) {
			return;
		}

		boolean isOwner = Objects.equals(ticket.getUserId(), currentUser.getId());
		boolean isAssignedTechnician = Objects.equals(ticket.getAssignedTo(), currentUser.getId());
		if (!isOwner && !isAssignedTechnician) {
			throw new RuntimeException("Not authorized to access this ticket");
		}
	}

	private void validateStatusChangePermission(Ticket ticket, Ticket.Status newStatus, CustomUserDetails currentUser) {
		if (newStatus == Ticket.Status.REJECTED && !isAdmin(currentUser)) {
			throw new RuntimeException("Only admin can reject tickets");
		}

		if (isAdmin(currentUser)) {
			return;
		}

		if (!isStaffOrAdmin(currentUser)) {
			throw new RuntimeException("Only staff can update ticket status");
		}

		if (!Objects.equals(ticket.getAssignedTo(), currentUser.getId())) {
			throw new RuntimeException("Only the assigned staff member can update this ticket");
		}
	}

	private void validateStatusTransition(Ticket.Status currentStatus, Ticket.Status newStatus) {
		if (currentStatus == newStatus) {
			return;
		}

		if (currentStatus == Ticket.Status.OPEN && EnumSet.of(Ticket.Status.IN_PROGRESS, Ticket.Status.REJECTED).contains(newStatus)) {
			return;
		}
		if (currentStatus == Ticket.Status.IN_PROGRESS && EnumSet.of(Ticket.Status.RESOLVED, Ticket.Status.REJECTED).contains(newStatus)) {
			return;
		}
		if (currentStatus == Ticket.Status.RESOLVED && newStatus == Ticket.Status.CLOSED) {
			return;
		}

		throw new RuntimeException("Invalid status transition: " + currentStatus + " -> " + newStatus);
	}

	private List<TicketComment> filterCommentsForUser(List<TicketComment> comments, CustomUserDetails currentUser) {
		if (isStaffOrAdmin(currentUser)) {
			return comments;
		}

		return comments.stream()
				.filter(comment -> !Boolean.TRUE.equals(comment.getIsInternal()))
				.toList();
	}

	private void validateCommentOwnership(TicketComment comment, CustomUserDetails currentUser) {
		boolean isOwner = Objects.equals(comment.getUserId(), currentUser.getId());
		if (!isOwner && !isAdmin(currentUser)) {
			throw new RuntimeException("You can only edit or delete your own comment");
		}
	}

	private String generateTicketNumber() {
		String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
		return "INC-" + suffix;
	}

	private String trimToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}

	private List<MultipartFile> normalizeFiles(List<MultipartFile> files) {
		if (files == null) {
			return List.of();
		}
		return files.stream()
				.filter(Objects::nonNull)
				.filter(file -> !file.isEmpty())
				.toList();
	}

	private boolean isAdmin(CustomUserDetails currentUser) {
		return currentUser.getRole() == User.Role.ADMIN;
	}

	private boolean isAdminOrManager(CustomUserDetails currentUser) {
		return currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.MANAGER;
	}

	private boolean isStaff(CustomUserDetails currentUser) {
		return currentUser.getRole() == User.Role.TECHNICIAN || currentUser.getRole() == User.Role.MANAGER;
	}

	private boolean isStaffOrAdmin(CustomUserDetails currentUser) {
		return isAdmin(currentUser) || isStaff(currentUser);
	}

	private boolean isAssignableRole(User.Role role) {
		return role == User.Role.TECHNICIAN || role == User.Role.MANAGER || role == User.Role.ADMIN;
	}

	private void deletePhysicalFileIfExists(String filePath) {
		if (!StringUtils.hasText(filePath)) {
			return;
		}
		Path path = Paths.get(filePath);
		try {
			Files.deleteIfExists(path);
		} catch (IOException ignored) {
		}
	}
}
