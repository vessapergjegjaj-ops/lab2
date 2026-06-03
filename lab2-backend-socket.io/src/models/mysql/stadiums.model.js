module.exports = {
  tableName: "stadiums",
  primaryKey: "id",
  fields: {
    name: "name",
    location: "location",
    capacity: "capacity",
  },
  requiredFields: ["name", "capacity"],
  defaultOrderBy: "name",
};
