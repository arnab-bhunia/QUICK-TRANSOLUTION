import JobApplication from "../models/JobApplication.js";

// Generates "QT-APP-2026-000124" — sequential WITHIN a calendar year,
// zero-padded to 6 digits. The sequence number is derived from how many
// applications already exist for the current year rather than a
// separate counter collection, then retried on a rare collision (two
// submissions landing in the same millisecond) — the unique index on
// applicationId (see models/JobApplication.js) is the actual safety
// net; this is just a best-effort generator.
export async function generateApplicationId() {
  const year = new Date().getFullYear();
  const prefix = `QT-APP-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const count = await JobApplication.countDocuments({
      applicationId: { $regex: `^${prefix}` },
    });
    const seq = String(count + 1 + attempt).padStart(6, "0");
    const candidate = `${prefix}${seq}`;
    // eslint-disable-next-line no-await-in-loop
    const taken = await JobApplication.exists({ applicationId: candidate });
    if (!taken) return candidate;
  }
  throw new Error("Could not generate a unique application ID. Please try again.");
}
