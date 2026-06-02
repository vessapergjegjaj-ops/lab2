const express = require("express");
const router = express.Router();
const matchMySQLController = require("../controllers/matches/matchMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/matches", matchMySQLController.getAllMatches);
router.get("/mysql/matches/upcoming", matchMySQLController.getUpcomingMatches);
router.get("/mysql/matches/saved/me", authenticate, matchMySQLController.getSavedMatches);
router.get("/mysql/matches/:id", matchMySQLController.getMatchById);
router.post("/mysql/matches", authenticate, requirePermission("matches", "create"), matchMySQLController.createMatch);
router.put("/mysql/matches/:id", authenticate, requirePermission("matches", "update"), matchMySQLController.updateMatch);
router.delete("/mysql/matches/:id", authenticate, requirePermission("matches", "delete"), matchMySQLController.deleteMatch);

router.get("/mysql/matches/:id/seats", matchMySQLController.getMatchSeats);
router.post("/mysql/matches/:id/reservations", authenticate, matchMySQLController.reserveSeat);
router.delete("/mysql/matches/:id/reservations/:reservationId", authenticate, matchMySQLController.releaseReservation);

router.post("/mysql/matches/:id/save", authenticate, matchMySQLController.saveMatch);
router.delete("/mysql/matches/:id/save", authenticate, matchMySQLController.unsaveMatch);

module.exports = router;
