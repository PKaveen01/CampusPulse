-- Smart Campus Operations Hub — Full Database Schema
-- Run this once to initialise the database

CREATE DATABASE IF NOT EXISTS smart_campus_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_campus_hub;

-- ─────────────────────────────────────────────
-- AUTH MODULE (Member 4)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    provider VARCHAR(20) DEFAULT 'LOCAL',
    provider_id VARCHAR(100),
    password_hash VARCHAR(255),
    role ENUM('USER','TECHNICIAN','MANAGER','ADMIN') NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    booking_updates BOOLEAN DEFAULT TRUE,
    ticket_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user_read (user_id, is_read),
    INDEX idx_notification_created (created_at DESC)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ─────────────────────────────────────────────
-- RESOURCE MODULE (Member 1)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resource_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource_type_id BIGINT,
    capacity INT CHECK (capacity >= 1 AND capacity <= 500),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS availability_windows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- BOOKING MODULE (Member 2)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    expected_attendees INT,
    status VARCHAR(20) DEFAULT 'PENDING',
    rejection_reason TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    cancelled_by BIGINT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    INDEX idx_booking_resource_time (resource_id, booking_date, start_time, end_time),
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_status (status)
);

CREATE TABLE IF NOT EXISTS booking_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by BIGINT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blocked_dates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT,
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- TICKET MODULE (Member 3)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    resource_id BIGINT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    assigned_to BIGINT,
    resolution_notes TEXT,
    rejected_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_ticket_status (status),
    INDEX idx_ticket_user (user_id),
    INDEX idx_ticket_priority (priority)
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_comment_ticket (ticket_id)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_sla (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    target_resolution_hours INT NOT NULL,
    time_to_first_response TIMESTAMP NULL,
    time_to_resolution TIMESTAMP NULL,
    breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────

INSERT IGNORE INTO resource_types (name, description, icon) VALUES
('Lecture Hall', 'Large teaching spaces', 'school'),
('Meeting Room', 'Small meeting spaces', 'meeting_room'),
('Lab', 'Computer and science labs', 'science'),
('Equipment', 'Portable equipment', 'devices');

-- Default admin user (password: Admin@123 — change immediately)
-- BCrypt hash for "Admin@123"
INSERT IGNORE INTO users (email, name, provider, password_hash, role, is_active) VALUES
('admin@smartcampus.edu', 'System Administrator', 'LOCAL',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN', true);
