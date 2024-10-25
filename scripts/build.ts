import fs from "fs";
import fsExtra from "fs-extra";
import archiver from "archiver";
import path from "path";
import sharp from "sharp";
import ProgressBar from "progress";
import {
  countFilesRecursively,
  removeCommentsFromJSON,
  removeCommentsFromLang,
} from "./utils";

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
  "pokemon.json",
];

/**
 * Will be the resulting `contents.json` file.
 */
const contents: { content: { path: string }[] } = { content: [] };

/**
 * A path to all the textures inside `./textures` directory.
 * Used to generate `textures_list.json`
 */
const textures: string[] = [];

/**
 * Adds a path to a archive, and compressing files.
 * @param pathToAdd
 * @param archive
 */
async function addPathToArchive(
  pathToAdd: string,
  archive: archiver.Archiver,
  progress?: ProgressBar
): Promise<void> {
  const pathStat = await fs.promises.lstat(pathToAdd);
  const parsedPath = pathToAdd.replace(/\\/g, "/");

  if (pathStat.isDirectory()) {
    const items = await fs.promises.readdir(pathToAdd);
    for (const item of items) {
      await addPathToArchive(path.join(pathToAdd, item), archive, progress);
    }
  } else if (pathStat.isFile()) {
    contents.content.push({ path: parsedPath });
    const ext = pathToAdd.split(".").pop();

    if (ext === "json") {
      // Compress JSON file
      try {
        const fileContents = await fsExtra.readFile(pathToAdd, "utf-8");
        const commentsRemoved = removeCommentsFromJSON(fileContents);
        const parsedJson = JSON.parse(commentsRemoved);
        const compressedContents = JSON.stringify(parsedJson);

        // Add the compressed JSON content as a temporary file
        archive.append(compressedContents, { name: pathToAdd });
      } catch (error) {
        console.error(`Error compressing JSON: ${pathToAdd}:`, error);
      }
    } else if (ext === "png") {
      if (pathToAdd.startsWith("textures")) textures.push(parsedPath);

      // Compress PNG file
      try {
        const compressedBuffer = await sharp(pathToAdd).png().toBuffer();

        // Add the compressed PNG content as a temporary file in memory
        archive.append(compressedBuffer, { name: pathToAdd });
      } catch (error) {
        console.error(`Error compressing PNG: ${pathToAdd}:`, error);
      }
    } else if (ext === "material") {
      try {
        const fileContents = await fsExtra.readFile(pathToAdd, "utf-8");
        const commentsRemoved = removeCommentsFromJSON(fileContents);
        const parsedJson = JSON.parse(commentsRemoved);
        let compressedContents = JSON.stringify(parsedJson, null, 2);

        // Replace Unix line endings with CRLF (Windows-style)
        compressedContents = compressedContents.replace(/\n/g, "\r\n");

        // Add the parsed Material content as a temporary file
        archive.append(compressedContents, { name: pathToAdd });
      } catch (error) {
        console.error(`Error parsing JSON (material): ${pathToAdd}:`, error);
      }
    } else if (ext === "lang") {
      // Lang can have comments, and extra spaces, we want to remove those
      try {
        const fileContents = await fsExtra.readFile(pathToAdd, "utf-8");
        const commentsRemoved = removeCommentsFromLang(fileContents);
        const compressedContents = commentsRemoved;

        // Add the compressed Lang content as a temporary file
        archive.append(compressedContents, { name: pathToAdd });
      } catch (error) {
        console.error(`Error compressing Lang: ${pathToAdd}:`, error);
      }
    } else {
      archive.file(pathToAdd, { name: pathToAdd });
    }

    progress?.tick();
  } else {
    console.warn(`[WARN] Unknown path type: ${pathToAdd}`);
  }
}

/**
 * Pipes all files in the current directory to a zip file.
 * @param fileName
 */
async function pipeToFiles(outputFileNames: string[]) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  const outputs: fs.WriteStream[] = [];
  for (const outputFileName of outputFileNames) {
    if (fs.existsSync(outputFileName)) fs.unlinkSync(outputFileName);
    const output = fs.createWriteStream(outputFileName);

    output.on("close", () => {
      console.log(`Pack Archive created for ${outputFileName}!`);
      console.log(" -" + archive.pointer() + " total bytes");
      console.log(" -" + (archive.pointer() / 1024 ** 2).toFixed(2) + "MB");
    });

    outputs.push(output);
  }

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
    if (
      outputFileNames.some((outputFileName) =>
        path.startsWith(outputFileName.split(".")[0])
      )
    )
      continue;

    if (fs.lstatSync(path).isDirectory()) {
      const totalFiles = countFilesRecursively(path);
      console.log(`Adding ${totalFiles}x files from '${path}' ...`);

      // Initialize the progress bar
      const progress = new ProgressBar("Archiving [:bar] :percent :etas", {
        total: totalFiles,
        width: 40,
        complete: "=",
        incomplete: " ",
        renderThrottle: 16,
      });

      await addPathToArchive(path, archive, progress);
    } else {
      await addPathToArchive(path, archive);
    }
  }

  archive.append(JSON.stringify(contents), { name: "contents.json" });
  archive.append(JSON.stringify(textures), {
    name: "textures/textures_list.json",
  });
  for (const output of outputs) archive.pipe(output);
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

    await pipeToFiles([`${fileName}.zip`, `${fileName}.mcpack`]);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
