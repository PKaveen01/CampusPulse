package com.smartcampus.modules.ticket.service;

import com.smartcampus.modules.auth.entity.User;
import com.smartcampus.modules.auth.repository.UserRepository;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.auth.service.NotificationService;
import com.smartcampus.modules.resource.repository.ResourceRepository;
import com.smartcampus.modules.ticket.dto.TicketDTO;
import com.smartcampus.modules.ticket.entity.Ticket;
import com.smartcampus.modules.ticket.entity.TicketAttachment;
import com.smartcampus.modules.ticket.entity.TicketComment;
import com.smartcampus.modules.ticket.repository.TicketAttachmentRepository;
import com.smartcampus.modules.ticket.repository.TicketCommentRepository;
import com.smartcampus.modules.ticket.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;
    private static final Set<Ticket.Status> TERMINAL_STATES =
            Set.of(Ticket.Status.CLOSED, Ticket.Status.REJECTED);

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;   // ← INJECTED

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    @Value("${file.max-size:5242880}")
    private long maxFileSize;
    @Value("${file.allowed-types:image/jpeg,image/png,image/jpg}")
    private String allowedTypes;

    // ── CREATE ─────────────────────────────────────────────────────────────

    @Transactional
    public TicketDTO.TicketDetails createTicket(TicketDTO.CreateTicketRequest request,
                                                CustomUserDetails currentUser) {
        List<MultipartFile> files = normalizeFiles(request.getAttachments());
        if (files.size() > MAX_ATTACHMENTS_PER_TICKET)
            throw new RuntimeException("A ticket can include up to 3 image attachments");

        Long safeResourceId = request.getResourceId();
        if (safeResourceId != null && !resourceRepository.existsById(safeResourceId))
            safeResourceId = null;

        Ticket ticket = Ticket.builder()
                .ticketNumber(generateTicketNumber())
                .userId(currentUser.getId())
                .resourceId(safeResourceId)
                .location(trimToNull(request.getLocation()))
                .category(request.getCategory().trim())
                .priority(request.getPriority())
                .description(request.getDescription().trim())
                .status(Ticket.Status.OPEN)
                .preferredContactDetails(trimToNull(request.getPreferredContactDetails()))
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        storeAttachments(savedTicket.getId(), currentUser.getId(), files);

        // ── Notify ADMIN + MANAGER: new ticket submitted ──
        String resourceLabel = safeResourceId != null
                ? resourceRepository.findById(safeResourceId)
                          .map(r -> " for " + r.getName()).orElse("")
                : "";
        String staffMsg = String.format(
                "New %s-priority ticket #%s %s submitted by %s",
                request.getPriority(), savedTicket.getTicketNumber(),
                resourceLabel, currentUser.getName());
        try {
            notificationService.notifyByRoles(
                    List.of(User.Role.ADMIN, User.Role.MANAGER),
                    "TICKET_NEW",
                    "New Ticket: " + request.getCategory(),
                    staffMsg,
                    "TICKET", savedTicket.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to notify staff about new ticket: {}", e.getMessage());
        }

        return getTicketById(savedTicket.getId(), currentUser);
    }

    // ── LIST / GET ─────────────────────────────────────────────────────────

    public List<TicketDTO.TicketListItem> getTickets(Ticket.Status status,
                                                     CustomUserDetails currentUser) {
        List<Ticket> tickets;
        if (isAdminOrManager(currentUser)) {
            tickets = (status == null)
                    ? ticketRepository.findAllByOrderByCreatedAtDesc()
                    : ticketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (isStaff(currentUser)) {
            tickets = ticketRepository.findByAssignedToOrderByCreatedAtDesc(currentUser.getId());
            if (status != null) tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
        } else {
            tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
            if (status != null) tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
        }
        return tickets.stream().map(TicketDTO.TicketListItem::fromEntity).collect(Collectors.toList());
    }

    public TicketDTO.TicketDetails getTicketById(Long ticketId, CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateTicketAccess(ticket, currentUser);
        List<TicketAttachment> attachments =
                ticketAttachmentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        List<TicketComment> comments =
                ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        comments = filterCommentsForUser(comments, currentUser);
        return TicketDTO.TicketDetails.fromEntity(ticket, attachments, comments);
    }

    // ── ASSIGN ─────────────────────────────────────────────────────────────

    @Transactional
    public TicketDTO.TicketDetails assignTicket(Long ticketId, Long assigneeUserId,
                                                CustomUserDetails currentUser) {
        if (!isAdminOrManager(currentUser))
            throw new RuntimeException("Only admin or manager can assign tickets");

        Ticket ticket = getTicketEntityById(ticketId);
        if (TERMINAL_STATES.contains(ticket.getStatus()))
            throw new RuntimeException("Cannot assign a closed or rejected ticket");

        User assignee = userRepository.findById(assigneeUserId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
        if (!isAssignableRole(assignee.getRole()))
            throw new RuntimeException("Assignee must be TECHNICIAN, MANAGER, or ADMIN");

        Long previousAssignee = ticket.getAssignedTo();
        ticket.setAssignedTo(assigneeUserId);
        if (ticket.getStatus() == Ticket.Status.OPEN)
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
        ticketRepository.save(ticket);

        // ── Notify the newly assigned technician/staff ──
        try {
            notificationService.createNotification(
                    assigneeUserId,
                    "TICKET_ASSIGNED",
                    "Ticket Assigned to You",
                    String.format("Ticket #%s (%s priority, %s) has been assigned to you.",
                            ticket.getTicketNumber(), ticket.getPriority(), ticket.getCategory()),
                    "TICKET", ticketId
            );
        } catch (Exception e) {
            log.warn("Failed to notify assignee: {}", e.getMessage());
        }

        // ── Notify ticket creator: someone is working on it ──
        try {
            notificationService.createNotification(
                    ticket.getUserId(),
                    "TICKET_ASSIGNED",
                    "Your Ticket is Being Handled",
                    String.format("Ticket #%s has been assigned to a technician and is now in progress.",
                            ticket.getTicketNumber()),
                    "TICKET", ticketId
            );
        } catch (Exception e) {
            log.warn("Failed to notify ticket owner about assignment: {}", e.getMessage());
        }

        // ── If re-assigned, notify the old assignee ──
        if (previousAssignee != null && !previousAssignee.equals(assigneeUserId)) {
            try {
                notificationService.createNotification(
                        previousAssignee,
                        "TICKET_REASSIGNED",
                        "Ticket Reassigned",
                        String.format("Ticket #%s has been reassigned to someone else.",
                                ticket.getTicketNumber()),
                        "TICKET", ticketId
                );
            } catch (Exception e) {
                log.warn("Failed to notify previous assignee: {}", e.getMessage());
            }
        }

        return getTicketById(ticketId, currentUser);
    }

    // ── STATUS UPDATE ──────────────────────────────────────────────────────

    @Transactional
    public TicketDTO.TicketDetails updateStatus(Long ticketId,
                                                TicketDTO.UpdateTicketStatusRequest request,
                                                CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateStatusChangePermission(ticket, request.getStatus(), currentUser);
        validateStatusTransition(ticket.getStatus(), request.getStatus());

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        switch (request.getStatus()) {
            case REJECTED -> {
                if (!StringUtils.hasText(request.getRejectedReason()))
                    throw new RuntimeException("Rejection reason is required");
                ticket.setRejectedReason(request.getRejectedReason().trim());
                ticket.setResolutionNotes(null);
                ticket.setResolvedAt(null);
                ticket.setClosedAt(null);
            }
            case IN_PROGRESS -> {
                ticket.setRejectedReason(null);
                ticket.setClosedAt(null);
            }
            case RESOLVED -> {
                if (StringUtils.hasText(request.getResolutionNotes()))
                    ticket.setResolutionNotes(request.getResolutionNotes().trim());
                ticket.setResolvedAt(LocalDateTime.now());
                ticket.setRejectedReason(null);
                ticket.setClosedAt(null);
            }
            case CLOSED -> {
                if (ticket.getResolvedAt() == null) ticket.setResolvedAt(LocalDateTime.now());
                ticket.setClosedAt(LocalDateTime.now());
                ticket.setRejectedReason(null);
            }
        }

        ticketRepository.save(ticket);

        // ── Notify ticket creator on every status change ──
        String statusLabel = request.getStatus().name();
        String userMsg = buildStatusMessageForOwner(ticket, request.getStatus(), request);
        try {
            notificationService.createNotification(
                    ticket.getUserId(),
                    "TICKET_STATUS_CHANGED",
                    "Ticket #" + ticket.getTicketNumber() + " — " + humanStatus(request.getStatus()),
                    userMsg,
                    "TICKET", ticketId
            );
        } catch (Exception e) {
            log.warn("Failed to notify ticket owner about status change: {}", e.getMessage());
        }

        // ── Notify ADMIN + MANAGER when a technician resolves/closes ──
        if (request.getStatus() == Ticket.Status.RESOLVED
                || request.getStatus() == Ticket.Status.CLOSED) {
            try {
                notificationService.notifyByRoles(
                        List.of(User.Role.ADMIN, User.Role.MANAGER),
                        "TICKET_STATUS_CHANGED",
                        "Ticket " + humanStatus(request.getStatus()) + ": #" + ticket.getTicketNumber(),
                        String.format("Ticket #%s has been marked as %s by the assigned technician.",
                                ticket.getTicketNumber(), statusLabel),
                        "TICKET", ticketId
                );
            } catch (Exception e) {
                log.warn("Failed to notify staff about resolution: {}", e.getMessage());
            }
        }

        // ── Notify assigned technician when admin pushes back to IN_PROGRESS ──
        if (request.getStatus() == Ticket.Status.IN_PROGRESS
                && ticket.getAssignedTo() != null
                && !ticket.getAssignedTo().equals(currentUser.getId())) {
            try {
                notificationService.createNotification(
                        ticket.getAssignedTo(),
                        "TICKET_STATUS_CHANGED",
                        "Ticket #" + ticket.getTicketNumber() + " — Back In Progress",
                        "The ticket has been put back to In Progress. Please continue working on it.",
                        "TICKET", ticketId
                );
            } catch (Exception e) {
                log.warn("Failed to notify assignee about status revert: {}", e.getMessage());
            }
        }

        return getTicketById(ticketId, currentUser);
    }

    // ── COMMENTS ───────────────────────────────────────────────────────────

    @Transactional
    public TicketDTO.CommentDTO addComment(Long ticketId,
                                           TicketDTO.AddCommentRequest request,
                                           CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateTicketAccess(ticket, currentUser);

        boolean internal = Boolean.TRUE.equals(request.getInternal());
        if (internal && !isStaffOrAdmin(currentUser))
            throw new RuntimeException("Only staff can add internal comments");

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(currentUser.getId())
                .comment(request.getComment().trim())
                .isInternal(internal)
                .build();
        TicketComment saved = ticketCommentRepository.save(comment);

        // ── Notify: ticket owner gets comment from staff; staff gets comment from owner ──
        if (!internal) {
            boolean commenterIsStaff = isStaffOrAdmin(currentUser);
            Long recipientId = commenterIsStaff
                    ? ticket.getUserId()             // staff replied → tell owner
                    : ticket.getAssignedTo();        // owner replied → tell assignee

            if (recipientId != null && !recipientId.equals(currentUser.getId())) {
                String commenterName = currentUser.getName();
                try {
                    notificationService.createNotification(
                            recipientId,
                            "TICKET_COMMENT",
                            "New Comment on Ticket #" + ticket.getTicketNumber(),
                            String.format("%s commented: \"%s\"",
                                    commenterName,
                                    truncate(request.getComment(), 80)),
                            "TICKET", ticketId
                    );
                } catch (Exception e) {
                    log.warn("Failed to notify about new comment: {}", e.getMessage());
                }
            }
        }

        return TicketDTO.CommentDTO.fromEntity(saved);
    }

    @Transactional
    public TicketDTO.CommentDTO updateComment(Long ticketId, Long commentId,
                                              TicketDTO.UpdateCommentRequest request,
                                              CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateTicketAccess(ticket, currentUser);
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        validateCommentOwnership(comment, currentUser);
        comment.setComment(request.getComment().trim());
        return TicketDTO.CommentDTO.fromEntity(ticketCommentRepository.save(comment));
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

    // ── ATTACHMENTS ────────────────────────────────────────────────────────

    @Transactional
    public TicketDTO.TicketDetails addAttachments(Long ticketId, List<MultipartFile> attachments,
                                                  CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateTicketAccess(ticket, currentUser);
        List<MultipartFile> files = normalizeFiles(attachments);
        if (files.isEmpty()) throw new RuntimeException("At least one attachment is required");
        long existing = ticketAttachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > MAX_ATTACHMENTS_PER_TICKET)
            throw new RuntimeException("A ticket can include up to 3 image attachments");
        storeAttachments(ticketId, currentUser.getId(), files);
        return getTicketById(ticketId, currentUser);
    }

    @Transactional
    public void deleteAttachment(Long ticketId, Long attachmentId, CustomUserDetails currentUser) {
        Ticket ticket = getTicketEntityById(ticketId);
        validateTicketAccess(ticket, currentUser);
        TicketAttachment attachment = ticketAttachmentRepository
                .findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        boolean canDelete = isAdmin(currentUser)
                || Objects.equals(attachment.getUploadedBy(), currentUser.getId())
                || Objects.equals(ticket.getUserId(), currentUser.getId());
        if (!canDelete) throw new RuntimeException("Not allowed to delete this attachment");
        deletePhysicalFileIfExists(attachment.getFilePath());
        ticketAttachmentRepository.delete(attachment);
    }

    public List<TicketDTO.AssignableStaffDTO> getAssignableStaff(CustomUserDetails currentUser) {
        if (!isAdminOrManager(currentUser))
            throw new RuntimeException("Only admin or manager can view assignable staff");
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TECHNICIAN)
                .filter(u -> !Boolean.FALSE.equals(u.getIsActive()))
                .map(TicketDTO.AssignableStaffDTO::fromUser)
                .toList();
    }

    // ── PRIVATE HELPERS ────────────────────────────────────────────────────

    private String buildStatusMessageForOwner(Ticket ticket,
                                              Ticket.Status newStatus,
                                              TicketDTO.UpdateTicketStatusRequest req) {
        return switch (newStatus) {
            case IN_PROGRESS -> String.format(
                    "A technician has started working on your ticket #%s.", ticket.getTicketNumber());
            case RESOLVED -> String.format(
                    "Your ticket #%s has been resolved. Notes: %s",
                    ticket.getTicketNumber(),
                    StringUtils.hasText(req.getResolutionNotes()) ? req.getResolutionNotes() : "—");
            case CLOSED -> String.format(
                    "Your ticket #%s has been closed. Thank you for your report.", ticket.getTicketNumber());
            case REJECTED -> String.format(
                    "Your ticket #%s was rejected. Reason: %s",
                    ticket.getTicketNumber(), req.getRejectedReason());
            default -> String.format("Your ticket #%s status changed to %s.",
                    ticket.getTicketNumber(), newStatus);
        };
    }

    private String humanStatus(Ticket.Status s) {
        return switch (s) {
            case OPEN        -> "Open";
            case IN_PROGRESS -> "In Progress";
            case RESOLVED    -> "Resolved";
            case CLOSED      -> "Closed";
            case REJECTED    -> "Rejected";
        };
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "…";
    }

    private void storeAttachments(Long ticketId, Long uploadedBy, List<MultipartFile> files) {
        Set<String> allowed = Arrays.stream(allowedTypes.split(","))
                .map(String::trim).filter(StringUtils::hasText).collect(Collectors.toSet());
        Path dir = Paths.get(uploadDir, "tickets", String.valueOf(ticketId)).toAbsolutePath().normalize();
        try { Files.createDirectories(dir); } catch (IOException ex) {
            throw new RuntimeException("Unable to prepare attachment directory", ex);
        }
        for (MultipartFile file : files) {
            validateAttachmentFile(file, allowed);
            String original = Objects.requireNonNullElse(file.getOriginalFilename(), "attachment");
            String safe = Paths.get(original).getFileName().toString();
            Path dest = dir.resolve(UUID.randomUUID() + "_" + safe);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new RuntimeException("Failed to store attachment", ex);
            }
            ticketAttachmentRepository.save(TicketAttachment.builder()
                    .ticketId(ticketId).fileName(safe).filePath(dest.toString())
                    .fileSize(file.getSize()).fileType(file.getContentType()).uploadedBy(uploadedBy)
                    .build());
        }
    }

    private void validateAttachmentFile(MultipartFile file, Set<String> allowed) {
        if (file == null || file.isEmpty()) throw new RuntimeException("File cannot be empty");
        if (file.getSize() > maxFileSize)   throw new RuntimeException("File exceeds max size");
        String ct = file.getContentType();
        if (!StringUtils.hasText(ct) || !allowed.contains(ct))
            throw new RuntimeException("Only jpg/jpeg/png attachments are allowed");
    }

    private Ticket getTicketEntityById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    private void validateTicketAccess(Ticket ticket, CustomUserDetails u) {
        if (isAdminOrManager(u)) return;
        if (!Objects.equals(ticket.getUserId(), u.getId())
                && !Objects.equals(ticket.getAssignedTo(), u.getId()))
            throw new RuntimeException("Not authorized to access this ticket");
    }

    private void validateStatusChangePermission(Ticket ticket, Ticket.Status next, CustomUserDetails u) {
        if (isAdmin(u)) return;
        if (!isStaffOrAdmin(u)) throw new RuntimeException("Only staff can update ticket status");
        if (!Objects.equals(ticket.getAssignedTo(), u.getId()))
            throw new RuntimeException("Only the assigned staff member can update this ticket");
    }

    private void validateStatusTransition(Ticket.Status curr, Ticket.Status next) {
        if (curr == next) return;
        boolean valid = switch (curr) {
            case OPEN        -> EnumSet.of(Ticket.Status.IN_PROGRESS, Ticket.Status.REJECTED).contains(next);
            case IN_PROGRESS -> EnumSet.of(Ticket.Status.RESOLVED, Ticket.Status.REJECTED).contains(next);
            case RESOLVED    -> next == Ticket.Status.CLOSED;
            default          -> false;
        };
        if (!valid) throw new RuntimeException("Invalid transition: " + curr + " → " + next);
    }

    private List<TicketComment> filterCommentsForUser(List<TicketComment> comments, CustomUserDetails u) {
        if (isStaffOrAdmin(u)) return comments;
        return comments.stream().filter(c -> !Boolean.TRUE.equals(c.getIsInternal())).toList();
    }

    private void validateCommentOwnership(TicketComment c, CustomUserDetails u) {
        if (!Objects.equals(c.getUserId(), u.getId()) && !isAdmin(u))
            throw new RuntimeException("You can only edit or delete your own comment");
    }

    private String generateTicketNumber() {
        return "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String v) {
        return StringUtils.hasText(v) ? v.trim() : null;
    }

    private List<MultipartFile> normalizeFiles(List<MultipartFile> f) {
        if (f == null) return List.of();
        return f.stream().filter(Objects::nonNull).filter(x -> !x.isEmpty()).toList();
    }

    private void deletePhysicalFileIfExists(String path) {
        if (!StringUtils.hasText(path)) return;
        try { Files.deleteIfExists(Paths.get(path)); } catch (IOException ignored) {}
    }

    private boolean isAdmin(CustomUserDetails u)          { return u.getRole() == User.Role.ADMIN; }
    private boolean isAdminOrManager(CustomUserDetails u) { return u.getRole() == User.Role.ADMIN || u.getRole() == User.Role.MANAGER; }
    private boolean isStaff(CustomUserDetails u)          { return u.getRole() == User.Role.TECHNICIAN || u.getRole() == User.Role.MANAGER; }
    private boolean isStaffOrAdmin(CustomUserDetails u)   { return isAdmin(u) || isStaff(u); }
    private boolean isAssignableRole(User.Role r)         { return r == User.Role.TECHNICIAN || r == User.Role.MANAGER || r == User.Role.ADMIN; }
}
