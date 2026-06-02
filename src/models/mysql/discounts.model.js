module.exports = {
  tableName: "discounts",
  primaryKey: "id",
  fields: {
    code: "code",
    description: "description",
    discountType: "discount_type",
    discountValue: "discount_value",
    startsAt: "starts_at",
    expiresAt: "expires_at",
    maxUses: "max_uses",
    usesCount: "uses_count",
    isActive: "is_active",
  },
  requiredFields: ["code", "discountType", "discountValue"],
  defaultOrderBy: "code",
};
