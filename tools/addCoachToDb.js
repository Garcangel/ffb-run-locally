// tools/addCoachToDb.js
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

function parseIni(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
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

async function main() {
  const [coachName, password] = process.argv.slice(2);
  if (!coachName || !password) {
    console.error("Usage: node addCoachToDb.js <coachName> <password>");
    process.exit(1);
  }
  const iniPath = path.join(__dirname, "../server/server.ini");
  const ini = parseIni(iniPath);
  const dbConfig = getDbConfigFromIni(ini);

  const md5pass = crypto.createHash("md5").update(password).digest("hex");

  const db = await mysql.createConnection(dbConfig);
  const [rows] = await db.execute(
    "SELECT * FROM ffb_coaches WHERE name = ? LIMIT 1",
    [coachName]
  );
  if (rows.length) {
    console.log(`Coach "${coachName}" already exists.`);
    await db.end();
    process.exit(0);
  }
  await db.execute("INSERT INTO ffb_coaches (name, password) VALUES (?, ?)", [
    coachName,
    md5pass,
  ]);
  await db.end();
  console.log(`Coach "${coachName}" added with MD5 password: ${md5pass}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
