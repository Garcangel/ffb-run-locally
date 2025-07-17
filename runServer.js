const { spawn } = require("child_process");
const path = require("path");
const serverDir = path.join(__dirname, "server");

const jar = "FantasyFootballServer.jar";
const lib = "lib/*";
const ini = "server.ini";

// Use correct classpath separator for platform
const cpSep = process.platform === "win32" ? ";" : ":";

const javaArgs = [
  "-cp",
  `${jar}${cpSep}${lib}`,
  "com.fumbbl.ffb.server.FantasyFootballServer",
  "standalone",
  "-inifile",
  ini,
];

// Windows: use 'cmd' to support ';' in classpath
const isWin = process.platform === "win32";
const cmd = isWin ? "cmd" : "java";
const args = isWin ? ["/c", "java", ...javaArgs] : javaArgs;

const proc = spawn(cmd, args, {
  cwd: serverDir,
  stdio: "inherit",
});

proc.on("close", (code) => {
  console.log(`Server exited with code ${code}`);
});
