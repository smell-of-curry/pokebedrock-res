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

(async () => {
  try {
    if (!fs.existsSync("manifest.json")) {
      console.error("manifest.json not found.");
      process.exit(1);
    }
    const manifest = fsExtra.readJsonSync("manifest.json", "utf8");
    const version = manifest.header.version.join(".");
    const fileName = `PokeBedrock RES ${version}`;
    const filePath = `${fileName}.mcpack`;

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const output = fs.createWriteStream(filePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(archive.pointer() + " total bytes");
      console.log((archive.pointer() / 1024 ** 2).toFixed(2) + "MB");
      console.log(`MCPack created for version: ${version}`);
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
      if (content.includes(fileName)) continue;
      const contentPath = path.join(content);

      if (fs.lstatSync(contentPath).isDirectory()) {
        archive.directory(contentPath, content);
      } else {
        archive.file(contentPath, { name: content });
      }
    }

    archive.pipe(output);
    await archive.finalize();

    fs.copyFileSync(filePath, `tmp-${fileName}.mcpack`);
    fs.renameSync(`tmp-${fileName}.mcpack`, `${fileName}.zip`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
