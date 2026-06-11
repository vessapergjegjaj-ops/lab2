-- Stadium Ticket Booking - MySQL schema and seed data
-- Import this file in phpMyAdmin/Laragon before starting the backend.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(60) NOT NULL,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_by INT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_roles_user_role (user_id, role_id),
  KEY idx_user_roles_user_id (user_id),
  KEY idx_user_roles_role_id (role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permissions_role_permission (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  family_id VARCHAR(64) NOT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_token_id BIGINT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(512) NULL,
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_family_id (family_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_user_id (user_id),
  KEY idx_audit_logs_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stadiums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leagues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  season VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uploaded_by INT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(512) NOT NULL,
  CONSTRAINT fk_files_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NULL,
  name VARCHAR(255) NOT NULL,
  logo_file_id BIGINT NULL,
  KEY idx_teams_name (name),
  CONSTRAINT fk_teams_league FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL,
  CONSTRAINT fk_teams_logo FOREIGN KEY (logo_file_id) REFERENCES files(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  stadium_location VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NULL UNIQUE,
  league_id INT NULL,
  stadium_id INT NOT NULL,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  kickoff_at DATETIME NOT NULL,
  status ENUM('scheduled', 'active', 'finished', 'cancelled') NOT NULL DEFAULT 'scheduled',
  base_ticket_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  KEY idx_matches_kickoff (kickoff_at),
  CONSTRAINT fk_matches_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_league FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_home FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_away FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stadium_id INT NOT NULL,
  section VARCHAR(50) NOT NULL,
  seat_number VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NULL,
  UNIQUE KEY uq_seat_stadium_label (stadium_id, section, seat_number),
  CONSTRAINT fk_seats_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  match_id INT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bookings_user_id (user_id),
  KEY idx_bookings_match_id (match_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  discount_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(60) NOT NULL DEFAULT 'card',
  status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payments_booking_id (booking_id),
  KEY idx_payments_user_id (user_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NULL,
  match_id INT NULL,
  seat_id INT NULL,
  event_name VARCHAR(255) NOT NULL,
  seat_number VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('available', 'reserved', 'booked', 'cancelled') NOT NULL DEFAULT 'available',
  user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tickets_booking_id (booking_id),
  KEY idx_tickets_match_id (match_id),
  KEY idx_tickets_user_id (user_id),
  CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seat_reservations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  seat_id INT NOT NULL,
  user_id INT NULL,
  booking_id INT NULL,
  status ENUM('held', 'reserved', 'booked', 'released') DEFAULT 'held',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  active_seat_key VARCHAR(64) GENERATED ALWAYS AS (
    CASE WHEN status IN ('held', 'reserved', 'booked') THEN CONCAT(match_id, ':', seat_id) ELSE NULL END
  ) STORED,
  UNIQUE KEY uq_active_seat_reservation (active_seat_key),
  KEY idx_res_match (match_id),
  KEY idx_res_user (user_id),
  CONSTRAINT fk_res_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(40) NOT NULL DEFAULT 'in_app',
  status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
  related_entity_type VARCHAR(80) NULL,
  related_entity_id VARCHAR(80) NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  KEY idx_notifications_user_status (user_id, status),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_matches (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  match_id INT NOT NULL,
  UNIQUE KEY uq_saved_matches_user_match (user_id, match_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transaction_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO roles (id, name, description, is_system_role) VALUES
  (1, 'admin', 'Administrator role', TRUE),
  (2, 'user', 'Regular customer role', TRUE);

INSERT IGNORE INTO permissions (name, resource, action, description) VALUES
  ('matches:create', 'matches', 'create', 'Create matches'),
  ('matches:update', 'matches', 'update', 'Update matches'),
  ('matches:delete', 'matches', 'delete', 'Delete matches'),
  ('payments:read', 'payments', 'read', 'Read all payments'),
  ('notifications:create', 'notifications', 'create', 'Create notifications'),
  ('reports:read', 'reports', 'read', 'Read reports'),
  ('exports:read', 'exports', 'read', 'Export data'),
  ('imports:create', 'imports', 'create', 'Import data');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

INSERT IGNORE INTO users (id, name, username, email, password_hash) VALUES
  (1, 'Admin User', 'admin', 'admin@example.com', '$2b$10$GnxU1N6CKWXtc/pOMOFGSeKfiDAWA6f8MIWt/0xfWt.OEjb/P5KSu'),
  (2, 'Student User', 'student', 'student@example.com', '$2b$10$6CT/RMiDKzlko6vGsxP7k.teiRYVSxUnJBRohuiRLqsS.f96uKD9W');

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1), (2, 2);

INSERT IGNORE INTO stadiums (id, name, location, capacity) VALUES
  (1, 'National Stadium', 'City Center', 50000),
  (2, 'Riverside Arena', 'North District', 32000);

INSERT IGNORE INTO leagues (id, name, country, season) VALUES
  (1, 'University Premier League', 'Local', '2026');

INSERT IGNORE INTO teams (id, league_id, name) VALUES
  (1, 1, 'Falcons FC'),
  (2, 1, 'Lions FC'),
  (3, 1, 'Tigers FC'),
  (4, 1, 'Eagles FC');

INSERT IGNORE INTO events (id, name, description, event_date, stadium_location) VALUES
  (1, 'Falcons vs Lions', 'Opening match', '2026-09-15 18:00:00', 'City Center'),
  (2, 'Tigers vs Eagles', 'Weekend match', '2026-10-02 19:30:00', 'North District');

INSERT IGNORE INTO matches (id, event_id, league_id, stadium_id, home_team_id, away_team_id, kickoff_at, base_ticket_price) VALUES
  (1, 1, 1, 1, 1, 2, '2026-09-15 18:00:00', 45.00),
  (2, 2, 1, 2, 3, 4, '2026-10-02 19:30:00', 35.00);

INSERT IGNORE INTO seats (stadium_id, section, seat_number, price) VALUES
  (1, 'A', '1', 45.00), (1, 'A', '2', 45.00), (1, 'A', '3', 45.00), (1, 'A', '4', 45.00), (1, 'A', '5', 45.00),
  (1, 'B', '1', 60.00), (1, 'B', '2', 60.00), (1, 'B', '3', 60.00), (1, 'B', '4', 60.00), (1, 'B', '5', 60.00),
  (1, 'VIP', '1', 90.00), (1, 'VIP', '2', 90.00), (1, 'VIP', '3', 90.00), (1, 'VIP', '4', 90.00), (1, 'VIP', '5', 90.00),
  (2, 'A', '1', 35.00), (2, 'A', '2', 35.00), (2, 'A', '3', 35.00), (2, 'A', '4', 35.00), (2, 'A', '5', 35.00),
  (2, 'B', '1', 50.00), (2, 'B', '2', 50.00), (2, 'B', '3', 50.00), (2, 'B', '4', 50.00), (2, 'B', '5', 50.00);

SET FOREIGN_KEY_CHECKS = 1;
