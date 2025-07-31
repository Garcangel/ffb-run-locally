const fs = require("fs").promises;
const path = require("path");

function prettyPrintXml(xml) {
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, "$1\n$2$3");
  let pad = 0;
  xml.split("\n").forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 2;
    } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
      indent = 2;
    } else {
      indent = 0;
    }
    formatted += " ".repeat(pad) + node + "\n";
    pad += indent;
  });
  return formatted.trim();
}

async function downloadTeamXml(teamId) {
  const url = `https://fumbbl.com/xml:team?id=${teamId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching team XML`);
  const xml = await res.text();
  const prettyXml = prettyPrintXml(xml);
  const teamDir = path.join(__dirname, "../server/teams");
  await fs.mkdir(teamDir, { recursive: true });
  const filePath = path.join(teamDir, `${teamId}.xml`);
  await fs.writeFile(filePath, prettyXml, "utf8");
  console.log(`Team XML saved to ${filePath}`);
  return xml;
}

async function downloadRosterXml(rosterId) {
  const url = `https://fumbbl.com/xml:roster?id=${rosterId}&server=test`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching roster XML`);
  const xml = await res.text();
  const prettyXml = prettyPrintXml(xml);
  const rosterDir = path.join(__dirname, "../server/rosters");
  await fs.mkdir(rosterDir, { recursive: true });
  const filePath = path.join(rosterDir, `${rosterId}.xml`);
  await fs.writeFile(filePath, prettyXml, "utf8");
  console.log(`Roster XML saved to ${filePath}`);
}

async function main() {
  const teamId = process.argv[2];
  if (!teamId) {
    console.error("Usage: node fumbblTeamDownload.js <teamId>");
    process.exit(1);
  }
  const xml = await downloadTeamXml(teamId);

  const match = xml.match(/<rosterId>(\d+)<\/rosterId>/);
  if (match) {
    const rosterId = match[1];
    await downloadRosterXml(rosterId);
  } else {
    console.warn("Could not find <rosterId> in team XML.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// usage
// node fumbblTeamDownload.js 1111158
