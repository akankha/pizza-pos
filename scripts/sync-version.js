const fs = require("fs");
const path = require("path");

// Read version from root package.json
const rootPackage = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);

const version = rootPackage.version;
const author = rootPackage.author;

console.log(`📦 Syncing version ${version} across all files...`);

// Update shared/version.ts
const versionTsPath = path.join(__dirname, "..", "shared", "version.ts");
const versionTsContent = `export const APP_VERSION = "${version}";
export const APP_NAME = "Pizza POS";
export const DEVELOPER = {
  name: "${author.name}",
  email: "${author.email}",
  website: "${author.url}",
};
export const COPYRIGHT = \`Copyright © 2024-2025 \${DEVELOPER.name}. All rights reserved.\`;
export const BUILD_DATE = new Date().toISOString();
`;
fs.writeFileSync(versionTsPath, versionTsContent, "utf8");
console.log("✅ Updated shared/version.ts");

// Update electron/main.js version
const electronMainPath = path.join(__dirname, "..", "electron", "main.js");
let electronMainContent = fs.readFileSync(electronMainPath, "utf8");
electronMainContent = electronMainContent.replace(
  /const APP_VERSION = "[^"]*";/,
  `const APP_VERSION = "${version}";`
);
electronMainContent = electronMainContent.replace(
  /const DEVELOPER = "[^"]*";/,
  `const DEVELOPER = "${author.name}";`
);
electronMainContent = electronMainContent.replace(
  /const DEVELOPER_WEBSITE = "[^"]*";/,
  `const DEVELOPER_WEBSITE = "${author.url}";`
);
fs.writeFileSync(electronMainPath, electronMainContent, "utf8");
console.log("✅ Updated electron/main.js");

// Update client package.json
const clientPackagePath = path.join(__dirname, "..", "client", "package.json");
const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, "utf8"));
clientPackage.version = version;
clientPackage.author = author;
fs.writeFileSync(
  clientPackagePath,
  JSON.stringify(clientPackage, null, 2) + "\n",
  "utf8"
);
console.log("✅ Updated client/package.json");

// Update server package.json
const serverPackagePath = path.join(__dirname, "..", "server", "package.json");
const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, "utf8"));
serverPackage.version = version;
serverPackage.author = author;
fs.writeFileSync(
  serverPackagePath,
  JSON.stringify(serverPackage, null, 2) + "\n",
  "utf8"
);
console.log("✅ Updated server/package.json");

console.log(`\n🎉 Version ${version} synced successfully across all files!`);
console.log(`\n📝 To release version ${version}:`);
console.log("   1. Commit all changes");
console.log("   2. Run: git tag v" + version);
console.log("   3. Run: git push && git push --tags");
console.log("   4. Build Electron: npm run electron:build:full");
console.log("   5. Deploy web: npm run deploy:hostinger");
