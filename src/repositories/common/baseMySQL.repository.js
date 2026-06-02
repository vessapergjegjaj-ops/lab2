const mysqlConnection = require("../../connections/mysql.connection");

const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const quoteIdentifier = (identifier) => {
  if (!identifierPattern.test(identifier)) {
    throw new Error("Invalid SQL identifier: " + identifier);
  }
  return "`" + identifier + "`";
};

const getDbField = (model, field) => {
  if (field === model.primaryKey) {
    return model.primaryKey;
  }

  if (model.fields[field]) {
    return model.fields[field];
  }

  const dbFields = Object.values(model.fields);
  if (dbFields.includes(field)) {
    return field;
  }

  if ((model.readonlyFields || []).includes(field)) {
    return field;
  }

  if (identifierPattern.test(field)) {
    return field;
  }

  throw new Error("Unknown field for " + model.tableName + ": " + field);
};

const normalizeValue = (model, dbField, value) => {
  if (value === undefined) {
    return undefined;
  }

  if (model.jsonFields && model.jsonFields.includes(dbField) && value !== null && typeof value !== "string") {
    return JSON.stringify(value);
  }

  return value;
};

const toDbRecord = (model, data = {}) => {
  const record = {};

  Object.entries(model.fields).forEach(([apiField, dbField]) => {
    const value = data[apiField] !== undefined ? data[apiField] : data[dbField];
    const normalized = normalizeValue(model, dbField, value);
    if (normalized !== undefined) {
      record[dbField] = normalized;
    }
  });

  return record;
};

const buildWhereClause = (model, where = {}) => {
  const conditions = [];
  const params = [];

  Object.entries(where).forEach(([field, value]) => {
    const dbField = getDbField(model, field);
    if (value === null) {
      conditions.push(quoteIdentifier(dbField) + " IS NULL");
      return;
    }

    conditions.push(quoteIdentifier(dbField) + " = ?");
    params.push(normalizeValue(model, dbField, value));
  });

  if (!conditions.length) {
    return { sql: "", params };
  }

  return { sql: " WHERE " + conditions.join(" AND "), params };
};

const createBaseMySQLRepository = (model) => {
  const tableName = quoteIdentifier(model.tableName);
  const primaryKey = quoteIdentifier(model.primaryKey || "id");

  return {
    model,

    async findAll(options = {}) {
      const where = buildWhereClause(model, options.where || {});
      let sql = "SELECT * FROM " + tableName + where.sql;
      const params = [...where.params];

      const orderBy = options.orderBy || model.defaultOrderBy;
      if (orderBy) {
        const direction = String(options.direction || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
        sql += " ORDER BY " + quoteIdentifier(getDbField(model, orderBy)) + " " + direction;
      }

      if (options.limit) {
        sql += " LIMIT ?";
        params.push(Number(options.limit));
      }

      if (options.offset) {
        sql += " OFFSET ?";
        params.push(Number(options.offset));
      }

      return await mysqlConnection.query(sql, params);
    },

    async findById(id) {
      const sql = "SELECT * FROM " + tableName + " WHERE " + primaryKey + " = ?";
      const results = await mysqlConnection.query(sql, [id]);
      return results[0] || null;
    },

    async findOneBy(field, value) {
      const dbField = quoteIdentifier(getDbField(model, field));
      const sql = "SELECT * FROM " + tableName + " WHERE " + dbField + " = ? LIMIT 1";
      const results = await mysqlConnection.query(sql, [value]);
      return results[0] || null;
    },

    async findBy(field, value, options = {}) {
      return await this.findAll({
        ...options,
        where: {
          ...(options.where || {}),
          [field]: value,
        },
      });
    },

    async create(data) {
      const record = toDbRecord(model, data);
      const columns = Object.keys(record);

      if (!columns.length) {
        throw new Error("No valid fields provided for " + model.tableName);
      }

      const placeholders = columns.map(() => "?").join(", ");
      const sql = "INSERT INTO " + tableName + " (" + columns.map(quoteIdentifier).join(", ") + ") VALUES (" + placeholders + ")";
      const result = await mysqlConnection.query(sql, columns.map((column) => record[column]));
      return await this.findById(result.insertId);
    },

    async update(id, data) {
      const record = toDbRecord(model, data);
      const columns = Object.keys(record);

      if (!columns.length) {
        return await this.findById(id);
      }

      const assignments = columns.map((column) => quoteIdentifier(column) + " = ?").join(", ");
      const sql = "UPDATE " + tableName + " SET " + assignments + " WHERE " + primaryKey + " = ?";
      await mysqlConnection.query(sql, [...columns.map((column) => record[column]), id]);
      return await this.findById(id);
    },

    async delete(id) {
      const sql = "DELETE FROM " + tableName + " WHERE " + primaryKey + " = ?";
      const result = await mysqlConnection.query(sql, [id]);
      return result.affectedRows > 0;
    },

    async count(where = {}) {
      const whereClause = buildWhereClause(model, where);
      const sql = "SELECT COUNT(*) AS total FROM " + tableName + whereClause.sql;
      const results = await mysqlConnection.query(sql, whereClause.params);
      return results[0].total;
    },
  };
};

module.exports = createBaseMySQLRepository;
