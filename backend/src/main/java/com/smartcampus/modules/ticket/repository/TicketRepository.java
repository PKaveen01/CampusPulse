package com.smartcampus.modules.ticket.repository;

import com.smartcampus.modules.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Stub placeholder — Member 3 adds SLA and status queries */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {}
