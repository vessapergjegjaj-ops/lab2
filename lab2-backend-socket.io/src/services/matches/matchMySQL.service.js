const createBaseMySQLService = require("../common/baseMySQL.service");
const matchMySQLRepository = require("../../repositories/matches/matchMySQL.repository");
const teamMySQLRepository = require("../../repositories/teams/teamMySQL.repository");
const stadiumFoundationMySQLRepository = require("../../repositories/stadiums/stadiumFoundationMySQL.repository");
const leagueMySQLRepository = require("../../repositories/leagues/leagueMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const notificationMySQLService = require("../notifications/notificationMySQL.service");

const validateMatchRelationships = async (data) => {
  const stadiumId = data.stadiumId || data.stadium_id;
  const homeTeamId = data.homeTeamId || data.home_team_id;
  const awayTeamId = data.awayTeamId || data.away_team_id;
  const leagueId = data.leagueId || data.league_id;

  if (homeTeamId && awayTeamId && Number(homeTeamId) === Number(awayTeamId)) {
    throw new Error("Home team and away team must be different");
  }

  if (stadiumId && !(await stadiumFoundationMySQLRepository.findById(stadiumId))) {
    throw new Error("Stadium not found");
  }

  if (homeTeamId && !(await teamMySQLRepository.findById(homeTeamId))) {
    throw new Error("Home team not found");
  }

  if (awayTeamId && !(await teamMySQLRepository.findById(awayTeamId))) {
    throw new Error("Away team not found");
  }

  if (leagueId && !(await leagueMySQLRepository.findById(leagueId))) {
    throw new Error("League not found");
  }
};

const matchMySQLService = {
  ...createBaseMySQLService(matchMySQLRepository),

  async getAllDetailed() {
    return await matchMySQLRepository.findAllDetailed();
  },

  async getDetailedById(id) {
    return await matchMySQLRepository.findDetailedById(id);
  },

  async getUpcoming(limit) {
    return await matchMySQLRepository.findUpcoming(limit);
  },

  async create(data, actor = {}) {
    await validateMatchRelationships(data);
    const match = await matchMySQLRepository.create(data);
    await auditLogMySQLService.log("match.created", "matches", match.id, {
      userId: actor.userId,
      newValues: match,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return match;
  },

  async update(id, data, actor = {}) {
    const existing = await matchMySQLRepository.findById(id);
    if (!existing) {
      return null;
    }

    await validateMatchRelationships({ ...existing, ...data });
    const updated = await matchMySQLRepository.update(id, data);
    await auditLogMySQLService.log("match.updated", "matches", id, {
      userId: actor.userId,
      oldValues: existing,
      newValues: updated,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return updated;
  },

  async delete(id, actor = {}) {
    const existing = await matchMySQLRepository.findById(id);
    const deleted = await matchMySQLRepository.delete(id);
    if (deleted) {
      await auditLogMySQLService.log("match.deleted", "matches", id, {
        userId: actor.userId,
        oldValues: existing,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
    }
    return deleted;
  },

  async notifySavedUsers(matchId, notification) {
    const match = await matchMySQLRepository.findById(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    return await notificationMySQLService.createNotification({
      ...notification,
      relatedEntityType: "matches",
      relatedEntityId: String(matchId),
    });
  },
};

module.exports = matchMySQLService;
