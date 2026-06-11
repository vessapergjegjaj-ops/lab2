const mysqlConnection = require("../connections/mysql.connection");

const databaseName = process.env.MYSQL_DATABASE;

const query = (sql, params = []) => mysqlConnection.query(sql, params);

const tableExists = async (tableName) => {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [databaseName, tableName]
  );
  return rows[0].total > 0;
};

const columnExists = async (tableName, columnName) => {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [databaseName, tableName, columnName]
  );
  return rows[0].total > 0;
};

const indexExists = async (tableName, indexName) => {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?",
    [databaseName, tableName, indexName]
  );
  return rows[0].total > 0;
};

const addColumnIfMissing = async (tableName, columnName, ddl) => {
  if (!(await columnExists(tableName, columnName))) {
    await query("ALTER TABLE `" + tableName + "` ADD COLUMN " + ddl);
  }
};

const addIndexIfMissing = async (tableName, indexName, ddl) => {
  if (!(await indexExists(tableName, indexName))) {
    await query("ALTER TABLE `" + tableName + "` ADD " + ddl);
  }
};

const ensureAuthSchema = async () => {
  if (!databaseName) {
    throw new Error("MYSQL_DATABASE is required before ensuring auth schema");
  }

  if (!(await tableExists("users"))) {
    await query(`CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(100) NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_users_username (username),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } else {
    await addColumnIfMissing("users", "username", "`username` VARCHAR(100) NULL");
    await addColumnIfMissing("users", "password_hash", "`password_hash` VARCHAR(255) NULL");
    await addColumnIfMissing("users", "created_at", "`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await addColumnIfMissing("users", "updated_at", "`updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");
    await addIndexIfMissing("users", "uq_users_username", "UNIQUE KEY uq_users_username (`username`)");
    await addIndexIfMissing("users", "uq_users_email", "UNIQUE KEY uq_users_email (`email`)");
  }

  await query(`CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(60) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_roles_user_role (user_id, role_id),
    KEY idx_user_roles_user_id (user_id),
    KEY idx_user_roles_role_id (role_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_permissions_role_permission (role_id, permission_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
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
    KEY idx_refresh_tokens_family_id (family_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS audit_logs (
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
    KEY idx_audit_logs_entity (entity_type, entity_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS notifications (
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
    KEY idx_notifications_user_status (user_id, status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  if (await tableExists("matches")) {
    await addColumnIfMissing("matches", "status", "`status` ENUM('scheduled', 'active', 'finished', 'cancelled') NOT NULL DEFAULT 'scheduled'");
    await addColumnIfMissing("matches", "base_ticket_price", "`base_ticket_price` DECIMAL(10,2) NOT NULL DEFAULT 50.00");
    await addIndexIfMissing("matches", "idx_matches_kickoff", "KEY idx_matches_kickoff (`kickoff_at`)");
  }

  if (await tableExists("seats")) {
    await addColumnIfMissing("seats", "price", "`price` DECIMAL(10,2) NULL");
    await addIndexIfMissing("seats", "uq_seat_stadium_label", "UNIQUE KEY uq_seat_stadium_label (`stadium_id`, `section`, `seat_number`)");
  }

  if (await tableExists("bookings")) {
    await addColumnIfMissing("bookings", "match_id", "`match_id` INT NULL");
    await addColumnIfMissing("bookings", "created_at", "`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await addColumnIfMissing("bookings", "updated_at", "`updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");
    await addIndexIfMissing("bookings", "idx_bookings_user_id", "KEY idx_bookings_user_id (`user_id`)");
    await addIndexIfMissing("bookings", "idx_bookings_match_id", "KEY idx_bookings_match_id (`match_id`)");
  }

  if (await tableExists("payments")) {
    await addColumnIfMissing("payments", "method", "`method` VARCHAR(60) NOT NULL DEFAULT 'card'");
    await addColumnIfMissing("payments", "created_at", "`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await addIndexIfMissing("payments", "idx_payments_booking_id", "KEY idx_payments_booking_id (`booking_id`)");
    await addIndexIfMissing("payments", "idx_payments_user_id", "KEY idx_payments_user_id (`user_id`)");
  }

  if (await tableExists("tickets")) {
    await addColumnIfMissing("tickets", "booking_id", "`booking_id` INT NULL");
    await addColumnIfMissing("tickets", "match_id", "`match_id` INT NULL");
    await addColumnIfMissing("tickets", "seat_id", "`seat_id` INT NULL");
    await addColumnIfMissing("tickets", "created_at", "`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await addIndexIfMissing("tickets", "idx_tickets_booking_id", "KEY idx_tickets_booking_id (`booking_id`)");
    await addIndexIfMissing("tickets", "idx_tickets_match_id", "KEY idx_tickets_match_id (`match_id`)");
    await addIndexIfMissing("tickets", "idx_tickets_user_id", "KEY idx_tickets_user_id (`user_id`)");
  }

  if (await tableExists("seat_reservations")) {
    await addColumnIfMissing("seat_reservations", "created_at", "`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await addColumnIfMissing("seat_reservations", "updated_at", "`updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");
    await addIndexIfMissing("seat_reservations", "idx_res_match", "KEY idx_res_match (`match_id`)");
    await addIndexIfMissing("seat_reservations", "idx_res_user", "KEY idx_res_user (`user_id`)");
  }
};

module.exports = ensureAuthSchema;
