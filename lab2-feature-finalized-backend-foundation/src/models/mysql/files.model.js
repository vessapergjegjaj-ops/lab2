module.exports = {
  tableName: "files",
  primaryKey: "id",
  fields: {
    uploadedBy: "uploaded_by",
    originalName: "original_name",
    storageName: "storage_name",
    mimeType: "mime_type",
    sizeBytes: "size_bytes",
    storagePath: "storage_path",
    relatedEntityType: "related_entity_type",
    relatedEntityId: "related_entity_id",
  },
  requiredFields: ["originalName", "storageName", "mimeType", "sizeBytes", "storagePath"],
  defaultOrderBy: "created_at",
};
