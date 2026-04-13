package com.smartcampus.modules.ticket.controller;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.modules.auth.security.CustomUserDetails;
import com.smartcampus.modules.ticket.dto.TicketDTO;
import com.smartcampus.modules.ticket.entity.Ticket;
import com.smartcampus.modules.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketDTO.TicketListItem>>> getTickets(
            @RequestParam(required = false) Ticket.Status status,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<TicketDTO.TicketListItem> tickets = ticketService.getTickets(status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched", tickets));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> getTicketById(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.getTicketById(ticketId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", ticket));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> createTicket(
            @Valid @ModelAttribute TicketDTO.CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.createTicket(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket created", ticket));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> createTicketJson(
            @Valid @RequestBody TicketDTO.CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.createTicket(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket created", ticket));
    }

    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> assignTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketDTO.AssignTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.assignTicket(ticketId, request.getAssigneeUserId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned", ticket));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketDTO.UpdateTicketStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.updateStatus(ticketId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", ticket));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<ApiResponse<TicketDTO.CommentDTO>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketDTO.AddCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.CommentDTO comment = ticketService.addComment(ticketId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment added", comment));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<TicketDTO.CommentDTO>> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody TicketDTO.UpdateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.CommentDTO comment = ticketService.updateComment(ticketId, commentId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment updated", comment));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        ticketService.deleteComment(ticketId, commentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    @PostMapping(value = "/{ticketId}/attachments", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<TicketDTO.TicketDetails>> addAttachments(
            @PathVariable Long ticketId,
            @RequestPart("attachments") List<MultipartFile> attachments,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        TicketDTO.TicketDetails ticket = ticketService.addAttachments(ticketId, attachments, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Attachments added", ticket));
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        ticketService.deleteAttachment(ticketId, attachmentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted", null));
    }
}
