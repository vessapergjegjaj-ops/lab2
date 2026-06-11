module.exports = {
  tableName: "notifications",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    type: "type",
    title: "title",
    message: "message",
    channel: "channel",
    status: "status",
    relatedEntityType: "related_entity_type",
    relatedEntityId: "related_entity_id",
    sentAt: "sent_at",
    readAt: "read_at",
  },
  requiredFields: ["userId", "type", "title", "message"],
  defaultOrderBy: "id",
};
