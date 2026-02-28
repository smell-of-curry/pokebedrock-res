import isEqual from "lodash/isEqual";
import {
  Logger,
  collectFiles,
  readJsonFileStrippingComments,
  toRelativePath,
  maxVersion,
  sortObjectKeys,
} from "./utils";
import { COMPILE_EXCEPTIONS } from "./data/compileExceptions";
import type {
  CombineGeometryFile,
  CombineResult,
  GeneratedEntry,
  GeometryAssetConfig,
  GeometryEntry,
  KeyValueAssetConfig,
} from "./types";

/** Key-value asset categories: directory, rootKey and output path are derived from the name. */
export const KEY_VALUE_CATEGORIES = [
  "animations",
  "animation_controllers",
  "render_controllers",
  "materials",
] as const;

const GEOMETRY_OUTPUT_PATH = "models/entity/pokebedrock_models.geo.json";

/**
 * Builds a key-value asset config from a category name.
 * Directory, rootKey, extensions and output path are derived from the category.
 *
 * @param category - One of the key-value asset categories (animations, animation_controllers, render_controllers, materials).
 * @returns Full config used by the key-value merge logic.
 */
function getKeyValueConfig(
  category: (typeof KEY_VALUE_CATEGORIES)[number],
): KeyValueAssetConfig {
  const ext = category === "materials" ? "material" : "json";
  const outputName =
    category === "materials"
      ? "pokebedrock.material"
      : `pokebedrock_${category}.json`;
  return {
    category,
    directory: category,
    extensions: [ext],
    rootKey: category,
    outputPath: `${category}/${outputName}`,
  };
}

/**
 * Merges all JSON key-value assets of one category (animations, animation_controllers, or render_controllers)
 * into a single combined file. Keys listed in {@link COMPILE_EXCEPTIONS} remain in filtered per-source files.
 *
 * @param config - Asset config (directory, rootKey, outputPath, etc.).
 * @param skipPaths - Set to which original file paths are added so the archiver skips them.
 * @param generated - Array to which combined and exception-file entries are pushed.
 */
function compileKeyValueAssets(
  config: KeyValueAssetConfig,
  skipPaths: Set<string>,
  generated: GeneratedEntry[],
) {
  const exceptions = new Set<string>(COMPILE_EXCEPTIONS[config.category]);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const merged: Record<string, unknown> = {};
  const keyOrigins: Record<string, string> = {};
  const formatVersions: Map<string, string[]> = new Map();

  for (const filePath of files) {
    const relPath = toRelativePath(filePath);
    const data = readJsonFileStrippingComments(filePath) as Record<
      string,
      unknown
    > | null;
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
        if (!isEqual(merged[key], value))
          Logger.warn(
            `[combine] Duplicate key "${key}" in ${config.category} with differing values.\n` +
              `  Keeping version from: ${keyOrigins[key]}\n` +
              `  Discarding version from: ${relPath}`,
          );
        continue;
      }

      merged[key] = value;
      keyOrigins[key] = relPath;
    }

    if (!hasExcepted) continue;
    const filtered: Record<string, unknown> = { format_version: fv };
    (filtered as Record<string, unknown>)[config.rootKey] = exceptedForFile;
    generated.push({
      archivePath: relPath,
      content: JSON.stringify(filtered),
    });
  }

  for (const key of exceptions) {
    if (foundExceptions.has(key)) continue;
    Logger.warn(
      `[combine] Exception key "${key}" in ${config.category} was never found in any source file.`,
    );
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
      `[combine] Mixed format_version values in ${config.category}; using ${bestVersion}:\n${versions}`,
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

/**
 * Merges all `.material` files into a single combined material file.
 * Handles the `materials.version` field and outputs CRLF line endings.
 * Keys listed in {@link COMPILE_EXCEPTIONS}.materials remain in filtered per-source files.
 *
 * @param skipPaths - Set to which original file paths are added so the archiver skips them.
 * @param generated - Array to which combined and exception-file entries are pushed.
 */
function compileMaterials(skipPaths: Set<string>, generated: GeneratedEntry[]) {
  const config = getKeyValueConfig("materials");
  const exceptions = new Set<string>(COMPILE_EXCEPTIONS.materials);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const merged: Record<string, unknown> = {};
  const keyOrigins: Record<string, string> = {};
  let bestVersion = "1.0.0";

  for (const filePath of files) {
    const relPath = toRelativePath(filePath);
    const data = readJsonFileStrippingComments(filePath) as Record<
      string,
      unknown
    > | null;
    if (!data || typeof data !== "object") continue;

    const materials = data["materials"] as Record<string, unknown> | undefined;
    if (!materials || typeof materials !== "object") continue;

    skipPaths.add(relPath);

    const exceptedForFile: Record<string, unknown> = {};
    let hasExcepted = false;

    for (const [key, value] of Object.entries(materials)) {
      if (key === "version") {
        if (typeof value === "string")
          bestVersion = maxVersion(bestVersion, value);
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
              `  Discarding version from: ${relPath}`,
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
    if (foundExceptions.has(key)) continue;
    Logger.warn(
      `[combine] Exception material key "${key}" was never found in any source file.`,
    );
  }

  if (Object.keys(merged).length === 0) return;

  const combined: Record<string, unknown> = {
    materials: { version: bestVersion, ...sortObjectKeys(merged) },
  };

  let content = JSON.stringify(combined, null, 2);
  content = content.replace(/\n/g, "\r\n");
  generated.push({ archivePath: config.outputPath, content });
}

/**
 * Merges all geometry JSON files (minecraft:geometry array) into a single combined file.
 * Geometry identifiers listed in {@link COMPILE_EXCEPTIONS}.models remain in filtered per-source files.
 * Merged geometries are sorted by identifier (case-insensitive).
 *
 * @param skipPaths - Set to which original file paths are added so the archiver skips them.
 * @param generated - Array to which combined and exception-file entries are pushed.
 */
function compileGeometry(skipPaths: Set<string>, generated: GeneratedEntry[]) {
  const config: GeometryAssetConfig = {
    category: "models",
    directory: "models",
    extensions: ["json"],
    outputPath: GEOMETRY_OUTPUT_PATH,
  };
  const exceptions = new Set<string>(COMPILE_EXCEPTIONS.models);
  const foundExceptions = new Set<string>();

  const files = collectFiles(config.directory, config.extensions);
  if (files.length === 0) return;

  const mergedGeometries: GeometryEntry[] = [];
  const idOrigins: Record<string, string> = {};
  const formatVersions: Map<string, string[]> = new Map();

  for (const filePath of files) {
    const relPath = toRelativePath(filePath);
    const data = readJsonFileStrippingComments(
      filePath,
    ) as CombineGeometryFile | null;
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
        Logger.warn(
          `[combine] Geometry entry without identifier in ${relPath}, skipping.`,
        );
        continue;
      }

      if (exceptions.has(id)) {
        exceptedForFile.push(geo);
        foundExceptions.add(id);
        continue;
      }

      if (id in idOrigins) {
        const existing = mergedGeometries.find(
          (g) => g.description.identifier === id,
        );
        if (existing && !isEqual(existing, geo))
          Logger.warn(
            `[combine] Duplicate geometry identifier "${id}" with differing values.\n` +
              `  Keeping version from: ${idOrigins[id]}\n` +
              `  Discarding version from: ${relPath}`,
          );
        continue;
      }

      mergedGeometries.push(geo);
      idOrigins[id] = relPath;
    }

    if (exceptedForFile.length === 0) continue;
    const filtered: Record<string, unknown> = {
      format_version: fv,
      "minecraft:geometry": exceptedForFile,
    };
    generated.push({
      archivePath: relPath,
      content: JSON.stringify(filtered),
    });
  }

  for (const key of exceptions) {
    if (foundExceptions.has(key)) continue;
    Logger.warn(
      `[combine] Exception geometry identifier "${key}" was never found in any source file.`,
    );
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
      `[combine] Mixed format_version values in models; using ${bestVersion}:\n${versions}`,
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

/**
 * Compiles combined asset files for the resource pack build.
 * Walks animations, animation_controllers, render_controllers, materials, and models,
 * merges them into one file per type, and returns virtual entries plus paths to skip during archiving.
 *
 * @returns Object with `generatedEntries` (combined + exception files to inject) and `skipPaths` (original paths the archiver must not include).
 */
export function compileCombinedAssets(): CombineResult {
  const skipPaths = new Set<string>();
  const generatedEntries: GeneratedEntry[] = [];

  Logger.info("[combine] Compiling combined assets...");

  for (const category of KEY_VALUE_CATEGORIES) {
    const config = getKeyValueConfig(category);
    if (category === "materials") compileMaterials(skipPaths, generatedEntries);
    else compileKeyValueAssets(config, skipPaths, generatedEntries);

    Logger.info(`[combine]  ✓ ${config.category}`);
  }

  compileGeometry(skipPaths, generatedEntries);
  Logger.info("[combine]  ✓ models (geometry)");

  const combinedCount = generatedEntries.filter(
    (e) =>
      e.archivePath.includes("pokebedrock_") ||
      e.archivePath.includes("pokebedrock."),
  ).length;
  const exceptionFileCount = generatedEntries.length - combinedCount;

  Logger.info(
    `[combine] Done — ${combinedCount} combined files, ${exceptionFileCount} exception files, ${skipPaths.size} original files replaced.`,
  );

  return { generatedEntries, skipPaths };
}
