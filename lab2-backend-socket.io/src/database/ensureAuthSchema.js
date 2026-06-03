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
};

module.exports = ensureAuthSchema;
