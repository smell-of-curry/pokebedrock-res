import fsExtra from "fs-extra";
import path from "path";
import readline from "readline";
import { removeCommentsFromJSON } from "./utils";

/** Default Windows path where Minecraft Bedrock ships resource pack materials */
const DEFAULT_VANILLA_RP_DIR =
  "C:\\XboxGames\\Minecraft for Windows\\Content\\data\\resource_packs";

/** Relative output path for the generated types file */
const GENERATED_TYPES_RELATIVE_PATH = path.join(
  "scripts",
  "data",
  "material.types.ts"
);

/** Relative path to the project's custom materials directory */
const CUSTOM_MATERIALS_RELATIVE_DIR = path.join("materials");

/**
 * Prompt the user for input on the terminal.
 * @param question The prompt question to display.
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Recursively walk a directory and collect absolute file paths matching a predicate.
 * @param rootDir Directory to walk
 * @param isMatch Function that returns true for files to include
 */
async function walkFiles(
  rootDir: string,
  isMatch: (filePath: string) => boolean
): Promise<string[]> {
  const results: string[] = [];
  async function walk(current: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let entries: any[];
    try {
      entries = await fsExtra.readdir(current, { withFileTypes: true });
    } catch (err) {
      // Skip directories we cannot read
      return;
    }
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory && entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile && entry.isFile() && isMatch(fullPath)) {
          results.push(fullPath);
        }
      })
    );
  }
  await walk(rootDir);
  return results;
}

/**
 * Extract material IDs from a .material JSON file.
 *
 * Expected structure:
 * {
 *   "materials": {
 *     "version": "1.0.0",
 *     "<material_id>": { ... },
 *     ...
 *   }
 * }
 *
 * @param materialFile Absolute path to a .material file
 */
async function extractMaterialIdsFromFile(
  materialFile: string
): Promise<string[]> {
  try {
    const raw = await fsExtra.readFile(materialFile, "utf8");
    const commentsRemoved = removeCommentsFromJSON(raw);
    const json = JSON.parse(commentsRemoved);
    const materialsObj = json?.materials;
    if (!materialsObj || typeof materialsObj !== "object") return [];
    const ids = Object.keys(materialsObj).filter((k) => k !== "version");
    // Only include IDs whose values are objects (skip any stray metadata keys)
    return ids
      .filter((id) => typeof materialsObj[id] === "object")
      .map((id) => id.split(":")[0] ?? "");
  } catch {
    // Ignore malformed files and continue
    return [];
  }
}

/**
 * Recursively collect all material IDs from .material files within a directory.
 * @param baseDir Directory to scan recursively
 */
async function collectMaterialIds(baseDir: string): Promise<string[]> {
  const exists = await pathExists(baseDir);
  if (!exists) return [];
  const files = await walkFiles(baseDir, (f) =>
    f.toLowerCase().endsWith(".material")
  );
  const all: string[] = [];
  for (const f of files) {
    const ids = await extractMaterialIdsFromFile(f);
    all.push(...ids);
  }
  // De-duplicate and sort
  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}

/**
 * Ensure a path exists on disk
 * @param p - The path to check
 */
async function pathExists(p: string): Promise<boolean> {
  try {
    await fsExtra.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse previously generated VanillaMaterial union from scripts/data/material.types.ts
 * If file or type block is missing, returns an empty array.
 * @param generatedFileAbsPath - The path to the generated file
 */
async function readPriorVanillaMaterials(
  generatedFileAbsPath: string
): Promise<string[]> {
  const exists = await pathExists(generatedFileAbsPath);
  if (!exists) return [];
  try {
    const content = await fsExtra.readFile(generatedFileAbsPath, "utf8");
    // Match: export type VanillaMaterial = ...;
    const typeRegex = /export\s+type\s+VanillaMaterial\s*=\s*([\s\S]*?);/m;
    const match = content.match(typeRegex);
    if (!match) return [];
    const body = match[1];
    // Extract all string literals inside the union
    const literalRegex = /"([^"]+)"|'([^']+)'/g;
    const materials: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = literalRegex.exec(body ?? ""))) {
      const val = m[1] ?? m[2];
      if (val) materials.push(val);
    }
    return Array.from(new Set(materials)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/**
 * Render a union type from a list of string literals. Returns `never` if empty.
 * @param literals - The list of string literals
 * @param indent - The indent to use
 */
function renderStringUnionType(
  literals: string[],
  indent: string = ""
): string {
  if (literals.length === 0) return "never";
  const joined = literals.map((m) => `${indent}| "${m}"`).join("\n");
  return `\n${joined}`;
}

/**
 * Generate the contents of scripts/data/material.types.ts
 * @param vanillaMaterials - The list of vanilla materials
 * @param customMaterials - The list of custom materials
 */
function generateTypesFileContent(
  vanillaMaterials: string[],
  customMaterials: string[]
): string {
  const now = new Date().toISOString();
  const vanillaTypeBody = renderStringUnionType(vanillaMaterials, "  ");
  const customTypeBody = renderStringUnionType(customMaterials, "  ");

  return `/**
 * DO NOT EDIT THIS FILE DIRECTLY.
 * This file is AUTO-GENERATED by scripts/generateMaterialTypes.ts
 * Generation time: ${now}
 *
 * Re-generate using your package script, e.g.:
 *   npm run generateMaterialTypes
 */

/**
 * Vanilla Minecraft Bedrock material identifiers.
 * Extracted from the installed resource pack .material files.
 */
export type VanillaMaterial =${vanillaTypeBody};

/**
 * Custom material identifiers defined under the project's ./materials directory.
 */
export type CustomMaterial =${customTypeBody};

/**
 * Any material identifier known to this project (vanilla or custom).
 */
export type MaterialId = VanillaMaterial | CustomMaterial;
`;
}

async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const outFileAbsPath = path.join(projectRoot, GENERATED_TYPES_RELATIVE_PATH);
  const outDir = path.dirname(outFileAbsPath);
  await fsExtra.mkdir(outDir, { recursive: true });

  // 1) Ask user for vanilla materials path or skip
  const answer = await prompt(
    `Enter path to Minecraft resource_packs directory\n` +
      ` - Press Enter for default: ${DEFAULT_VANILLA_RP_DIR}\n` +
      ` - Type "skip" to reuse prior VanillaMaterial from ${GENERATED_TYPES_RELATIVE_PATH}\n` +
      `> `
  );

  let vanillaMaterials: string[] = [];
  if (answer.toLowerCase() === "skip") {
    vanillaMaterials = await readPriorVanillaMaterials(outFileAbsPath);
    if (vanillaMaterials.length === 0) {
      // eslint-disable-next-line no-console
      console.error(
        `No prior VanillaMaterial definitions found. Proceeding with an empty set.`
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `Reused ${vanillaMaterials.length} VanillaMaterial identifiers from prior generated file.`
      );
    }
  } else {
    const chosenPath = answer === "" ? DEFAULT_VANILLA_RP_DIR : answer;
    const exists = await pathExists(chosenPath);
    if (!exists) {
      // eslint-disable-next-line no-console
      console.error(
        `Path not found: ${chosenPath}. Proceeding with empty VanillaMaterial set.`
      );
      vanillaMaterials = [];
    } else {
      // eslint-disable-next-line no-console
      console.log(`Scanning vanilla materials under: ${chosenPath}`);
      vanillaMaterials = await collectMaterialIds(chosenPath);
      // eslint-disable-next-line no-console
      console.log(`Discovered ${vanillaMaterials.length} vanilla materials.`);
    }
  }

  // 2) Collect custom materials under ./materials
  const customDir = path.join(projectRoot, CUSTOM_MATERIALS_RELATIVE_DIR);
  const customMaterials = await collectMaterialIds(customDir);
  // eslint-disable-next-line no-console
  console.log(
    `Discovered ${customMaterials.length} custom materials under .${path.sep}materials`
  );

  // 3) Generate the types file
  const fileContent = generateTypesFileContent(
    vanillaMaterials,
    customMaterials
  );
  await fsExtra.writeFile(outFileAbsPath, fileContent, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${GENERATED_TYPES_RELATIVE_PATH}`);
}

// Run
main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
