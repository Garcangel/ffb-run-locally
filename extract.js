// tools/extract.js

const path = require("path");
const fs = require("fs");
const AdmZip = require("adm-zip");

// Usage: node extract.js [path/to/repo]
// Default repo path is '../cloneTest'
const repoRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../cloneTest/ffb");

// ZIP locations in repo
const serverZip = path.join(repoRoot, "ffb-server/target/ffb-server.zip");
const clientZip = path.join(repoRoot, "ffb-client/target/ffb-client.zip");

// Extraction destinations (relative to tools/)
const destServer = path.join(__dirname, "./server");
const destClient = path.join(__dirname, "./client");

function extractZip(zipPath, destDir) {
  if (!fs.existsSync(zipPath)) {
    console.error(`File not found: ${zipPath}`);
    process.exit(1);
  }
  // Clear destination dir (optional, comment if not wanted)
  // if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });

  // Ensure destination dir exists
  fs.mkdirSync(destDir, { recursive: true });

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  console.log(`Extracted ${zipPath} -> ${destDir}`);
}

extractZip(serverZip, destServer);
extractZip(clientZip, destClient);

console.log("Extraction complete.");
