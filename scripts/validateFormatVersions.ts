import fs from "fs";
import path from "path";

import { collectFiles, readJsonFileStrippingComments } from "./utils";

/**
 * Minimum `format_version` per resource-pack asset category.
 *
 * Keys mirror directory layout except `attachableClient`, which applies to
 * first-person / item-slot attachables under `attachables/`.
 */
export const REQUIRED_FORMAT_VERSIONS = {
  geometry: "1.21.0",
  animations: "1.10.0",
  animation_controllers: "1.18.20",
  render_controllers: "1.10.0",
  particles: "1.10.0",
  entity: "1.18.3",
  attachable: "1.10.0",
  attachableClient: "1.16.100",
  sounds: "1.20.20",
} as const;

/** Top-level directories walked for per-file `format_version` checks. */
const SCAN_DIRS = [
  "models",
  "animations",
  "animation_controllers",
  "render_controllers",
  "entity",
  "particles",
  "attachables",
] as const;

/** Attachable basenames that require {@link REQUIRED_FORMAT_VERSIONS.attachableClient}. */
const ATTACHABLE_CLIENT_FILES = new Set([
  "held_pokeball.json",
  "held_backpack.json",
  "mega_ring.json",
]);

/**
 * Compares two dotted semantic version strings component-wise.
 *
 * @param a First version string (e.g. `"1.10.0"`).
 * @param b Second version string.
 * @returns `-1` if `a < b`, `1` if `a > b`, otherwise `0`.
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

/**
 * @param version Version to test.
 * @param minimum Inclusive minimum version.
 * @returns true when `version >= minimum`.
 */
function isAtLeast(version: string, minimum: string): boolean {
  return compareVersions(version, minimum) >= 0;
}

/**
 * Resolves the required minimum `format_version` for a pack-relative JSON path.
 *
 * Attachables under `attachables/balls/` or listed in
 * {@link ATTACHABLE_CLIENT_FILES}, or whose raw source references
 * `c.item_slot` / `c.is_first_person`, use `attachableClient`.
 *
 * Generator templates under `scripts/templates/` are mapped by filename suffix.
 *
 * @param relPath Pack-relative path with forward slashes.
 * @param raw Unparsed file contents (used for attachable client-tier detection).
 * @returns Required minimum version, or `null` when this path is not validated.
 */
function getRequired(relPath: string, raw: string): string | null {
  const rel = relPath.replace(/\\/g, "/");
  if (rel.startsWith("models/")) return REQUIRED_FORMAT_VERSIONS.geometry;
  if (rel.startsWith("animations/")) return REQUIRED_FORMAT_VERSIONS.animations;
  if (rel.startsWith("animation_controllers/"))
    return REQUIRED_FORMAT_VERSIONS.animation_controllers;
  if (rel.startsWith("render_controllers/"))
    return REQUIRED_FORMAT_VERSIONS.render_controllers;
  if (rel.startsWith("particles/")) return REQUIRED_FORMAT_VERSIONS.particles;
  if (rel.startsWith("entity/")) return REQUIRED_FORMAT_VERSIONS.entity;
  if (rel === "sounds/sound_definitions.json") return REQUIRED_FORMAT_VERSIONS.sounds;
  if (rel.startsWith("scripts/templates/")) {
    if (rel.endsWith(".rc.json")) return REQUIRED_FORMAT_VERSIONS.render_controllers;
    if (rel.includes("animation_controller"))
      return REQUIRED_FORMAT_VERSIONS.animation_controllers;
    if (rel.endsWith(".entity.json")) return REQUIRED_FORMAT_VERSIONS.entity;
    return null;
  }
  if (!rel.startsWith("attachables/")) return null;

  const base = path.posix.basename(rel);
  if (
    rel.includes("/balls/") ||
    ATTACHABLE_CLIENT_FILES.has(base) ||
    raw.includes("c.item_slot") ||
    raw.includes("c.is_first_person")
  )
    return REQUIRED_FORMAT_VERSIONS.attachableClient;
  return REQUIRED_FORMAT_VERSIONS.attachable;
}

/**
 * Validates one JSON asset's `format_version` and geometry root shape.
 *
 * @param relPath Pack-relative path to the file.
 * @param raw Unparsed file contents (passed through to {@link getRequired}).
 * @returns Human-readable error messages; empty when the file passes or is skipped.
 */
function validateFile(relPath: string, raw: string): string[] {
  const data = readJsonFileStrippingComments(
    path.join(process.cwd(), relPath),
  ) as Record<string, unknown> | null;
  if (!data || typeof data !== "object") return [];

  const errors: string[] = [];
  const rel = relPath.replace(/\\/g, "/");

  if (rel.startsWith("models/")) {
    const legacyKey = Object.keys(data).find((k) => k.startsWith("geometry."));
    if (legacyKey) {
      errors.push(
        `${rel}: legacy geometry root "${legacyKey}" — use minecraft:geometry.`,
      );
      return errors;
    }
    if (!Array.isArray(data["minecraft:geometry"])) return errors;
  }

  const required = getRequired(rel, raw);
  if (!required) return errors;

  const version = data["format_version"];
  if (typeof version !== "string") {
    errors.push(`${rel}: missing format_version.`);
    return errors;
  }

  if (!isAtLeast(version, required)) {
    errors.push(
      `${rel}: format_version "${version}" is below required "${required}".`,
    );
  }

  return errors;
}

/**
 * Walks {@link SCAN_DIRS}, `scripts/templates/`, and `sounds/sound_definitions.json`.
 * Exits with code `1` when any file fails validation.
 */
function main(): void {
  const errors: string[] = [];

  for (const dir of SCAN_DIRS) {
    for (const filePath of collectFiles(dir, ["json"])) {
      const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
      const raw = fs.readFileSync(filePath, "utf8");
      errors.push(...validateFile(relPath, raw));
    }
  }

  for (const filePath of collectFiles("scripts/templates", ["json"])) {
    const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    const raw = fs.readFileSync(filePath, "utf8");
    errors.push(...validateFile(relPath, raw));
  }

  const soundPath = path.join("sounds", "sound_definitions.json");
  if (fs.existsSync(soundPath)) {
    const relPath = "sounds/sound_definitions.json";
    errors.push(...validateFile(relPath, fs.readFileSync(soundPath, "utf8")));
  }

  if (errors.length === 0) {
    console.log("✅ Resource pack format_version validation passed.");
    return;
  }

  console.error(
    `\n❌ Format version validation failed (${errors.length} error(s)):\n`,
  );
  for (const error of errors.slice(0, 50)) console.error(`  ${error}`);
  if (errors.length > 50)
    console.error(`  ... and ${errors.length - 50} more`);
  process.exit(1);
}

if (require.main === module) main();
