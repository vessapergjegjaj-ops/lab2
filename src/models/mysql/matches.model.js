module.exports = {
  tableName: "matches",
  primaryKey: "id",
  fields: {
    eventId: "event_id",
    leagueId: "league_id",
    stadiumId: "stadium_id",
    homeTeamId: "home_team_id",
    awayTeamId: "away_team_id",
    kickoffAt: "kickoff_at",
    status: "status",
    baseTicketPrice: "base_ticket_price",
  },
  requiredFields: ["stadiumId", "homeTeamId", "awayTeamId", "kickoffAt"],
  defaultOrderBy: "kickoff_at",
};
