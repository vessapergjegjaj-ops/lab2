module.exports = {
  tableName: "settings",
  primaryKey: "id",
  fields: {
    settingKey: "setting_key",
    settingValue: "setting_value",
    description: "description",
    isPublic: "is_public",
    updatedBy: "updated_by",
  },
  requiredFields: ["settingKey", "settingValue"],
  jsonFields: ["setting_value"],
  defaultOrderBy: "setting_key",
};
