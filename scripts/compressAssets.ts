import fsExtra from "fs-extra";
import { join, resolve } from "path";
import { Logger } from "./utils";

const root = join(__dirname, "../");
const folders = ["animations", "models"];

// Function to recursively get all files in a directory
const getAllFiles = (
  dirPath: string,
  arrayOfFiles: string[] = []
): string[] => {
  const files = fsExtra.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = join(dirPath, file);
    if (fsExtra.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

(async () => {
  for (const folder of folders) {
    const path = join(root, folder);
    if (!fsExtra.existsSync(path)) {
      console.error(`Folder ${path} does not exist!`);
      return process.exit(1);
    }

    const files = getAllFiles(path);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const json = fsExtra.readJSONSync(file);
      // Compress the file
      fsExtra.writeJSONSync(file, json, { spaces: 0 });
      Logger.info(`Compressed ${file}`);
    }
  }
})();
