module.exports = {
  tableName: "seats",
  primaryKey: "id",
  fields: {
    stadiumId: "stadium_id",
    section: "section",
    seatNumber: "seat_number",
    price: "price",
  },
  requiredFields: ["stadiumId", "section", "seatNumber"],
  defaultOrderBy: "section",
};
