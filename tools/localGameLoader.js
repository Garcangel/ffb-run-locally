// ---- requires Node18+ for fetch, plus mysql2 ----
const fs = require("fs").promises;
const path = require("path");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const teams = require("../local-teams.json");
const { spawn } = require("child_process");
const prettyPrintXml = require("./prettyPrintXml");

// ---- ini parser (reuse from above) ----
function parseIni(filePath) {
  const data = require("fs").readFileSync(filePath, "utf8");
  const lines = data.split(/\r?\n/);
  const obj = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    obj[key] = val;
  }
  return obj;
}

function getDbConfigFromIni(ini) {
  let host = "localhost",
    database = "ffb";
  if (ini["db.url"]) {
    const m = ini["db.url"].match(/jdbc:mysql:\/\/([^\/]+)\/(.+)/);
    if (m) {
      host = m[1];
      database = m[2];
    }
  }
  return {
    host,
    user: ini["db.user"] || "root",
    password: ini["db.password"] || "",
    database,
  };
}

async function ensureCoachInDb(dbConfig, coach, password) {
  const db = await mysql.createConnection(dbConfig);
  const [rows] = await db.execute(
    "SELECT * FROM ffb_coaches WHERE name = ? LIMIT 1",
    [coach]
  );
  if (!rows.length) {
    const md5pass = crypto.createHash("md5").update(password).digest("hex");
    await db.execute("INSERT INTO ffb_coaches (name, password) VALUES (?, ?)", [
      coach,
      md5pass,
    ]);
    console.log(`Coach "${coach}" added with MD5 password: ${md5pass}`);
    await db.end();
    return md5pass;
  } else {
    // Return existing hash
    await db.end();
    return rows[0].password;
  }
}

async function ensureTeamAndRoster(teamId) {
  let downloaded = false;
  // Team
  const teamDir = path.join(__dirname, "../server/teams");
  const teamPath = path.join(teamDir, `${teamId}.xml`);
  let xml;
  try {
    await fs.access(teamPath);
    xml = await fs.readFile(teamPath, "utf8");
  } catch {
    const url = `https://fumbbl.com/xml:team?id=${teamId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch team ${teamId} failed`);
    xml = await res.text();
    const prettyXml = prettyPrintXml(xml);
    await fs.mkdir(teamDir, { recursive: true });
    await fs.writeFile(teamPath, prettyXml, "utf8");
    console.log(`Team XML for ${teamId} downloaded.`);
    downloaded = true;
  }

  // Roster
  const m = xml.match(/<rosterId>(\d+)<\/rosterId>/);
  if (!m) throw new Error(`No <rosterId> found in team XML for ${teamId}`);
  const rosterId = m[1];
  const rosterDir = path.join(__dirname, "../server/rosters");
  const rosterPath = path.join(rosterDir, `${rosterId}.xml`);
  try {
    await fs.access(rosterPath);
  } catch {
    const url = `https://fumbbl.com/xml:roster?id=${rosterId}&server=test`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch roster ${rosterId} failed`);
    const xml = await res.text();
    const prettyXml = prettyPrintXml(xml);
    await fs.mkdir(rosterDir, { recursive: true });
    await fs.writeFile(rosterPath, prettyXml, "utf8");
    console.log(`Roster XML for ${rosterId} downloaded.`);
    downloaded = true;
  }
  return { xml, downloaded };
}

function getTeamNameFromXml(xml) {
  const m = xml.match(/<name>([^<]+)<\/name>/);
  return m ? m[1] : undefined;
}

module.exports = async function (teamIdx) {
  const team = teams[teamIdx];
  if (!team) {
    console.error(`No team at index ${teamIdx} in local-teams.json`);
    process.exit(1);
  }
  const clientDir = path.join(__dirname, "../client");
  const iniPath = path.join(__dirname, "../server/server.ini");
  const ini = parseIni(iniPath);
  const dbConfig = getDbConfigFromIni(ini);

  let restartNeeded = false;
  // Modified ensureTeamAndRoster returns {xml, downloaded}
  const { xml, downloaded } = await ensureTeamAndRoster(team.id);
  if (downloaded) restartNeeded = true;
  team.name = getTeamNameFromXml(xml);
  team.md5 = await ensureCoachInDb(dbConfig, team.coach, team.password);

  if (restartNeeded) {
    console.log(
      "\n=== STOP ===\nOne or more teams/rosters were downloaded. Please RESTART the server, then re-run this script.\n"
    );
    process.exit(1);
  }

  // Use platform-specific classpath separator
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
    "-player",
    "-coach",
    team.coach,
    "-teamId",
    team.id,
    "-teamName",
    team.name,
    "-server",
    "localhost",
    "-port",
    "22227",
    "-auth",
    team.md5,
  ];
  const proc = spawn("java", args, { cwd: clientDir, stdio: "inherit" });
  proc.on("exit", (code) => {
    console.log(`${team.coach} client exited with code ${code}`);
  });
};
