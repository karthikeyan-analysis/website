#!/usr/bin/env node

/**
 * Vercel Deployment Pre-Check Script
 * Run this before deploying to verify everything is configured correctly
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = {
  passed: [],
  failed: [],
};

console.log("\n🔍 Vercel Deployment Pre-Check\n");
console.log("=".repeat(50));

// Check 1: API folder structure
console.log("\n✓ Checking API folder structure...");
const apiFiles = [
  "api/health.js",
  "api/categories/index.js",
  "api/categories/[id].js",
  "api/contacts/submit.js",
  "api/orders/index.js",
  "api/orders/[id].js",
];

apiFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    checks.passed.push(`API file: ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    checks.failed.push(`Missing API file: ${file}`);
  }
});

// Check 2: Configuration files
console.log("\n✓ Checking configuration files...");
const configFiles = [
  { name: "vercel.json", required: true },
  { name: "package.json", required: true },
  { name: ".env.example", required: true },
  { name: "vite.config.js", required: true },
  { name: ".vercelignore", required: false },
  { name: "API_DOCUMENTATION.md", required: false },
  { name: "VERCEL_DEPLOYMENT.md", required: false },
];

configFiles.forEach(({ name, required }) => {
  const filePath = path.join(__dirname, name);
  const exists = fs.existsSync(filePath);
  const icon = exists ? "✅" : required ? "❌" : "⚠️ ";
  console.log(`  ${icon} ${name}`);

  if (exists) {
    checks.passed.push(`Config file: ${name}`);
  } else if (required) {
    checks.failed.push(`Missing required file: ${name}`);
  }
});

// Check 3: package.json dependencies
console.log("\n✓ Checking package.json dependencies...");
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"),
  );

  const requiredDeps = [
    "firebase-admin",
    "nodemailer",
    "dotenv",
    "@vitejs/plugin-react",
  ];

  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`  ✅ ${dep}`);
      checks.passed.push(`Dependency: ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - NOT FOUND`);
      checks.failed.push(`Missing dependency: ${dep}`);
    }
  });
} catch (error) {
  console.log("  ❌ Error reading package.json");
  checks.failed.push("Cannot parse package.json");
}

// Check 4: Environment variables
console.log("\n✓ Checking .env file...");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log(`  ✅ .env file exists`);
  checks.passed.push(".env file exists");

  const envContent = fs.readFileSync(envPath, "utf-8");
  const requiredVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
    "ADMIN_EMAIL",
  ];

  requiredVars.forEach((variable) => {
    if (envContent.includes(`${variable}=`)) {
      console.log(`  ✅ ${variable} is defined`);
      checks.passed.push(`ENV variable: ${variable}`);
    } else {
      console.log(`  ❌ ${variable} - NOT DEFINED`);
      checks.failed.push(`Missing environment variable: ${variable}`);
    }
  });
} else {
  console.log(`  ⚠️  .env file not found (create from .env.example)`);
}

// Check 5: vite.config.js proxy
console.log("\n✓ Checking vite.config.js API proxy...");
try {
  const viteConfig = fs.readFileSync(
    path.join(__dirname, "vite.config.js"),
    "utf-8",
  );
  if (viteConfig.includes("proxy")) {
    console.log(`  ✅ API proxy configured`);
    checks.passed.push("Vite API proxy configured");
  } else {
    console.log(
      `  ⚠️  API proxy not configured (may need for local development)`,
    );
  }
} catch (error) {
  console.log("  ❌ Error reading vite.config.js");
}

// Check 6: Firebase configuration in vite.config or env
console.log("\n✓ Checking Firebase configuration...");
const envExamplePath = path.join(__dirname, ".env.example");
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf-8");
  const firebaseVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
  ];

  let hasFirebaseVars = 0;
  firebaseVars.forEach((variable) => {
    if (envExample.includes(variable)) {
      hasFirebaseVars++;
    }
  });

  if (hasFirebaseVars >= 3) {
    console.log(`  ✅ Firebase client configuration documented`);
    checks.passed.push("Firebase client config documented");
  } else {
    console.log(`  ❌ Firebase configuration incomplete`);
    checks.failed.push("Firebase configuration incomplete");
  }
}

// Check 7: vercel.json configuration
console.log("\n✓ Checking vercel.json...");
try {
  const vercelJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "vercel.json"), "utf-8"),
  );

  const checks7 = [];
  if (vercelJson.buildCommand) {
    console.log(`  ✅ Build command: ${vercelJson.buildCommand}`);
    checks7.push("buildCommand");
  }
  if (vercelJson.outputDirectory) {
    console.log(`  ✅ Output directory: ${vercelJson.outputDirectory}`);
    checks7.push("outputDirectory");
  }
  if (vercelJson.routes) {
    console.log(`  ✅ Routes configured (${vercelJson.routes.length} rules)`);
    checks7.push("routes");
  }
  if (vercelJson.env) {
    console.log(`  ✅ Environment variables placeholders defined`);
    checks7.push("env");
  }

  if (checks7.length === 4) {
    checks.passed.push("vercel.json properly configured");
  } else {
    checks.failed.push("vercel.json incomplete");
  }
} catch (error) {
  console.log("  ❌ Error reading vercel.json");
  checks.failed.push("Cannot parse vercel.json");
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("\n📊 Pre-Check Summary\n");
console.log(`✅ Passed: ${checks.passed.length} checks`);
console.log(`❌ Failed: ${checks.failed.length} checks`);

if (checks.failed.length > 0) {
  console.log("\n⚠️  Issues found:\n");
  checks.failed.forEach((issue) => {
    console.log(`  • ${issue}`);
  });
  console.log("\nPlease fix the above issues before deploying to Vercel.\n");
  process.exit(1);
} else {
  console.log("\n✅ All checks passed! Ready for Vercel deployment.\n");
  console.log("Next steps:");
  console.log("1. Verify environment variables in .env");
  console.log("2. Push code to GitHub/GitLab/Bitbucket");
  console.log("3. Connect repository to Vercel");
  console.log("4. Add environment variables in Vercel dashboard");
  console.log("5. Deploy and test\n");
  process.exit(0);
}
