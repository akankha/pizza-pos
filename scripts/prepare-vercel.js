const fs = require("fs");
const path = require("path");

// Copy server/dist to api/dist after build
const sourceDir = path.join(__dirname, "..", "server", "dist");
const targetDir = path.join(__dirname, "..", "api", "dist");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error("Source directory does not exist:", src);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Copying server/dist to api/dist...");
copyDir(sourceDir, targetDir);
console.log("Copy complete!");
