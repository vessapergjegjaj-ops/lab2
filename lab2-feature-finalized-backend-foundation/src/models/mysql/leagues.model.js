module.exports = {
  tableName: "leagues",
  primaryKey: "id",
  fields: {
    name: "name",
    country: "country",
    season: "season",
  },
  requiredFields: ["name"],
  defaultOrderBy: "name",
};
