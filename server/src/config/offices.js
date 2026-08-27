// ============================================================================
// OFFICE DIRECTORY
// Single source of truth for the office codes a staff/admin account can be
// assigned to. A staff record stores only the `code` (one column,
// `officeCode` on AdminUser) — never a free-text location — so office
// values are always one of a known, auditable set instead of arbitrary
// strings typed into a form.
//
// Keep client/src/config/offices.js (used to render the <select> in the
// admin panel) in sync with this list. It's duplicated rather than shared
// because the client and server are separate deployable apps in this repo.
// ============================================================================

export const OFFICES = [
  { code: "OFQT482731", name: "Bhutan Border" },
  { code: "OFQT615904", name: "Delhi" },
  { code: "OFQT293847", name: "Guwahati" },
  { code: "OFQT751628", name: "Raxaul Border, Nepal" },
];

export const OFFICE_CODES = OFFICES.map((o) => o.code);

export function isValidOfficeCode(code) {
  return OFFICE_CODES.includes(code);
}

export function getOfficeName(code) {
  return OFFICES.find((o) => o.code === code)?.name || null;
}
