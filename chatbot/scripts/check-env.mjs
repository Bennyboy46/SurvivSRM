import fs from "node:fs";
import path from "node:path";

const envFiles = [".env.local", ".env"];

for (const envFile of envFiles) {
  const filePath = path.resolve(process.cwd(), envFile);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !process.env[key] && value) {
      process.env[key] = value;
    }
  }
}

const required = ["GOSCRAPER_URL", "COOKIE_SECRET", "GROQ_API_KEY"];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Environment check passed.");
