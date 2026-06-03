module.exports = {
  tableName: "saved_matches",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    matchId: "match_id",
  },
  requiredFields: ["userId", "matchId"],
  defaultOrderBy: "id",
};
