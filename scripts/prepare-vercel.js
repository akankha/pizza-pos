const fs = require("fs");
const path = require("path");

// Copy server/dist to api/dist after build
const sourceDir = path.join(__dirname, "..", "server", "dist");
const targetDir = path.join(__dirname, "..", "api", "dist");

console.log("=== PREPARE VERCEL SCRIPT ===");
console.log("Source:", sourceDir);
console.log("Target:", targetDir);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error("❌ ERROR: Source directory does not exist:", src);
    console.log("Current directory:", __dirname);
    console.log(
      "Directory contents:",
      fs.readdirSync(path.join(__dirname, ".."))
    );
    process.exit(1);
  }

  console.log("✅ Source directory exists");

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log("✅ Created target directory");
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  console.log(`📁 Copying ${entries.length} items...`);

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  📄 ${entry.name}`);
    }
  }
}

console.log("🚀 Starting copy...");
copyDir(sourceDir, targetDir);
console.log("✅ Copy complete!");
console.log("Verifying api/dist exists:", fs.existsSync(targetDir));
if (fs.existsSync(targetDir)) {
  console.log("Files in api/dist:", fs.readdirSync(targetDir));
}
