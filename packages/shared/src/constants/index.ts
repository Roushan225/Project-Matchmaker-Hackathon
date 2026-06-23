export const AVAILABILITY_STATUSES = [
  "available",
  "busy",
  "looking-for-team",
  "looking-for-projects",
] as const;

export const PROJECT_STATUSES = [
  "recruiting",
  "active",
  "completed",
  "archived",
] as const;

export const REQUEST_STATUSES = ["pending", "accepted", "rejected"] as const;

export const MEMBER_ROLES = ["owner", "member"] as const;
