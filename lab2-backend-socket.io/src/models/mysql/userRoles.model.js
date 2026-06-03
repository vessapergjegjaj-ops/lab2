module.exports = {
  tableName: "user_roles",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    roleId: "role_id",
    assignedBy: "assigned_by",
  },
  requiredFields: ["userId", "roleId"],
  defaultOrderBy: "assigned_at",
};
