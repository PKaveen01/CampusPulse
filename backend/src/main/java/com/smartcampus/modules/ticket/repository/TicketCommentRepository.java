package com.smartcampus.modules.ticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.modules.ticket.entity.TicketComment;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    Optional<TicketComment> findByIdAndTicketId(Long id, Long ticketId);
    void deleteByTicketId(Long ticketId);
}
