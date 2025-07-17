// spectate.js
// Usage: node spectate.js
// Custom coach: node spectate.js Garcangel
const { spawn } = require("child_process");
const path = require("path");

// Default coach name
const coach = process.argv[2] || "Testito";
const clientDir = path.join(__dirname, "client"); // Adjust if needed

// Platform-specific classpath separator
const cpSep = process.platform === "win32" ? ";" : ":";

const cp =
  "FantasyFootballClient.jar" +
  cpSep +
  "FantasyFootballClientResources.jar" +
  cpSep +
  "lib/*";

const args = [
  "-cp",
  cp,
  "com.fumbbl.ffb.client.FantasyFootballClientAwt",
  "-spectator",
  "-coach",
  coach,
  "-server",
  "localhost",
  "-port",
  "22227",
];

const proc = spawn("java", args, { cwd: clientDir, stdio: "inherit" });
proc.on("exit", (code) => {
  console.log(`Spectator client exited with code ${code}`);
});
