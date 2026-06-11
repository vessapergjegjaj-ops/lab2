module.exports = {
  tableName: "roles",
  primaryKey: "id",
  fields: {
    name: "name",
    description: "description",
    isSystemRole: "is_system_role",
  },
  requiredFields: ["name"],
  defaultOrderBy: "name",
};
