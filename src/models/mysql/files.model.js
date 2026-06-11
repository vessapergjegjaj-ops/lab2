module.exports = {
  tableName: "files",
  primaryKey: "id",
  fields: {
    uploadedBy: "uploaded_by",
    originalName: "original_name",
    storagePath: "storage_path",
  },
  requiredFields: ["originalName", "storagePath"],
  defaultOrderBy: "id",
};
