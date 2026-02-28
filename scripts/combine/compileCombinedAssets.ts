import fs from "fs";
import path from "path";
import isEqual from "lodash/isEqual";
import { removeCommentsFromJSON, Logger } from "../utils";
import { COMPILE_EXCEPTIONS } from "../data/compileExceptions";

// ── Types ────────────────────────────────────────────────────────────────────

export interface GeneratedEntry {
  /** Relative path inside the archive (forward-slash separated). */
  archivePath: string;
  /** Stringified content ready to append to the archive. */
  content: string;
}

export interface CombineResult {
  /** Virtual files to inject into the archive. */
  generatedEntries: GeneratedEntry[];
  /** Original on-disk paths (relative, forward-slash) the archiver must skip. */
  skipPaths: Set<string>;
}

interface KeyValueAssetConfig {
  category: keyof typeof COMPILE_EXCEPTIONS;
  directory: string;
  /** File extensions to consider (without leading dot). */
  extensions: string[];
  /** JSON root key that holds the key→value map. */
  rootKey: string;
  /** Output archive path for the combined file. */
  outputPath: string;
}

interface GeometryAssetConfig {
  category: "models";
  directory: string;
  extensions: string[];
  outputPath: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const KEY_VALUE_CONFIGS: KeyValueAssetConfig[] = [
  {
    category: "animations",
    directory: "animations",
    extensions: ["json"],
    rootKey: "animations",
    outputPath: "animations/pokebedrock_animations.json",
  },
  {
    category: "animation_controllers",
    directory: "animation_controllers",
    extensions: ["json"],
    rootKey: "animation_controllers",
    outputPath:
      "animation_controllers/pokebedrock_animation_controllers.json",
  },
  {
    category: "render_controllers",
    directory: "render_controllers",
    extensions: ["json"],
    rootKey: "render_controllers",
    outputPath: "render_controllers/pokebedrock_render_controllers.json",
  },
];

const MATERIALS_CONFIG: KeyValueAssetConfig = {
  category: "materials",
  directory: "materials",
  extensions: ["material"],
  rootKey: "materials",
  outputPath: "materials/pokebedrock.material",
};

const GEOMETRY_CONFIG: GeometryAssetConfig = {
  category: "models",
  directory: "models",
  extensions: ["json"],
  outputPath: "models/entity/pokebedrock_models.geo.json",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current)) {
      const full = path.join(current, entry);
      if (fs.lstatSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      const ext = entry.split(".").pop()?.toLowerCase();
      if (ext && extensions.includes(ext)) results.push(full);
    }
  };
  walk(dir);
  return results;
}

function readJsonFile(filePath: string): unknown | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const cleaned = removeCommentsFromJSON(raw);
    return JSON.parse(cleaned);
  } catch (err) {
    Logger.error(`Failed to parse ${filePath}: ${err}`);
    return null;
  }
}

function toRelative(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

/**
 * Compare two semver-like strings and return the higher one.
 */
function maxVersion(a: string, b: string): string {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return a;
    if (vb > va) return b;
  }
  return a;
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// ── Key-Value merge (animations, ACs, RCs) ───────────────────────────────────

function compileKeyValueAssets(
  config: KeyValueAssetConfig,
  skipPaths: Set<string>,
  generated: GeneratedEntry[]
) {
  const exceptions = new Set(COMPILE_EXCEPTIONS[config.category]);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const merged: Record<string, unknown> = {};
  const keyOrigins: Record<string, string> = {};
  const formatVersions: Map<string, string[]> = new Map();

  for (const filePath of files) {
    const relPath = toRelative(filePath);
    const data = readJsonFile(filePath) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") continue;

    const fv = data["format_version"] as string | undefined;
    if (fv) {
      if (!formatVersions.has(fv)) formatVersions.set(fv, []);
      formatVersions.get(fv)!.push(relPath);
    }

    const entries = data[config.rootKey] as Record<string, unknown> | undefined;
    if (!entries || typeof entries !== "object") continue;

    skipPaths.add(relPath);

    const exceptedForFile: Record<string, unknown> = {};
    let hasExcepted = false;

    for (const [key, value] of Object.entries(entries)) {
      if (exceptions.has(key)) {
        exceptedForFile[key] = value;
        hasExcepted = true;
        foundExceptions.add(key);
        continue;
      }

      if (key in merged) {
        if (!isEqual(merged[key], value)) {
          Logger.warn(
            `[combine] Duplicate key "${key}" in ${config.category} with differing values.\n` +
              `  Keeping version from: ${keyOrigins[key]}\n` +
              `  Discarding version from: ${relPath}`
          );
        }
        continue;
      }

      merged[key] = value;
      keyOrigins[key] = relPath;
    }

    if (hasExcepted) {
      const filtered: Record<string, unknown> = { format_version: fv };
      (filtered as Record<string, unknown>)[config.rootKey] = exceptedForFile;
      generated.push({
        archivePath: relPath,
        content: JSON.stringify(filtered),
      });
    }
  }

  // Warn about missing exception keys
  for (const key of exceptions) {
    if (!foundExceptions.has(key)) {
      Logger.warn(
        `[combine] Exception key "${key}" in ${config.category} was never found in any source file.`
      );
    }
  }

  if (Object.keys(merged).length === 0) return;

  // Resolve format_version
  let bestVersion = "1.8.0";
  for (const v of formatVersions.keys()) {
    bestVersion = maxVersion(bestVersion, v);
  }
  if (formatVersions.size > 1) {
    const versions = [...formatVersions.entries()]
      .map(([v, files]) => `  ${v} (${files.length} files, e.g. ${files[0]})`)
      .join("\n");
    Logger.warn(
      `[combine] Mixed format_version values in ${config.category}; using ${bestVersion}:\n${versions}`
    );
  }

  const combined: Record<string, unknown> = {
    format_version: bestVersion,
    [config.rootKey]: sortObjectKeys(merged),
  };

  generated.push({
    archivePath: config.outputPath,
    content: JSON.stringify(combined),
  });
}

// ── Materials merge ──────────────────────────────────────────────────────────

function compileMaterials(
  skipPaths: Set<string>,
  generated: GeneratedEntry[]
) {
  const config = MATERIALS_CONFIG;
  const exceptions = new Set(COMPILE_EXCEPTIONS.materials);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const merged: Record<string, unknown> = {};
  const keyOrigins: Record<string, string> = {};
  let bestVersion = "1.0.0";

  for (const filePath of files) {
    const relPath = toRelative(filePath);
    const data = readJsonFile(filePath) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") continue;

    const materials = data["materials"] as Record<string, unknown> | undefined;
    if (!materials || typeof materials !== "object") continue;

    skipPaths.add(relPath);

    const exceptedForFile: Record<string, unknown> = {};
    let hasExcepted = false;

    for (const [key, value] of Object.entries(materials)) {
      if (key === "version") {
        if (typeof value === "string") bestVersion = maxVersion(bestVersion, value);
        continue;
      }

      if (exceptions.has(key)) {
        exceptedForFile[key] = value;
        hasExcepted = true;
        foundExceptions.add(key);
        continue;
      }

      if (key in merged) {
        if (!isEqual(merged[key], value)) {
          Logger.warn(
            `[combine] Duplicate material key "${key}" with differing values.\n` +
              `  Keeping version from: ${keyOrigins[key]}\n` +
              `  Discarding version from: ${relPath}`
          );
        }
        continue;
      }

      merged[key] = value;
      keyOrigins[key] = relPath;
    }

    if (hasExcepted) {
      const filtered: Record<string, unknown> = {
        materials: { version: bestVersion, ...exceptedForFile },
      };
      let content = JSON.stringify(filtered, null, 2);
      content = content.replace(/\n/g, "\r\n");
      generated.push({ archivePath: relPath, content });
    }
  }

  for (const key of exceptions) {
    if (!foundExceptions.has(key)) {
      Logger.warn(
        `[combine] Exception material key "${key}" was never found in any source file.`
      );
    }
  }

  if (Object.keys(merged).length === 0) return;

  const combined: Record<string, unknown> = {
    materials: { version: bestVersion, ...sortObjectKeys(merged) },
  };

  let content = JSON.stringify(combined, null, 2);
  content = content.replace(/\n/g, "\r\n");
  generated.push({ archivePath: config.outputPath, content });
}

// ── Geometry merge ───────────────────────────────────────────────────────────

interface GeometryEntry {
  description: { identifier: string; [k: string]: unknown };
  [k: string]: unknown;
}

interface GeometryFile {
  format_version?: string;
  "minecraft:geometry"?: GeometryEntry[];
}

function compileGeometry(
  skipPaths: Set<string>,
  generated: GeneratedEntry[]
) {
  const config = GEOMETRY_CONFIG;
  const exceptions = new Set(COMPILE_EXCEPTIONS.models);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const mergedGeometries: GeometryEntry[] = [];
  const idOrigins: Record<string, string> = {};
  const formatVersions: Map<string, string[]> = new Map();

  for (const filePath of files) {
    const relPath = toRelative(filePath);
    const data = readJsonFile(filePath) as GeometryFile | null;
    if (!data || typeof data !== "object") continue;

    const geoArray = data["minecraft:geometry"];
    if (!Array.isArray(geoArray)) continue;

    const fv = data["format_version"] as string | undefined;
    if (fv) {
      if (!formatVersions.has(fv)) formatVersions.set(fv, []);
      formatVersions.get(fv)!.push(relPath);
    }

    skipPaths.add(relPath);

    const exceptedForFile: GeometryEntry[] = [];

    for (const geo of geoArray) {
      const id = geo?.description?.identifier;
      if (!id) {
        Logger.warn(`[combine] Geometry entry without identifier in ${relPath}, skipping.`);
        continue;
      }

      if (exceptions.has(id)) {
        exceptedForFile.push(geo);
        foundExceptions.add(id);
        continue;
      }

      if (id in idOrigins) {
        const existing = mergedGeometries.find(
          (g) => g.description.identifier === id
        );
        if (existing && !isEqual(existing, geo)) {
          Logger.warn(
            `[combine] Duplicate geometry identifier "${id}" with differing values.\n` +
              `  Keeping version from: ${idOrigins[id]}\n` +
              `  Discarding version from: ${relPath}`
          );
        }
        continue;
      }

      mergedGeometries.push(geo);
      idOrigins[id] = relPath;
    }

    if (exceptedForFile.length > 0) {
      const filtered: Record<string, unknown> = {
        format_version: fv,
        "minecraft:geometry": exceptedForFile,
      };
      generated.push({
        archivePath: relPath,
        content: JSON.stringify(filtered),
      });
    }
  }

  for (const key of exceptions) {
    if (!foundExceptions.has(key)) {
      Logger.warn(
        `[combine] Exception geometry identifier "${key}" was never found in any source file.`
      );
    }
  }

  if (mergedGeometries.length === 0) return;

  mergedGeometries.sort((a, b) => {
    const aId = a.description.identifier.toLowerCase();
    const bId = b.description.identifier.toLowerCase();
    if (aId < bId) return -1;
    if (aId > bId) return 1;
    return a.description.identifier < b.description.identifier ? -1 : 1;
  });

  let bestVersion = "1.12.0";
  for (const v of formatVersions.keys()) {
    bestVersion = maxVersion(bestVersion, v);
  }
  if (formatVersions.size > 1) {
    const versions = [...formatVersions.entries()]
      .map(([v, files]) => `  ${v} (${files.length} files, e.g. ${files[0]})`)
      .join("\n");
    Logger.warn(
      `[combine] Mixed format_version values in models; using ${bestVersion}:\n${versions}`
    );
  }

  const combined = {
    format_version: bestVersion,
    "minecraft:geometry": mergedGeometries,
  };

  generated.push({
    archivePath: config.outputPath,
    content: JSON.stringify(combined),
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export function compileCombinedAssets(): CombineResult {
  const skipPaths = new Set<string>();
  const generatedEntries: GeneratedEntry[] = [];

  Logger.info("[combine] Compiling combined assets...");

  for (const config of KEY_VALUE_CONFIGS) {
    compileKeyValueAssets(config, skipPaths, generatedEntries);
    Logger.info(`[combine]  ✓ ${config.category}`);
  }

  compileMaterials(skipPaths, generatedEntries);
  Logger.info("[combine]  ✓ materials");

  compileGeometry(skipPaths, generatedEntries);
  Logger.info("[combine]  ✓ models (geometry)");

  const combinedCount = generatedEntries.filter(
    (e) => e.archivePath.includes("pokebedrock_") || e.archivePath.includes("pokebedrock.")
  ).length;
  const exceptionFileCount = generatedEntries.length - combinedCount;

  Logger.info(
    `[combine] Done — ${combinedCount} combined files, ${exceptionFileCount} exception files, ${skipPaths.size} original files replaced.`
  );

  return { generatedEntries, skipPaths };
}
