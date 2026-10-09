// ==========================================
// Validate Required Environment Variables
// ==========================================

const requiredVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

const missingVars = requiredVars.filter(
  (key) => !process.env[key] || process.env[key].trim() === ""
);

if (missingVars.length > 0) {
  console.error("\n========================================");
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((key) => console.error(`   - ${key}`));
  console.error("========================================");
  console.error("Please check your .env file.\n");

  process.exit(1);
}

console.log("✅ Environment variables validated successfully.");