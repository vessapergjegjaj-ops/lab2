module.exports = {
  tableName: "seats",
  primaryKey: "id",
  fields: {
    stadiumId: "stadium_id",
    seatCategoryId: "seat_category_id",
    section: "section",
    rowLabel: "row_label",
    seatNumber: "seat_number",
    status: "status",
  },
  requiredFields: ["stadiumId", "section", "rowLabel", "seatNumber"],
  defaultOrderBy: "section",
};
