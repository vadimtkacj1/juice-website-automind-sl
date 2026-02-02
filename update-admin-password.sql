-- ============================================
-- Update Admin Password with Bcrypt Hash
-- ============================================
-- This script updates the admin password
-- Username: admin
-- Password: JuiceAdmin2026!@#
-- Bcrypt Hash: $2a$10$DT404I23K6KL.GwwqQvvEOROzyHNgRKI.6mqC..MqOGNpCseUPLBq
-- ============================================

USE juice_website;

-- Update admin password
UPDATE `admins`
SET `password` = '$2a$10$DT404I23K6KL.GwwqQvvEOROzyHNgRKI.6mqC..MqOGNpCseUPLBq'
WHERE `username` = 'admin';

-- Verify the update
SELECT username, email, created_at
FROM `admins`
WHERE `username` = 'admin';
