import { randomInt } from "node:crypto";

// New office IDs: fixed "OFQT" prefix + six random digits, e.g. OFQT751628.
// crypto.randomInt is a CSPRNG — no counters, timestamps or other
// predictable inputs are involved.
export const OFFICE_CODE_PREFIX = "OFQT";
export const OFFICE_CODE_REGEX = /^OFQT\d{6}$/;
export const MAX_OFFICE_ID_ATTEMPTS = 10;

export function generateOfficeCode() {
  return OFFICE_CODE_PREFIX + String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function isCodeCollision(err) {
  return err?.code === 11000 && (err.keyPattern?.code || /index: code_1/.test(err.message || ""));
}

// Creates an office with a freshly generated ID. Uniqueness is enforced by
// MongoDB's unique index on `code` (not by a read-then-write check), so two
// concurrent requests can never both win the same ID: the loser gets an
// E11000 on `code`, which we treat as a collision and retry with a new ID.
// Any other error (e.g. a duplicate NAME) is rethrown untouched.
export async function createOfficeWithUniqueCode(
  OfficeModel,
  data,
  { maxAttempts = MAX_OFFICE_ID_ATTEMPTS, generate = generateOfficeCode } = {}
) {
  await OfficeModel.init(); // make sure the unique indexes exist before relying on them

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const code = generate();
    if (!OFFICE_CODE_REGEX.test(code)) {
      throw new Error(`Generated office ID has an invalid format: ${code}`);
    }
    try {
      return await OfficeModel.create({ ...data, code });
    } catch (err) {
      if (isCodeCollision(err)) continue;
      throw err;
    }
  }

  const err = new Error("Could not generate a unique office ID. Please try again.");
  err.status = 503;
  err.expose = true;
  throw err;
}
