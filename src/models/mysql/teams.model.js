module.exports = {
  tableName: "teams",
  primaryKey: "id",
  fields: {
    leagueId: "league_id",
    name: "name",
    shortName: "short_name",
    city: "city",
    logoFileId: "logo_file_id",
  },
  requiredFields: ["name"],
  defaultOrderBy: "name",
};
