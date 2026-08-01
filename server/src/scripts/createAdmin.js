// One-off script to create a staff login. There is no public signup
// endpoint by design — admin accounts should never be self-service.
// Run from inside server/:
//
//   npm run create-admin -- "Full Name" "email@example.com" "a-strong-password"
//
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import AdminUser from "../models/AdminUser.js";

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "Full Name" "email@example.com" "password"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`An admin with email ${email} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
  });

  console.log(`Admin user created: ${user.email} (${user._id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
