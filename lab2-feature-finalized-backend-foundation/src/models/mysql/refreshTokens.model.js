module.exports = {
  tableName: "refresh_tokens",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    tokenHash: "token_hash",
    familyId: "family_id",
    issuedAt: "issued_at",
    expiresAt: "expires_at",
    revokedAt: "revoked_at",
    replacedByTokenId: "replaced_by_token_id",
    ipAddress: "ip_address",
    userAgent: "user_agent",
  },
  requiredFields: ["userId", "tokenHash", "familyId", "expiresAt"],
  defaultOrderBy: "issued_at",
};
