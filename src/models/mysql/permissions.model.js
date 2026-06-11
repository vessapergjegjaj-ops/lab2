module.exports = {
  tableName: "permissions",
  primaryKey: "id",
  fields: {
    name: "name",
    resource: "resource",
    action: "action",
    description: "description",
  },
  requiredFields: ["name", "resource", "action"],
  defaultOrderBy: "resource",
};
