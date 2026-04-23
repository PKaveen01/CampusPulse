package com.smartcampus.modules.ticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.modules.ticket.entity.TicketAttachment;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    long countByTicketId(Long ticketId);
    Optional<TicketAttachment> findByIdAndTicketId(Long id, Long ticketId);
    void deleteByTicketId(Long ticketId);
}
