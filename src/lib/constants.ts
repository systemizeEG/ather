export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  CANDIDATE: "CANDIDATE",
} as const;

export const ADMIN_ROLES = {
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
} as const;

export const COUPON_TYPES = {
  GENERAL: "GENERAL",
  CANDIDATE: "CANDIDATE",
} as const;

export const TARGET_TYPES = {
  ORDERS: "ORDERS",
  REVENUE: "REVENUE",
} as const;

export const QUALIFYING_ORDER_STATUSES = ["COMPLETED"] as const;

export const UNCATEGORIZED_SLUG = "uncategorized";
export const UNCATEGORIZED_NAME = "بدون قسم";
