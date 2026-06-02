module.exports = {
  tableName: "users",
  primaryKey: "id",
  fields: {
    name: "name",
    username: "username",
    email: "email",
    passwordHash: "password_hash",
  },
  requiredFields: ["name", "email"],
  defaultOrderBy: "name",
};
