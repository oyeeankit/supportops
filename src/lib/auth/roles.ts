export const roles = ["manager", "support_engineer", "qa_engineer"] as const;

export type AppRole = (typeof roles)[number];

export type UserProfile = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  employment_status: "active" | "inactive";
};

export const roleLabels: Record<AppRole, string> = {
  manager: "Manager",
  support_engineer: "Support Engineer",
  qa_engineer: "QA Engineer",
};

export const permissions = {
  manageEmployees: ["manager"],
  manageAttendance: ["manager"],
  createTestingTasks: ["manager"],
  manageSettings: ["manager"],
  viewOwnScorecards: ["manager", "support_engineer", "qa_engineer"],
  updateAssignedTestingTasks: ["manager", "support_engineer", "qa_engineer"],
} satisfies Record<string, AppRole[]>;

export function hasRole(profile: UserProfile | null, allowedRoles: AppRole[]) {
  return Boolean(profile && allowedRoles.includes(profile.role));
}
