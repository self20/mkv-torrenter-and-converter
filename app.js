const readline = require("readline");
const fs = require("fs-extra")
const hbjs = require("handbrake-js");
const execSync = require("child_process").execSync;
const colors = require("colors");
const config = require("./config");
const outputPath = config.outputPath;
const tempPath = config.tempPath;
const ariaPath = config.ariac2Path;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
fs.ensureDir(tempPath);
fs.ensureDir(outputPath);
if (!aria2cExists()) {
  console.log("Require aria2c, download or check config path".red);
  process.exit(1);
}
rl.question('Enter magnet uri (Leave empty for only convert): ', (magnet) => {
  downloadTorrent(magnet);
  let firstMkv = getFirstMkv();
  if (!firstMkv) {
    console.log("No mkv video found in temp".red);
    process.exit(1);
  }
  let inputFile = tempPath + firstMkv;
  let outputFile = outputPath + firstMkv.replace(".mkv", ".mp4");
  let options = {
    input: inputFile,
    output: outputFile,
    aencoder: "mp3",
    preset: "Normal",
    subtitle: "1",
    "subtitle-burned": ""
  };
  var prevProgress = 0;
  hbjs.spawn(options)
    .on("end", () => {
      console.log(("TIME TO WATCH SOME " + firstMkv.replace(".mkv", "").toUpperCase() + " !").rainbow);
      fs.unlinkSync(inputFile);
      process.exit(0);
    })
    .on("begin", () => {
      console.log("Begin conversion".yellow);
    })
    .on("error", (err) => {
      console.log(err.toString().red);
      process.exit(1);
    })
    .on("progress", (progress) => {
      let percentComplete = Math.floor(progress.percentComplete);
      let eta = progress.eta;
      if (prevProgress !== percentComplete) {
        prevProgress = percentComplete;
        console.log("%s%, ETA: %s", prevProgress, eta);
      }
    })
    .on("complete", () => {
      console.log("Unexpected error, try again".red);
      process.exit(1);
    });
});

function downloadTorrent(magnet) {
  if (magnet) {
    fs.emptyDirSync(tempPath);
    let execString = config.ariac2Path + "aria2c \"" + magnet + "\" --seed-time=0 --dir=temp";
    try {
      console.log("Begin torrenting".yellow);
      execSync(execString, { stdio: [0, 1, 2] });
    }
    catch (e) {
      process.exit(-1);
    }
    console.log("Torrenting complete!".green);
  }
  else {
    console.log("No torrent specified, converting first video in temp".yellow);
  }
}
function getFirstMkv() {
  let tempFiles = fs.readdirSync(tempPath);
  let tempMkvFiles = tempFiles.filter((file) => {
    return file.endsWith(".mkv");
  });
  return tempMkvFiles[0] ? tempMkvFiles[0] : null;
}

function aria2cExists() {
  return fs.existsSync(config.ariac2Path + "aria2c.exe");
}