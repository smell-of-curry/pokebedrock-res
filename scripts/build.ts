import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import archiver from "archiver";

/**
 * Files/Directories to exclude from build.
 */
const exclude = [
  ".github",
  ".vscode",
  ".git",
  "generator",
  "node_modules",
  ".gitattributes",
  ".gitignore",
  ".mcattributes",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
];

/**
 * Pipes all files in the current directory to a zip file.
 * @param filePath
 */
async function pipeToFile(filePath: string) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const output = fs.createWriteStream(filePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(archive.pointer() + " total bytes");
    console.log((archive.pointer() / 1024 ** 2).toFixed(2) + "MB");
    console.log(`Pack Archive created for ${filePath}!`);
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  const contents = fs.readdirSync(".").filter((v) => !exclude.includes(v));

  for (const content of contents) {
    if (content.includes(filePath)) continue;
    console.log(`Adding ${content} to '${filePath}'...`);

    if (fs.lstatSync(content).isDirectory()) {
      archive.directory(content, content);
    } else {
      archive.file(content, { name: content });
    }
  }

  archive.pipe(output);
  await archive.finalize();
}

(async () => {
  try {
    if (!fs.existsSync("manifest.json")) {
      console.error("manifest.json not found.");
      process.exit(1);
    }
    const manifest = fsExtra.readJsonSync("manifest.json", "utf8");
    const version = manifest.header.version.join(".");
    const fileName = `PokeBedrock RES ${version}`;

    pipeToFile(`${fileName}.mcpack`);
    pipeToFile(`${fileName}.zip`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
