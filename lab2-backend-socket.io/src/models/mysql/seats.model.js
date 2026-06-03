module.exports = {
  tableName: "seats",
  primaryKey: "id",
  fields: {
    stadiumId: "stadium_id",
    section: "section",
    seatNumber: "seat_number",
  },
  requiredFields: ["stadiumId", "section", "seatNumber"],
  defaultOrderBy: "section",
};
