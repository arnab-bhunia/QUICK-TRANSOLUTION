// One-off script to create a staff login. There is no public signup
// endpoint by design — admin accounts should never be self-service.
// Run from inside server/:
//
//   npm run create-admin -- "Full Name" "email@example.com" "a-strong-password" "9876543210" "OFQT615904" "1990-05-15" "O+"
//
// Mobile, office code, and DOB are required (blood group is optional —
// pass an empty string "" to skip it). Office code must be one of the
// codes in src/config/offices.js.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import AdminUser, { BLOOD_GROUPS } from "../models/AdminUser.js";
import { encryptField, hashLookupValue } from "../utils/crypto.js";
import { OFFICE_CODES, isValidOfficeCode } from "../config/offices.js";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

async function main() {
  const [name, email, password, mobileNumber, officeCode, dob, bloodGroup] = process.argv.slice(2);

  if (!name || !email || !password || !mobileNumber || !officeCode || !dob) {
    console.error(
      'Usage: npm run create-admin -- "Full Name" "email@example.com" "password" "9876543210" "OFQT615904" "1990-05-15" ["O+"]'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const cleanMobile = mobileNumber.trim();
  if (!MOBILE_REGEX.test(cleanMobile)) {
    console.error("Mobile number must be a valid 10-digit number.");
    process.exit(1);
  }

  if (!isValidOfficeCode(officeCode)) {
    console.error(`Office code must be one of: ${OFFICE_CODES.join(", ")}`);
    process.exit(1);
  }

  const dobDate = new Date(dob);
  if (Number.isNaN(dobDate.getTime())) {
    console.error("Date of birth is invalid. Use YYYY-MM-DD.");
    process.exit(1);
  }

  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    console.error(`Blood group must be one of: ${BLOOD_GROUPS.join(", ")}`);
    process.exit(1);
  }

  await connectDB();

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`An admin with email ${email} already exists.`);
    process.exit(1);
  }

  const mobileHash = hashLookupValue(cleanMobile);
  const existingMobile = await AdminUser.findOne({ mobileHash });
  if (existingMobile) {
    console.error(`An account with mobile number ${cleanMobile} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    encryptedMobile: encryptField(cleanMobile),
    mobileHash,
    officeCode,
    dob: dobDate,
    bloodGroup: bloodGroup || null,
    mustChangePassword: true,
  });

  console.log(`Admin user created: ${user.email} (${user._id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
