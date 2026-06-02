module.exports = {
  tableName: "audit_logs",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    action: "action",
    entityType: "entity_type",
    entityId: "entity_id",
    oldValues: "old_values",
    newValues: "new_values",
    ipAddress: "ip_address",
    userAgent: "user_agent",
  },
  requiredFields: ["action", "entityType"],
  jsonFields: ["old_values", "new_values"],
  defaultOrderBy: "created_at",
};
