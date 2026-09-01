// ============================================================================
// PERMISSIONS — single source of truth for "who can do what."
//
// Controllers/routes ask requirePermission("some:permission") rather than
// hardcoding role checks like `if (role === "manager")`. Adding a new
// role later (e.g. content_writer going live, or another future role)
// means adding an entry here — zero changes needed to existing routes or
// controllers that already gate on a permission string.
//
// "*" is a wildcard meaning "every permission" — only admin has it.
// ============================================================================

export const ROLE_PERMISSIONS = {
  admin: ["*"],

  // HR only ever touches the people/team side — no shipments, bookings,
  // or analytics visibility at all. Can create anyone except another
  // admin. "team:view" here means "sees every team member" — the
  // ALL-vs-OWN distinction between hr and manager is enforced inside
  // adminController.listStaff (by role), not by using two different
  // permission strings — both need to pass the same route gate.
  hr: ["team:create_hr", "team:create_manager", "team:create_staff", "team:view"],

  // Same "team:view" / "team:create_staff" strings as hr above — the
  // controller scopes a manager down to managedBy = self internally.
  manager: ["team:create_staff", "team:view", "shipments:view", "bookings:view"],

  staff: ["shipments:view", "bookings:view"],

  // Reserved for a future role — not wired into any route or UI yet.
  // Exists here so turning it on later is additive, not a rewrite.
  content_writer: ["blog:create", "blog:edit_own", "blog:view"],
};

// Which roles a given role is allowed to CREATE. Deliberately separate
// from ROLE_PERMISSIONS above (a role's own capabilities vs. who it can
// bring into the system are different questions) even though admin and
// hr's lists happen to overlap heavily with their team:create_* grants.
export const CREATION_RULES = {
  admin: ["admin", "hr", "manager", "staff", "content_writer"],
  hr: ["hr", "manager", "staff", "content_writer"], // everything except admin
  manager: ["staff"], // and only ever scoped to themselves — enforced in the controller
};

export const ALL_ROLES = ["admin", "hr", "manager", "staff", "content_writer"];

// Effective permissions for an account = its role's defaults, plus any
// account-specific extras granted later (see AdminUser.extraPermissions
// — unused by any UI today, but the computation already honors it so
// that future feature is additive too, not a redesign).
export function computePermissions(user) {
  const base = ROLE_PERMISSIONS[user.role] || [];
  const extra = user.extraPermissions || [];
  return Array.from(new Set([...base, ...extra]));
}

export function hasPermission(user, permission) {
  const perms = computePermissions(user);
  return perms.includes("*") || perms.includes(permission);
}
