const startTeam = require("./tools/localGameLoader");

// Usage:
// node startGames          => launches both teams
// node startGames 1        => launches team 1 (index 0)
// node startGames 2        => launches team 2 (index 1)
// NOTE: This script reads team/player info from ./local-teams.json
// Edit local-teams.json to configure the teams, coach names, and passwords to launch.

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    // No args: start both
    await startTeam(0);
    await startTeam(1);
  } else if (arg === "1" || arg === "2") {
    await startTeam(Number(arg) - 1);
  } else {
    console.error("Usage: node startGames [1|2]");
    process.exit(1);
  }
}

main();
