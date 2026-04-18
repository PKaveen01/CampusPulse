package com.smartcampus.modules.ticket.repository;

import com.smartcampus.modules.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
	List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
	List<Ticket> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);
	List<Ticket> findByStatusOrderByCreatedAtDesc(Ticket.Status status);
	List<Ticket> findAllByOrderByCreatedAtDesc();
}
