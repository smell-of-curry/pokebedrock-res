import fs from "fs";
import fsExtra from "fs-extra";
import archiver from "archiver";
import path from "path";
import sharp from "sharp";
import { removeComments } from "./utils";

/**
 * Files/Directories to exclude from build.
 */
const exclude = [
  ".github",
  ".vscode",
  ".git",
  "logs",
  "node_modules",
  "scripts",
  ".gitattributes",
  ".gitignore",
  ".mcattributes",
  "missing_info.md",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
];

/**
 * Adds a path to a archive, and compressing files.
 * @param pathToAdd
 * @param archive
 */
async function addPathToArchive(
  pathToAdd: string,
  archive: archiver.Archiver
): Promise<void> {
  if (fs.lstatSync(pathToAdd).isDirectory()) {
    const items = fs.readdirSync(pathToAdd);
    for (const item of items) {
      await addPathToArchive(path.join(pathToAdd, item), archive);
    }
  } else {
    const ext = pathToAdd.split(".").pop();

    if (ext === "json" || ext === "material") {
      // Compress JSON file
      try {
        const fileContents = fsExtra.readFileSync(pathToAdd, "utf-8");
        const commentsRemoved = removeComments(fileContents);
        const parsedJson = JSON.parse(commentsRemoved);
        const compressedContents = JSON.stringify(parsedJson);

        // Add the compressed JSON content as a temporary file
        archive.append(compressedContents, { name: pathToAdd });
      } catch (error) {
        console.error(`Error compressing ${pathToAdd}:`, error);
      }
    } else if (ext === "png") {
      // Compress PNG file
      try {
        const compressedBuffer = await sharp(pathToAdd)
          .png({
            effort: 10,
            compressionLevel: 9,
            quality: 100,
          })
          .toBuffer();

        // Add the compressed PNG content as a temporary file in memory
        archive.append(compressedBuffer, { name: pathToAdd });
      } catch (error) {
        console.error(`Error compressing ${pathToAdd}:`, error);
      }
    } else {
      archive.file(pathToAdd, { name: pathToAdd });
    }
  }
}

/**
 * Pipes all files in the current directory to a zip file.
 * @param fileName
 */
async function pipeToFile(outputFileName: string) {
  if (fs.existsSync(outputFileName)) fs.unlinkSync(outputFileName);

  const output = fs.createWriteStream(outputFileName);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(archive.pointer() + " total bytes");
    console.log((archive.pointer() / 1024 ** 2).toFixed(2) + "MB");
    console.log(`Pack Archive created for ${outputFileName}!`);
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

  const paths = fs.readdirSync(".");

  for (const path of paths) {
    if (exclude.includes(path)) continue;
    if (path.startsWith(outputFileName.split(".")[0])) continue;
    console.log(`Adding ${path} to '${outputFileName}'...`);

    await addPathToArchive(path, archive);
  }

  archive.pipe(output);
  await archive.finalize();
}

(async () => {
  if (!fs.existsSync("manifest.json")) {
    console.error("manifest.json not found.");
    process.exit(1);
  }

  try {
    const manifest = fsExtra.readJsonSync("manifest.json", "utf8");
    const version = manifest.header.version.join(".");
    const fileName = `PokeBedrock RES ${version}`;

    await pipeToFile(`${fileName}.mcpack`);
    await pipeToFile(`${fileName}.zip`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
