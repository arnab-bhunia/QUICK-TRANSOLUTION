// One-time (and safely re-runnable) migration of the four legacy static
// offices into MongoDB. Run from inside server/:
//
//   npm run seed-offices
//
// - Existing office codes are preserved exactly.
// - Idempotent: uses upsert + $setOnInsert, so re-running never creates
//   duplicates and NEVER overwrites details an admin has since edited.
// - Never deactivates or deletes anything, and never touches employees.
// - Afterwards it reports (read-only) any employee whose officeCode has no
//   matching Office document.
import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import Office from "../models/Office.js";
import AdminUser from "../models/AdminUser.js";

// Snapshot of the retired config/offices.js (server + client copies).
export const LEGACY_OFFICES = [
  { code: "OFQT482731", name: "Bhutan Border" },
  { code: "OFQT615904", name: "Delhi" },
  { code: "OFQT293847", name: "Guwahati" },
  { code: "OFQT751628", name: "Raxaul Border, Nepal" },
];

export async function seedOffices(offices = LEGACY_OFFICES) {
  await Office.init();
  const result = { created: [], existing: [], errors: [], orphanCodes: [] };

  for (const o of offices) {
    try {
      const r = await Office.updateOne(
        { code: o.code },
        { $setOnInsert: { code: o.code, name: o.name, isActive: true } },
        { upsert: true }
      );
      (r.upsertedCount ? result.created : result.existing).push(o.code);
    } catch (err) {
      result.errors.push({ code: o.code, message: err.message });
    }
  }

  const usedCodes = await AdminUser.distinct("officeCode");
  const known = new Set((await Office.find({ code: { $in: usedCodes } }).select("code").lean()).map((o) => o.code));
  result.orphanCodes = usedCodes.filter((c) => !known.has(c));
  return result;
}

async function main() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error("Could not connect to MongoDB — nothing was migrated.");
    process.exit(1);
  }
  const r = await seedOffices();
  console.log(`Created: ${r.created.length ? r.created.join(", ") : "none"}`);
  console.log(`Already present (left untouched): ${r.existing.length ? r.existing.join(", ") : "none"}`);
  if (r.orphanCodes.length) {
    console.warn(`WARNING: employees reference office codes with no Office record: ${r.orphanCodes.join(", ")}`);
  }
  if (r.errors.length) {
    for (const e of r.errors) console.error(`FAILED ${e.code}: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
