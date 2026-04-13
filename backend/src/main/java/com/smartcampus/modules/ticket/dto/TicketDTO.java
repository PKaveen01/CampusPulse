package com.smartcampus.modules.ticket.dto;

import com.smartcampus.modules.ticket.entity.Ticket;
import com.smartcampus.modules.ticket.entity.TicketAttachment;
import com.smartcampus.modules.ticket.entity.TicketComment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TicketDTO {

    @Data
    public static class CreateTicketRequest {
        private Long resourceId;

        @Size(max = 255, message = "Location must not exceed 255 characters")
        private String location;

        @NotBlank(message = "Category is required")
        @Size(max = 50, message = "Category must not exceed 50 characters")
        private String category;

        @NotNull(message = "Priority is required")
        private Ticket.Priority priority;

        @NotBlank(message = "Description is required")
        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        private String description;

        @Size(max = 255, message = "Preferred contact details must not exceed 255 characters")
        private String preferredContactDetails;

        private List<MultipartFile> attachments;
    }

    @Data
    public static class UpdateTicketStatusRequest {
        @NotNull(message = "Status is required")
        private Ticket.Status status;

        @Size(max = 5000, message = "Resolution notes must not exceed 5000 characters")
        private String resolutionNotes;

        @Size(max = 5000, message = "Rejection reason must not exceed 5000 characters")
        private String rejectedReason;
    }

    @Data
    public static class AssignTicketRequest {
        @NotNull(message = "Assignee user id is required")
        private Long assigneeUserId;
    }

    @Data
    public static class AddCommentRequest {
        @NotBlank(message = "Comment is required")
        @Size(max = 5000, message = "Comment must not exceed 5000 characters")
        private String comment;

        private Boolean internal;
    }

    @Data
    public static class UpdateCommentRequest {
        @NotBlank(message = "Comment is required")
        @Size(max = 5000, message = "Comment must not exceed 5000 characters")
        private String comment;
    }

    @Data
    public static class TicketListItem {
        private Long id;
        private String ticketNumber;
        private Long userId;
        private Long resourceId;
        private String location;
        private String category;
        private Ticket.Priority priority;
        private String description;
        private Ticket.Status status;
        private Long assignedTo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static TicketListItem fromEntity(Ticket ticket) {
            TicketListItem dto = new TicketListItem();
            dto.setId(ticket.getId());
            dto.setTicketNumber(ticket.getTicketNumber());
            dto.setUserId(ticket.getUserId());
            dto.setResourceId(ticket.getResourceId());
            dto.setLocation(ticket.getLocation());
            dto.setCategory(ticket.getCategory());
            dto.setPriority(ticket.getPriority());
            dto.setDescription(ticket.getDescription());
            dto.setStatus(ticket.getStatus());
            dto.setAssignedTo(ticket.getAssignedTo());
            dto.setCreatedAt(ticket.getCreatedAt());
            dto.setUpdatedAt(ticket.getUpdatedAt());
            return dto;
        }
    }

    @Data
    public static class TicketDetails {
        private Long id;
        private String ticketNumber;
        private Long userId;
        private Long resourceId;
        private String location;
        private String category;
        private Ticket.Priority priority;
        private String description;
        private Ticket.Status status;
        private String preferredContactDetails;
        private Long assignedTo;
        private String resolutionNotes;
        private String rejectedReason;
        private LocalDateTime resolvedAt;
        private LocalDateTime closedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<AttachmentDTO> attachments;
        private List<CommentDTO> comments;

        public static TicketDetails fromEntity(Ticket ticket, List<TicketAttachment> attachments, List<TicketComment> comments) {
            TicketDetails dto = new TicketDetails();
            dto.setId(ticket.getId());
            dto.setTicketNumber(ticket.getTicketNumber());
            dto.setUserId(ticket.getUserId());
            dto.setResourceId(ticket.getResourceId());
            dto.setLocation(ticket.getLocation());
            dto.setCategory(ticket.getCategory());
            dto.setPriority(ticket.getPriority());
            dto.setDescription(ticket.getDescription());
            dto.setStatus(ticket.getStatus());
            dto.setPreferredContactDetails(ticket.getPreferredContactDetails());
            dto.setAssignedTo(ticket.getAssignedTo());
            dto.setResolutionNotes(ticket.getResolutionNotes());
            dto.setRejectedReason(ticket.getRejectedReason());
            dto.setResolvedAt(ticket.getResolvedAt());
            dto.setClosedAt(ticket.getClosedAt());
            dto.setCreatedAt(ticket.getCreatedAt());
            dto.setUpdatedAt(ticket.getUpdatedAt());
            dto.setAttachments(attachments.stream().map(AttachmentDTO::fromEntity).collect(Collectors.toList()));
            dto.setComments(comments.stream().map(CommentDTO::fromEntity).collect(Collectors.toList()));
            return dto;
        }
    }

    @Data
    public static class AttachmentDTO {
        private Long id;
        private String fileName;
        private Long fileSize;
        private String fileType;
        private Long uploadedBy;
        private LocalDateTime createdAt;

        public static AttachmentDTO fromEntity(TicketAttachment entity) {
            AttachmentDTO dto = new AttachmentDTO();
            dto.setId(entity.getId());
            dto.setFileName(entity.getFileName());
            dto.setFileSize(entity.getFileSize());
            dto.setFileType(entity.getFileType());
            dto.setUploadedBy(entity.getUploadedBy());
            dto.setCreatedAt(entity.getCreatedAt());
            return dto;
        }
    }

    @Data
    public static class CommentDTO {
        private Long id;
        private Long userId;
        private String comment;
        private Boolean internal;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CommentDTO fromEntity(TicketComment entity) {
            CommentDTO dto = new CommentDTO();
            dto.setId(entity.getId());
            dto.setUserId(entity.getUserId());
            dto.setComment(entity.getComment());
            dto.setInternal(entity.getIsInternal());
            dto.setCreatedAt(entity.getCreatedAt());
            dto.setUpdatedAt(entity.getUpdatedAt());
            return dto;
        }
    }
}
