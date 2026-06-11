module.exports = {
  tableName: "role_permissions",
  primaryKey: "id",
  fields: {
    roleId: "role_id",
    permissionId: "permission_id",
  },
  requiredFields: ["roleId", "permissionId"],
  defaultOrderBy: "assigned_at",
};
