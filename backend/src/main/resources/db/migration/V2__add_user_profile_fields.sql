-- Migration: Add profile fields to users table
-- Run this if you are NOT using spring.jpa.hibernate.ddl-auto=update
-- For ddl-auto=update, Hibernate will add the columns automatically.
-- Place this at: backend/src/main/resources/db/migration/V2__add_user_profile_fields.sql

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(20)  NULL,
    ADD COLUMN IF NOT EXISTS department  VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS bio         VARCHAR(500) NULL;
